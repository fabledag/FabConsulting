'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
  GetCommand,
} = require('@aws-sdk/lib-dynamodb');

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

const { nowInMexicoCity } = require('../utils/time');

const AVAILABILITY_TABLE = process.env.AVAILABILITY_TABLE;
const BLOCKED_DATES_TABLE = process.env.BLOCKED_DATES_TABLE;
const BOOKINGS_TABLE = process.env.BOOKINGS_TABLE;

// Day names for display
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Pad a number to two digits.
 */
function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Format a Date as YYYY-MM-DD in local time.
 */
function toDateString(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * GET /availability?year=2026&month=4
 * Returns available slots for the requested month.
 */
async function getPublicAvailability(queryParams) {
  const now = new Date();
  const year = parseInt(queryParams?.year || now.getFullYear(), 10);
  const month = parseInt(queryParams?.month || now.getMonth() + 1, 10);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return { statusCode: 400, body: { error: 'El año o el mes no son válidos.' } };
  }

  try {
    // Fetch all active weekly availability rules
    const availResult = await ddb.send(
      new ScanCommand({
        TableName: AVAILABILITY_TABLE,
        FilterExpression: '#active = :true',
        ExpressionAttributeNames: { '#active': 'active' },
        ExpressionAttributeValues: { ':true': true },
      })
    );
    const rules = availResult.Items || [];

    // Build map: dayOfWeek → sorted list of time slots
    const rulesByDay = {};
    for (const rule of rules) {
      const dow = rule.dayOfWeek;
      if (!rulesByDay[dow]) rulesByDay[dow] = [];
      rulesByDay[dow].push({
        time: rule.timeSlot,
        durationMinutes: rule.durationMinutes || 60,
        pk: rule.pk,
        sk: rule.sk,
      });
    }
    for (const dow of Object.keys(rulesByDay)) {
      rulesByDay[dow].sort((a, b) => a.time.localeCompare(b.time));
    }

    // Fetch blocked dates for the month
    const monthPrefix = `${year}-${pad(month)}`;
    const blockedResult = await ddb.send(
      new ScanCommand({
        TableName: BLOCKED_DATES_TABLE,
        FilterExpression: 'begins_with(#date, :prefix)',
        ExpressionAttributeNames: { '#date': 'date' },
        ExpressionAttributeValues: { ':prefix': monthPrefix },
      })
    );
    const blockedSet = new Set((blockedResult.Items || []).map((i) => i.date));

    // Fetch all bookings for the month (using date-time-index GSI)
    const bookingsResult = await ddb.send(
      new ScanCommand({
        TableName: BOOKINGS_TABLE,
        FilterExpression: 'begins_with(#date, :prefix) AND #status <> :cancelled',
        ExpressionAttributeNames: { '#date': 'date', '#status': 'status' },
        ExpressionAttributeValues: { ':prefix': monthPrefix, ':cancelled': 'cancelled' },
      })
    );
    // Map: "date#time" → true
    const bookedSet = new Set(
      (bookingsResult.Items || []).map((b) => `${b.date}#${b.time}`)
    );

    // Build calendar.
    //
    // "Today" and "now" come from the Mexico City clock, not the Lambda's UTC
    // one — otherwise this drops or keeps the wrong day for six hours either
    // side of midnight. See utils/time.js.
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const { date: today, time: nowTime } = nowInMexicoCity();
    const calendar = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${pad(month)}-${pad(day)}`;
      const dow = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

      // Skip past dates
      if (dateStr < today) continue;

      const slots = [];

      if (!blockedSet.has(dateStr) && rulesByDay[dow]) {
        for (const rule of rulesByDay[dow]) {
          // Drop slots whose start time has already passed today. They used to
          // be listed as available and then rejected on submit with "Cannot
          // book a slot in the past" — the error had no visible cause.
          if (dateStr === today && rule.time <= nowTime) continue;

          // Taken slots are omitted entirely rather than returned as
          // `available: false`: the picker only ever shows what's bookable.
          if (bookedSet.has(`${dateStr}#${rule.time}`)) continue;

          slots.push({
            time: rule.time,
            durationMinutes: rule.durationMinutes,
            available: true,
          });
        }
      }

      calendar.push({
        date: dateStr,
        dayOfWeek: DAY_NAMES[dow],
        blocked: blockedSet.has(dateStr),
        slots,
      });
    }

    return {
      statusCode: 200,
      body: { year, month, calendar },
    };
  } catch (err) {
    console.error('getPublicAvailability error:', err);
    return { statusCode: 500, body: { error: 'No se pudo cargar la disponibilidad.' } };
  }
}

/**
 * GET /admin/availability
 * Returns all availability rules (admin only).
 */
async function adminGetAvailability() {
  try {
    const result = await ddb.send(new ScanCommand({ TableName: AVAILABILITY_TABLE }));
    const rules = (result.Items || []).sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
      return a.timeSlot.localeCompare(b.timeSlot);
    });
    return { statusCode: 200, body: { rules } };
  } catch (err) {
    console.error('adminGetAvailability error:', err);
    return { statusCode: 500, body: { error: 'No se pudieron cargar los horarios.' } };
  }
}

