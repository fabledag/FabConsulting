'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  GetCommand,
  UpdateCommand,
  ScanCommand,
} = require('@aws-sdk/lib-dynamodb');

const { sendEmail, emailLayout } = require('../utils/email');
const { createNotification } = require('../utils/notify');

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

const PACKAGES_TABLE = process.env.PACKAGES_TABLE;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const SITE_URL = process.env.SITE_URL || 'https://fabiolaledesma.com';

const PACKAGE_TYPES = {
  'mentoria-4x6': { totalCredits: 4, pricePaidMXN: 1800, label: 'Mentoría · 4 sesiones / 6 meses' },
};

const VALID_STATUSES = ['pending_payment', 'active', 'cancelled'];

/**
 * GET /me/packages
 */
async function listMyPackages(email) {
  try {
    const result = await ddb.send(
      new QueryCommand({
        TableName: PACKAGES_TABLE,
        IndexName: 'email-index',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': email },
        ScanIndexForward: false,
      })
    );
    return { statusCode: 200, body: { packages: result.Items || [] } };
  } catch (err) {
    console.error('listMyPackages error:', err);
    return { statusCode: 500, body: { error: 'No se pudieron cargar tus paquetes.' } };
  }
}

/**
 * POST /me/packages — retired, answers 410.
 */
async function createPendingPackage() {
  // Mentoría stopped being sold on 2026-09-29. Existing packages (none at the
  // time) keep working through listMyPackages and the admin endpoints.
  return { statusCode: 410, body: { error: 'El paquete de Mentoría ya no está disponible.' } };
}

/**
 * GET /admin/packages?status=pending_payment
 */
async function adminListPendingPackages(queryParams) {
  const filterStatus = queryParams?.status;
  const params = { TableName: PACKAGES_TABLE };
  if (filterStatus) {
    if (!VALID_STATUSES.includes(filterStatus)) {
      return { statusCode: 400, body: { error: `status must be one of: ${VALID_STATUSES.join(', ')}.` } };
    }
    params.FilterExpression = '#status = :status';
    params.ExpressionAttributeNames = { '#status': 'status' };
    params.ExpressionAttributeValues = { ':status': filterStatus };
  }

  try {
    const result = await ddb.send(new ScanCommand(params));
    const packages = (result.Items || []).sort(
      (a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt)
    );
    return { statusCode: 200, body: { packages } };
  } catch (err) {
    console.error('adminListPendingPackages error:', err);
    return { statusCode: 500, body: { error: 'No se pudieron cargar tus paquetes.' } };
  }
}

/**
 * PUT /admin/packages/{id}
 * Body: { status: 'active' | 'cancelled' }
 */
async function adminConfirmPackage(id, body) {
  if (!id) return { statusCode: 400, body: { error: 'Falta el identificador del paquete.' } };
  if (!body || !['active', 'cancelled'].includes(body.status)) {
    return { statusCode: 400, body: { error: "status must be 'active' or 'cancelled'." } };
  }

  try {
    const result = await ddb.send(new GetCommand({ TableName: PACKAGES_TABLE, Key: { id } }));
    const pkg = result.Item;
    if (!pkg) return { statusCode: 404, body: { error: 'No encontramos ese paquete.' } };

    const now = new Date().toISOString();

    if (body.status === 'active') {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 6);

      await ddb.send(
        new UpdateCommand({
          TableName: PACKAGES_TABLE,
          Key: { id },
          UpdateExpression: 'SET #status = :active, remainingCredits = totalCredits, confirmedAt = :now, expiresAt = :expiresAt',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: { ':active': 'active', ':now': now, ':expiresAt': expiresAt.toISOString() },
        })
      );

      const def = PACKAGE_TYPES[pkg.packageType] || { label: pkg.packageType };
      try {
        await sendEmail({
          to: pkg.email,
          subject: 'Tu paquete ya está activo — Fabiola Ledesma',
          html: emailLayout({
            headerSubtitle: 'Paquete activado',
            bodyHtml: `
              <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">
                Confirmamos tu pago. Ya tienes <strong>${pkg.totalCredits} sesiones disponibles</strong> de ${def.label} —
                agéndalas cuando quieras desde tu perfil.
              </p>
            `,
            ctaUrl: `${SITE_URL}/profile/`,
            ctaLabel: 'Agendar mis sesiones',
          }),
        });
      } catch (emailErr) {
        console.error('adminConfirmPackage email error:', emailErr);
      }

      await createNotification(pkg.email, {
        type: 'package_confirmed',
        title: 'Paquete activado',
        body: `Tienes ${pkg.totalCredits} sesiones disponibles.`,
        relatedPackageId: id,
      });
    } else {
      await ddb.send(
        new UpdateCommand({
          TableName: PACKAGES_TABLE,
          Key: { id },
          UpdateExpression: 'SET #status = :cancelled, updatedAt = :now',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: { ':cancelled': 'cancelled', ':now': now },
        })
      );
    }

    return { statusCode: 200, body: { message: 'Package updated.', id, status: body.status } };
  } catch (err) {
    console.error('adminConfirmPackage error:', err);
    return { statusCode: 500, body: { error: 'No se pudo actualizar el paquete.' } };
  }
}

module.exports = { listMyPackages, createPendingPackage, adminListPendingPackages, adminConfirmPackage };
