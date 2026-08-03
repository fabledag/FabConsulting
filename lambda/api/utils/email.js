'use strict';

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const sesClient = new SESClient({});

const FROM_EMAIL = process.env.FROM_EMAIL;
const SITE_URL = process.env.SITE_URL || 'https://fabiolaledesma.com';

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
 * Shared branded HTML wrapper (same look as the existing contact/booking emails).
 */
function emailLayout({ headerTitle = 'Fabiola Ledesma · Consultoría', headerSubtitle = '', bodyHtml, ctaUrl, ctaLabel }) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(headerTitle)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#1a1a2e;padding:32px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;letter-spacing:0.5px;">${escapeHtml(headerTitle)}</h1>
              ${headerSubtitle ? `<p style="margin:6px 0 0;color:#a0a0c0;font-size:14px;">${escapeHtml(headerSubtitle)}</p>` : ''}
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              ${bodyHtml}
              ${ctaUrl ? `
              <div style="margin-top:28px;">
                <a href="${ctaUrl}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:15px;font-weight:500;">
                  ${escapeHtml(ctaLabel || 'Ver más')}
                </a>
              </div>` : ''}
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
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

async function sendEmail({ to, subject, html, replyTo }) {
  if (!FROM_EMAIL) {
    console.error('FROM_EMAIL environment variable is not set.');
    throw new Error('Server configuration error: FROM_EMAIL not set.');
  }
  return sesClient.send(
    new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: { ToAddresses: Array.isArray(to) ? to : [to] },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: { Html: { Data: html, Charset: 'UTF-8' } },
      },
      ...(replyTo ? { ReplyToAddresses: [replyTo] } : {}),
    })
  );
}

module.exports = { sesClient, sendEmail, escapeHtml, emailLayout, SITE_URL };
