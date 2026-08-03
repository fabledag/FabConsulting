'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

const USERS_TABLE = process.env.USERS_TABLE;

/**
 * GET /me
 */
async function getProfile(email) {
  try {
    const result = await ddb.send(new GetCommand({ TableName: USERS_TABLE, Key: { email } }));
    if (!result.Item) {
      return { statusCode: 404, body: { error: 'Profile not found.' } };
    }
    return { statusCode: 200, body: { user: result.Item } };
  } catch (err) {
    console.error('getProfile error:', err);
    return { statusCode: 500, body: { error: 'Failed to fetch profile.' } };
  }
}

/**
 * PUT /me
 * Body: { name?, phone? } — only provided fields are updated.
 */
async function updateProfile(email, body) {
  if (!body) return { statusCode: 400, body: { error: 'Request body is required.' } };

  const errors = [];
  if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length < 2)) {
    errors.push('name must be at least 2 characters.');
  }
  if (body.phone !== undefined && body.phone && !/^[\d\s\-\+\(\)]{7,20}$/.test(body.phone)) {
    errors.push('Phone number format is invalid.');
  }
  if (errors.length) return { statusCode: 400, body: { errors } };

  const sets = ['updatedAt = :now'];
  const values = { ':now': new Date().toISOString() };
  const names = {};

  if (body.name !== undefined) {
    sets.push('#name = :name');
    names['#name'] = 'name';
    values[':name'] = body.name.trim();
  }
  if (body.phone !== undefined) {
    sets.push('phone = :phone');
    values[':phone'] = body.phone.trim();
  }

  try {
    await ddb.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { email },
        UpdateExpression: `SET ${sets.join(', ')}`,
        ...(Object.keys(names).length ? { ExpressionAttributeNames: names } : {}),
        ExpressionAttributeValues: values,
      })
    );
    return { statusCode: 200, body: { message: 'Profile updated.' } };
  } catch (err) {
    console.error('updateProfile error:', err);
    return { statusCode: 500, body: { error: 'Failed to update profile.' } };
  }
}

module.exports = { getProfile, updateProfile };
