'use strict';

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const sesClient = new SESClient({});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const FROM_EMAIL = process.env.FROM_EMAIL;
const SITE_URL = process.env.SITE_URL || 'https://fabiolaledesma.com';

/**
 * Validates a contact form submission.
 * Returns an array of error strings (empty if valid).
 */
function validateContact(body) {
  const errors = [];
  if (!body) return ['Request body is required.'];

  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters.');
  }
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push('A valid email address is required.');
  }
  if (!body.message || typeof body.message !== 'string' || body.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters.');
  }
  if (body.phone && !/^[\d\s\-\+\(\)]{7,20}$/.test(body.phone)) {
    errors.push('Phone number format is invalid.');
  }
  return errors;
}

/**
 * Builds the HTML notification email sent to the admin.
 */
function buildAdminEmail(data) {
  const { name, email, phone, service, message } = data;
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nuevo mensaje de contacto</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1a1a2e;padding:32px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;letter-spacing:0.5px;">
                Fabiola Ledesma · Consultoría
              </h1>
              <p style="margin:6px 0 0;color:#a0a0c0;font-size:14px;">Nuevo mensaje de contacto</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Nombre</span>
                    <p style="margin:4px 0 0;color:#111827;font-size:16px;font-weight:500;">${escapeHtml(name)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Email</span>
                    <p style="margin:4px 0 0;">
                      <a href="mailto:${escapeHtml(email)}" style="color:#4f46e5;font-size:16px;">${escapeHtml(email)}</a>
                    </p>
                  </td>
                </tr>
                ${phone ? `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Teléfono</span>
                    <p style="margin:4px 0 0;color:#111827;font-size:16px;">${escapeHtml(phone)}</p>
                  </td>
                </tr>` : ''}
                ${service ? `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Servicio de interés</span>
                    <p style="margin:4px 0 0;color:#111827;font-size:16px;">${escapeHtml(service)}</p>
                  </td>
                </tr>` : ''}
                <tr>
                  <td style="padding:10px 0;">
                    <span style="color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Mensaje</span>
                    <p style="margin:8px 0 0;color:#111827;font-size:15px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message)}</p>
                  </td>
                </tr>
              </table>
              <!-- CTA -->
              <div style="margin-top:28px;">
                <a href="mailto:${escapeHtml(email)}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:15px;font-weight:500;">
                  Responder a ${escapeHtml(name)}
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                Este mensaje fue enviado desde el formulario de contacto de
                <a href="${SITE_URL}" style="color:#4f46e5;text-decoration:none;">${SITE_URL}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/**
 * Builds the HTML confirmation email sent to the user.
 */
function buildUserConfirmationEmail(data) {
  const { name } = data;
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Recibimos tu mensaje</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1a1a2e;padding:32px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;letter-spacing:0.5px;">
                Fabiola Ledesma · Consultoría
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:600;">
                ¡Gracias por tu mensaje, ${escapeHtml(name)}!
              </h2>
              <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">
                Recibí tu consulta y me estaré comunicando con vos a la brevedad para darte una respuesta personalizada.
              </p>
              <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">
                Mientras tanto, podés conocer más sobre mis servicios y leer artículos de interés en mi sitio web.
              </p>
              <div style="margin-top:28px;">
                <a href="${SITE_URL}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:15px;font-weight:500;">
                  Visitar el sitio
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                Este es un mensaje automático. Por favor no respondas directamente a este email.<br />
                <a href="${SITE_URL}" style="color:#4f46e5;text-decoration:none;">${SITE_URL}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * POST /contact
 */
async function submitContact(body) {
  const errors = validateContact(body);
  if (errors.length) {
    return { statusCode: 400, body: { errors } };
  }

  const { name, email, phone = '', service = '', message } = body;

  if (!ADMIN_EMAIL || !FROM_EMAIL) {
    console.error('ADMIN_EMAIL or FROM_EMAIL environment variable is not set.');
    return { statusCode: 500, body: { error: 'Server configuration error.' } };
  }

  try {
    // Send notification to admin
    await sesClient.send(
      new SendEmailCommand({
        Source: FROM_EMAIL,
        Destination: { ToAddresses: [ADMIN_EMAIL] },
        Message: {
          Subject: { Data: `Nuevo mensaje de ${name} — Fabiola Ledesma Consultoría`, Charset: 'UTF-8' },
          Body: { Html: { Data: buildAdminEmail({ name, email, phone, service, message }), Charset: 'UTF-8' } },
        },
        ReplyToAddresses: [email],
      })
    );

    // Send confirmation to user
    await sesClient.send(
      new SendEmailCommand({
        Source: FROM_EMAIL,
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: { Data: 'Recibimos tu mensaje — Fabiola Ledesma Consultoría', Charset: 'UTF-8' },
          Body: { Html: { Data: buildUserConfirmationEmail({ name }), Charset: 'UTF-8' } },
        },
      })
    );

    return {
      statusCode: 200,
      body: { message: 'Tu mensaje fue enviado correctamente. Te contactaremos pronto.' },
    };
  } catch (err) {
    console.error('SES send error:', err);
    return { statusCode: 500, body: { error: 'Failed to send email. Please try again later.' } };
  }
}

module.exports = { submitContact };