/**
 * POST /admin/availability
 * Creates or updates a weekly availability rule.
 * Body: { dayOfWeek (0-6), timeSlot ("09:00"), durationMinutes (60), active }
 */
async function adminSetAvailability(body) {
  if (!body) return { statusCode: 400, body: { error: 'Faltan datos en la solicitud.' } };

  const { dayOfWeek, timeSlot, durationMinutes = 60, active = true } = body;

  if (dayOfWeek === undefined || dayOfWeek === null || dayOfWeek < 0 || dayOfWeek > 6) {
    return { statusCode: 400, body: { error: 'El día de la semana debe ir de 0 (domingo) a 6 (sábado).' } };
  }
  if (!timeSlot || !/^\d{2}:\d{2}$/.test(timeSlot)) {
    return { statusCode: 400, body: { error: 'La hora debe tener el formato HH:MM (por ejemplo "09:00").' } };
  }
  if (typeof durationMinutes !== 'number' || durationMinutes < 15 || durationMinutes > 480) {
    return { statusCode: 400, body: { error: 'La duración debe estar entre 15 y 480 minutos.' } };
  }

  const pk = `WEEKLY#${dayOfWeek}`;
  const sk = timeSlot;

  const item = {
    pk,
    sk,
    dayOfWeek: Number(dayOfWeek),
    timeSlot,
    durationMinutes: Number(durationMinutes),
    active: Boolean(active),
    updatedAt: new Date().toISOString(),
  };

  try {
    await ddb.send(new PutCommand({ TableName: AVAILABILITY_TABLE, Item: item }));
    return { statusCode: 200, body: { message: 'Horario guardado.', rule: item } };
  } catch (err) {
    console.error('adminSetAvailability error:', err);
    return { statusCode: 500, body: { error: 'No se pudo guardar el horario.' } };
  }
}

/**
 * DELETE /admin/availability/{id}
 * Removes an availability rule. The {id} is encoded as "dayOfWeek:timeSlot" (e.g. "1:09:00").
 */
async function adminDeleteAvailability(id) {
  if (!id) return { statusCode: 400, body: { error: 'Falta el identificador del horario.' } };

  // id format: "{dayOfWeek}:{timeSlot}" e.g. "1:09:00"
  const colonIndex = id.indexOf(':');
  if (colonIndex === -1) {
    return { statusCode: 400, body: { error: 'El formato del horario debe ser "{díaSemana}:{hora}" (por ejemplo "1:09:00").' } };
  }
  const dayOfWeek = id.slice(0, colonIndex);
  const timeSlot = id.slice(colonIndex + 1);
  const pk = `WEEKLY#${dayOfWeek}`;

  try {
    await ddb.send(
      new DeleteCommand({
        TableName: AVAILABILITY_TABLE,
        Key: { pk, sk: timeSlot },
      })
    );
    return { statusCode: 200, body: { message: 'Availability rule removed.' } };
  } catch (err) {
    console.error('adminDeleteAvailability error:', err);
    return { statusCode: 500, body: { error: 'No se pudo eliminar el horario.' } };
  }
}

/**
 * POST /admin/block-date
 * Blocks a specific date.
 * Body: { date: "YYYY-MM-DD", reason?: string }
 */
async function adminBlockDate(body) {
  if (!body || !body.date) {
    return { statusCode: 400, body: { error: 'date (YYYY-MM-DD) is required.' } };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return { statusCode: 400, body: { error: 'La fecha debe tener el formato AAAA-MM-DD.' } };
  }

  const item = {
    date: body.date,
    reason: body.reason || '',
    blockedAt: new Date().toISOString(),
  };

  try {
    await ddb.send(new PutCommand({ TableName: BLOCKED_DATES_TABLE, Item: item }));
    return { statusCode: 200, body: { message: `Date ${body.date} has been blocked.`, item } };
  } catch (err) {
    console.error('adminBlockDate error:', err);
    return { statusCode: 500, body: { error: 'No se pudo bloquear la fecha.' } };
  }
}

/**
 * DELETE /admin/block-date/{date}
 * Unblocks a specific date.
 */
async function adminUnblockDate(date) {
  if (!date) return { statusCode: 400, body: { error: 'date (YYYY-MM-DD) is required.' } };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { statusCode: 400, body: { error: 'La fecha debe tener el formato AAAA-MM-DD.' } };
  }

  try {
    await ddb.send(
      new DeleteCommand({ TableName: BLOCKED_DATES_TABLE, Key: { date } })
    );
    return { statusCode: 200, body: { message: `Date ${date} has been unblocked.` } };
  } catch (err) {
    console.error('adminUnblockDate error:', err);
    return { statusCode: 500, body: { error: 'No se pudo desbloquear la fecha.' } };
  }
}

module.exports = {
  getPublicAvailability,
  adminGetAvailability,
  adminSetAvailability,
  adminDeleteAvailability,
  adminBlockDate,
  adminUnblockDate,
};
