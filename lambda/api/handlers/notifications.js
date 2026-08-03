'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

const NOTIFICATIONS_TABLE = process.env.NOTIFICATIONS_TABLE;

/**
 * GET /me/notifications?unreadOnly=true
 */
async function listMyNotifications(email, queryParams) {
  try {
    const result = await ddb.send(
      new QueryCommand({
        TableName: NOTIFICATIONS_TABLE,
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': email },
      })
    );

    let items = result.Items || [];
    if (queryParams?.unreadOnly === 'true') {
      items = items.filter((n) => !n.read);
    }
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return { statusCode: 200, body: { notifications: items } };
  } catch (err) {
    console.error('listMyNotifications error:', err);
    return { statusCode: 500, body: { error: 'Failed to fetch notifications.' } };
  }
}

/**
 * PUT /me/notifications/{id}/read
 */
async function markNotificationRead(email, id) {
  if (!id) return { statusCode: 400, body: { error: 'Notification ID is required.' } };

  try {
    await ddb.send(
      new UpdateCommand({
        TableName: NOTIFICATIONS_TABLE,
        Key: { email, id },
        UpdateExpression: 'SET #read = :true',
        ConditionExpression: 'attribute_exists(id)',
        ExpressionAttributeNames: { '#read': 'read' },
        ExpressionAttributeValues: { ':true': true },
      })
    );
    return { statusCode: 200, body: { message: 'Notification marked as read.' } };
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return { statusCode: 404, body: { error: 'Notification not found.' } };
    }
    console.error('markNotificationRead error:', err);
    return { statusCode: 500, body: { error: 'Failed to update notification.' } };
  }
}

module.exports = { listMyNotifications, markNotificationRead };
