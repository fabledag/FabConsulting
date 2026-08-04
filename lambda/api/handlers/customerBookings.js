'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  UpdateCommand,
  GetCommand,
  TransactWriteCommand,
} = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const { checkSlotAvailable } = require('./bookings');
const { sendEmail, emailLayout } = require('../utils/email');
const { sendBookingInvites } = require('../utils/bookingCalendar');
const { notifyAdminOfPendingBooking } = require('../utils/adminNotify');
const { createNotification } = require('../utils/notify');

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

const BOOKINGS_TABLE = process.env.BOOKINGS_TABLE;
const PACKAGES_TABLE = process.env.PACKAGES_TABLE;

const RESCHEDULE_WINDOW_MS = 24 * 60 * 60 * 1000;
const VALID_SERVICES = ['session', 'mock', 'cv', 'portfolio', 'mentoria'];

function slotDateTime(date, time) {
  return new Date(`${date}T${time}:00`);
}

function withinModifyWindow(booking) {
  return slotDateTime(booking.date, booking.time).getTime() - Date.now() >= RESCHEDULE_WINDOW_MS;
}

/**
 * GET /me/bookings?scope=upcoming
 */
async function listMyBookings(email, queryParams) {
  try {
    const result = await ddb.send(
      new QueryCommand({
        TableName: BOOKINGS_TABLE,
        IndexName: 'email-date-index',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': email },
      })
    );

    let items = result.Items || [];
    if (queryParams?.scope === 'upcoming') {
      const today = new Date().toISOString().split('T')[0];
      items = items.filter((b) => b.date >= today && b.status !== 'cancelled');
    }

    items.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

    const bookings = items.map((b) => ({
      ...b,
      canModify: (b.status === 'pending' || b.status === 'confirmed') && withinModifyWindow(b),
    }));

    return { statusCode: 200, body: { bookings } };
  } catch (err) {
    console.error('listMyBookings error:', err);
    return { statusCode: 500, body: { error: 'No se pudieron cargar las reservas.' } };
  }
}

/**
 * POST /me/bookings
 * Body: { date, time, service, name, linkedin?, message?, packageId? }
 */
async function createCustomerBooking(email, body) {
  if (!body) return { statusCode: 400, body: { error: 'Faltan datos en la solicitud.' } };

  const { date, time, service, name = '', linkedin = '', message = '', packageId } = body;
  const errors = [];
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push('La fecha debe tener el formato AAAA-MM-DD.');
  if (!time || !/^\d{2}:\d{2}$/.test(time)) errors.push('La hora debe tener el formato HH:MM.');
  if (!service || !VALID_SERVICES.includes(service)) errors.push(`service must be one of: ${VALID_SERVICES.join(', ')}.`);
  if (!name || typeof name !== 'string' || name.trim().length < 2) errors.push('El nombre debe tener al menos 2 caracteres.');
  if (errors.length) return { statusCode: 400, body: { errors } };

  try {
    let pkg = null;
    if (packageId) {
      const pkgResult = await ddb.send(new GetCommand({ TableName: PACKAGES_TABLE, Key: { id: packageId } }));
      pkg = pkgResult.Item;
      if (!pkg || pkg.email !== email) {
        return { statusCode: 403, body: { error: 'Este paquete no está asociado a tu cuenta.' } };
      }
      if (pkg.status !== 'active' || pkg.remainingCredits <= 0) {
        return { statusCode: 409, body: { error: 'Ya no te quedan sesiones en este paquete.' } };
      }
    }

    const availability = await checkSlotAvailable(date, time);
    if (!availability.ok) {
      return { statusCode: availability.statusCode, body: { error: availability.error } };
    }

    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const booking = {
      id,
      date,
      time,
      email,
      name: name.trim(),
      linkedin: linkedin.trim(),
      service,
      message: message.trim(),
      status: packageId ? 'confirmed' : 'pending',
      durationMinutes: availability.durationMinutes,
      packageId: packageId || null,
      createdAt,
    };

    if (packageId) {
      try {
        await ddb.send(
          new UpdateCommand({
            TableName: PACKAGES_TABLE,
            Key: { id: packageId },
            UpdateExpression: 'SET usedCredits = usedCredits + :one, remainingCredits = remainingCredits - :one',
            ConditionExpression: 'remainingCredits > :zero',
            ExpressionAttributeValues: { ':one': 1, ':zero': 0 },
          })
        );
      } catch (err) {
        if (err.name === 'ConditionalCheckFailedException') {
          return { statusCode: 409, body: { error: 'Ya no te quedan sesiones en este paquete.' } };
        }
        throw err;
      }
    }

    await ddb.send(new PutCommand({ TableName: BOOKINGS_TABLE, Item: booking }));

    // Credit-paid bookings are confirmed on the spot, so the calendar invites
    // go out now. Card payments confirm through the Mercado Pago webhook a
    // few seconds later; until then she just gets a heads-up email.
    if (packageId) {
      await sendBookingInvites(booking, { durationMinutes: availability.durationMinutes });
    } else {
      await notifyAdminOfPendingBooking(booking);
    }

    const title = packageId ? 'Sesión confirmada' : 'Sesión agendada — pendiente de pago';
    // Only for pending bookings: a credit-paid one already got the richer
    // confirmation email with the calendar invite attached, and two emails for
    // one booking reads as a bug.
    try {
      if (!packageId) await sendEmail({
        to: email,
        subject: `${title} — ${date} ${time}`,
        html: emailLayout({
          headerSubtitle: title,
          bodyHtml: `
            <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">
              ${packageId
                ? 'Tu sesión quedó confirmada usando uno de tus créditos disponibles.'
                : 'Tu sesión quedó registrada. Se confirmará una vez recibido el pago.'}
            </p>
            <p style="margin:0;color:#374151;font-size:15px;"><strong>Fecha:</strong> ${date}</p>
            <p style="margin:0;color:#374151;font-size:15px;"><strong>Hora:</strong> ${time}</p>
          `,
        }),
      });
    } catch (emailErr) {
      console.error('createCustomerBooking email error:', emailErr);
    }

    await createNotification(email, {
      type: packageId ? 'booking_confirmed' : 'booking_pending',
      title,
      body: `${date} ${time}`,
      relatedBookingId: id,
      relatedPackageId: packageId || null,
    });

    return { statusCode: 201, body: { booking } };
  } catch (err) {
    console.error('createCustomerBooking error:', err);
    return { statusCode: 500, body: { error: 'No se pudo crear la reserva. Inténtalo de nuevo.' } };
  }
}

