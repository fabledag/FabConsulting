'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

const NOTIFICATIONS_TABLE = process.env.NOTIFICATIONS_TABLE;

/**
 * Writes an in-profile notification. Best-effort — a failure here should
 * never fail the booking/package/auth action that triggered it, same
 * pattern as the existing best-effort SES sends.
 */
async function createNotification(email, { type, title, body, relatedBookingId = null, relatedPackageId = null }) {
  const item = {
    email,
    id: uuidv4(),
    type,
    title,
    body,
    read: false,
    relatedBookingId,
    relatedPackageId,
    createdAt: new Date().toISOString(),
  };
  try {
    await ddb.send(new PutCommand({ TableName: NOTIFICATIONS_TABLE, Item: item }));
  } catch (err) {
    console.error('createNotification error (non-fatal):', err);
  }
  return item;
}

module.exports = { createNotification };