async function getOwnedBooking(email, id) {
  const result = await ddb.send(
    new QueryCommand({
      TableName: BOOKINGS_TABLE,
      IndexName: 'id-index',
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: { ':id': id },
      Limit: 1,
    })
  );
  const booking = result.Items?.[0];
  if (!booking) return { errorResponse: { statusCode: 404, body: { error: 'No encontramos esa reserva.' } } };
  if (booking.email !== email) return { errorResponse: { statusCode: 403, body: { error: 'Esta reserva no está asociada a tu cuenta.' } } };
  if (booking.status === 'cancelled') return { errorResponse: { statusCode: 400, body: { error: 'Esta reserva ya estaba cancelada.' } } };
  return { booking };
}

const RESCHEDULE_BLOCKED_MSG =
  'El plazo para reagendar ya pasó. Escríbele directamente a Fabiola para hacer cambios dentro de las 24 horas previas a tu sesión.';
const CANCEL_BLOCKED_MSG =
  'El plazo para cancelar ya pasó. Escríbele directamente a Fabiola para hacer cambios dentro de las 24 horas previas a tu sesión.';

/**
 * PUT /me/bookings/{id}/reschedule
 * Body: { date, time }
 */
async function rescheduleMyBooking(email, id, body) {
  if (!body || !body.date || !body.time) {
    return { statusCode: 400, body: { error: 'date and time are required.' } };
  }

  const owned = await getOwnedBooking(email, id).catch((err) => {
    console.error('rescheduleMyBooking lookup error:', err);
    return { errorResponse: { statusCode: 500, body: { error: 'No se pudo cargar la reserva.' } } };
  });
  if (owned.errorResponse) return owned.errorResponse;
  const { booking } = owned;

  if (!withinModifyWindow(booking)) {
    return { statusCode: 403, body: { error: RESCHEDULE_BLOCKED_MSG } };
  }

  try {
    const availability = await checkSlotAvailable(body.date, body.time);
    if (!availability.ok) {
      return { statusCode: availability.statusCode, body: { error: availability.error } };
    }

    const newId = uuidv4();
    const now = new Date().toISOString();
    const newBooking = {
      ...booking,
      id: newId,
      date: body.date,
      time: body.time,
      durationMinutes: availability.durationMinutes,
      rescheduledFromId: booking.id,
      rescheduledToId: null,
      createdAt: now,
    };

    await ddb.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Update: {
              TableName: BOOKINGS_TABLE,
              Key: { id: booking.id, date: booking.date },
              UpdateExpression: 'SET #status = :cancelled, rescheduledToId = :newId, updatedAt = :now',
              ExpressionAttributeNames: { '#status': 'status' },
              ExpressionAttributeValues: { ':cancelled': 'cancelled', ':newId': newId, ':now': now },
            },
          },
          { Put: { TableName: BOOKINGS_TABLE, Item: newBooking } },
        ],
      })
    );

    try {
      await sendEmail({
        to: email,
        subject: `Sesión reagendada — ${body.date} ${body.time}`,
        html: emailLayout({
          headerSubtitle: 'Sesión reagendada',
          bodyHtml: `
            <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">Tu sesión fue reagendada.</p>
            <p style="margin:0;color:#374151;font-size:15px;"><strong>Antes:</strong> ${booking.date} ${booking.time}</p>
            <p style="margin:0;color:#374151;font-size:15px;"><strong>Ahora:</strong> ${body.date} ${body.time}</p>
          `,
        }),
      });
    } catch (emailErr) {
      console.error('rescheduleMyBooking email error:', emailErr);
    }

    await createNotification(email, {
      type: 'booking_rescheduled',
      title: 'Sesión reagendada',
      body: `${booking.date} ${booking.time} → ${body.date} ${body.time}`,
      relatedBookingId: newId,
      relatedPackageId: booking.packageId || null,
    });

    return { statusCode: 200, body: { booking: newBooking } };
  } catch (err) {
    console.error('rescheduleMyBooking error:', err);
    return { statusCode: 500, body: { error: 'No se pudo reagendar la reserva.' } };
  }
}

/**
 * POST /me/bookings/{id}/cancel
 */
async function cancelMyBooking(email, id) {
  const owned = await getOwnedBooking(email, id).catch((err) => {
    console.error('cancelMyBooking lookup error:', err);
    return { errorResponse: { statusCode: 500, body: { error: 'No se pudo cargar la reserva.' } } };
  });
  if (owned.errorResponse) return owned.errorResponse;
  const { booking } = owned;

  if (!withinModifyWindow(booking)) {
    return { statusCode: 403, body: { error: CANCEL_BLOCKED_MSG } };
  }

  try {
    await ddb.send(
      new UpdateCommand({
        TableName: BOOKINGS_TABLE,
        Key: { id: booking.id, date: booking.date },
        UpdateExpression: 'SET #status = :cancelled, updatedAt = :now',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':cancelled': 'cancelled', ':now': new Date().toISOString() },
      })
    );

    if (booking.packageId) {
      await ddb.send(
        new UpdateCommand({
          TableName: PACKAGES_TABLE,
          Key: { id: booking.packageId },
          UpdateExpression: 'SET usedCredits = usedCredits - :one, remainingCredits = remainingCredits + :one',
          ExpressionAttributeValues: { ':one': 1 },
        })
      );
    }

    // Free the slot on both calendars. Only confirmed bookings ever created an
    // event, so a pending one has nothing to withdraw.
    if (booking.status === 'confirmed') {
      await sendBookingInvites(booking, {
        durationMinutes: booking.durationMinutes || 60,
        cancelled: true,
      });
    }

    try {
      await sendEmail({
        to: email,
        subject: `Sesión cancelada — ${booking.date} ${booking.time}`,
        html: emailLayout({
          headerSubtitle: 'Sesión cancelada',
          bodyHtml: `
            <p style="margin:0;color:#374151;font-size:15px;line-height:1.7;">
              Tu sesión del ${booking.date} a las ${booking.time} fue cancelada.
              ${booking.packageId ? 'El crédito de tu paquete quedó disponible de nuevo.' : ''}
            </p>
          `,
        }),
      });
    } catch (emailErr) {
      console.error('cancelMyBooking email error:', emailErr);
    }

    await createNotification(email, {
      type: 'booking_cancelled',
      title: 'Sesión cancelada',
      body: `${booking.date} ${booking.time}`,
      relatedBookingId: booking.id,
      relatedPackageId: booking.packageId || null,
    });

    return { statusCode: 200, body: { message: 'Booking cancelled.' } };
  } catch (err) {
    console.error('cancelMyBooking error:', err);
    return { statusCode: 500, body: { error: 'No se pudo cancelar la reserva.' } };
  }
}

module.exports = { listMyBookings, createCustomerBooking, rescheduleMyBooking, cancelMyBooking };
