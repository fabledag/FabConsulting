'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  GetCommand,
  QueryCommand,
} = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const { marked } = require('marked');

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

const BLOG_TABLE = process.env.BLOG_TABLE;

/**
 * Generate a URL-safe slug from a title string.
 */
function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

/**
 * Validates a blog post body.
 * isUpdate=true relaxes required fields.
 */
function validatePost(body, isUpdate = false) {
  const errors = [];
  if (!body) return ['Request body is required.'];

  if (!isUpdate) {
    if (!body.title || typeof body.title !== 'string' || body.title.trim().length < 3) {
      errors.push('title must be at least 3 characters.');
    }
    if (!body.content || typeof body.content !== 'string' || body.content.trim().length < 10) {
      errors.push('content must be at least 10 characters.');
    }
  } else {
    if (body.title !== undefined && (typeof body.title !== 'string' || body.title.trim().length < 3)) {
      errors.push('title must be at least 3 characters.');
    }
    if (body.content !== undefined && (typeof body.content !== 'string' || body.content.trim().length < 10)) {
      errors.push('content must be at least 10 characters.');
    }
  }

  if (body.tags !== undefined && !Array.isArray(body.tags)) {
    errors.push('tags must be an array of strings.');
  }
  if (body.published !== undefined && typeof body.published !== 'boolean') {
    errors.push('published must be a boolean.');
  }

  return errors;
}

/**
 * GET /blog?page=1&limit=10
 * Lists published posts, sorted by publishedAt descending.
 */
async function getPublishedPosts(queryParams) {
  const page = Math.max(1, parseInt(queryParams?.page || 1, 10));
  const limit = Math.min(50, Math.max(1, parseInt(queryParams?.limit || 10, 10)));

  try {
    const result = await ddb.send(
      new ScanCommand({
        TableName: BLOG_TABLE,
        FilterExpression: 'published = :true',
        ExpressionAttributeValues: { ':true': true },
        // Exclude full content from list to reduce payload size
        ProjectionExpression: 'id, slug, title, excerpt, coverImage, tags, publishedAt, createdAt, author',
      })
    );

    const allPosts = (result.Items || []).sort(
      (a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt)
    );

    const total = allPosts.length;
    const start = (page - 1) * limit;
    const posts = allPosts.slice(start, start + limit);

    return {
      statusCode: 200,
      body: { posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    };
  } catch (err) {
    console.error('getPublishedPosts error:', err);
    return { statusCode: 500, body: { error: 'Failed to fetch blog posts.' } };
  }
}

/**
 * GET /blog/{slug}
 * Fetches a single published post by slug, renders markdown to HTML.
 */
async function getPostBySlug(slug) {
  if (!slug) return { statusCode: 400, body: { error: 'Slug is required.' } };

  try {
    const result = await ddb.send(
      new ScanCommand({
        TableName: BLOG_TABLE,
        FilterExpression: 'slug = :slug AND published = :true',
        ExpressionAttributeValues: { ':slug': slug, ':true': true },
        Limit: 1,
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return { statusCode: 404, body: { error: 'Post not found.' } };
    }

    const post = result.Items[0];
    // Render markdown to HTML
    const contentHtml = post.content ? marked.parse(post.content) : '';

    return {
      statusCode: 200,
      body: { post: { ...post, contentHtml } },
    };
  } catch (err) {
    console.error('getPostBySlug error:', err);
    return { statusCode: 500, body: { error: 'Failed to fetch blog post.' } };
  }
}

/**
 * GET /admin/blog?page=1&limit=20&published=true|false
 * Lists all posts (including drafts) for admin.
 */
async function adminGetAllPosts(queryParams) {
  const page = Math.max(1, parseInt(queryParams?.page || 1, 10));
  const limit = Math.min(100, Math.max(1, parseInt(queryParams?.limit || 20, 10)));
  const publishedFilter = queryParams?.published;

  const params = {
    TableName: BLOG_TABLE,
    ProjectionExpression: 'id, slug, title, excerpt, coverImage, tags, published, publishedAt, createdAt, updatedAt, author',
  };

  if (publishedFilter !== undefined) {
    const publishedBool = publishedFilter === 'true';
    params.FilterExpression = 'published = :pub';
    params.ExpressionAttributeValues = { ':pub': publishedBool };
  }

  try {
    const result = await ddb.send(new ScanCommand(params));
    const allPosts = (result.Items || []).sort(
      (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    );
    const total = allPosts.length;
    const start = (page - 1) * limit;
    const posts = allPosts.slice(start, start + limit);

    return {
      statusCode: 200,
      body: { posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    };
  } catch (err) {
    console.error('adminGetAllPosts error:', err);
    return { statusCode: 500, body: { error: 'Failed to fetch blog posts.' } };
  }
}

/**
 * POST /admin/blog
 * Creates a new blog post.
 */
async function adminCreatePost(body) {
  const errors = validatePost(body, false);
  if (errors.length) return { statusCode: 400, body: { errors } };

  const now = new Date().toISOString();
  const id = uuidv4();
  const title = body.title.trim();
  const slug = body.slug ? String(body.slug).trim() : `${slugify(title)}-${id.slice(0, 8)}`;
  const published = Boolean(body.published);

  // Check slug uniqueness
  try {
    const existingSlug = await ddb.send(
      new ScanCommand({
        TableName: BLOG_TABLE,
        FilterExpression: 'slug = :slug',
        ExpressionAttributeValues: { ':slug': slug },
        Limit: 1,
      })
    );
    if (existingSlug.Items && existingSlug.Items.length > 0) {
      return { statusCode: 409, body: { error: `A post with slug "${slug}" already exists.` } };
    }
  } catch (err) {
    console.error('Slug check error:', err);
  }

  const post = {
    id,
    slug,
    title,
    content: body.content.trim(),
    excerpt: body.excerpt ? String(body.excerpt).trim() : body.content.trim().slice(0, 200),
    coverImage: body.coverImage || null,
    tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
    published,
    publishedAt: published ? now : null,
    author: body.author ? String(body.author).trim() : 'Fabiola Ledesma',
    createdAt: now,
    updatedAt: now,
  };

  try {
    await ddb.send(new PutCommand({ TableName: BLOG_TABLE, Item: post }));
    return { statusCode: 201, body: { message: 'Post created.', post } };
  } catch (err) {
    console.error('adminCreatePost error:', err);
    return { statusCode: 500, body: { error: 'Failed to create blog post.' } };
  }
}

/**
 * PUT /admin/blog/{id}
 * Updates an existing blog post.
 */
async function adminUpdatePost(id, body) {
  if (!id) return { statusCode: 400, body: { error: 'Post ID is required.' } };

  const errors = validatePost(body, true);
  if (errors.length) return { statusCode: 400, body: { errors } };

  try {
    // Find post by ID (need to get its slug for the key)
    const scanResult = await ddb.send(
      new ScanCommand({
        TableName: BLOG_TABLE,
        FilterExpression: '#id = :id',
        ExpressionAttributeNames: { '#id': 'id' },
        ExpressionAttributeValues: { ':id': id },
        Limit: 1,
      })
    );

    if (!scanResult.Items || scanResult.Items.length === 0) {
      return { statusCode: 404, body: { error: 'Post not found.' } };
    }

    const existing = scanResult.Items[0];
    const now = new Date().toISOString();

    const updateParts = ['updatedAt = :updatedAt'];
    const exprNames = {};
    const exprValues = { ':updatedAt': now };

    const allowed = ['title', 'content', 'excerpt', 'coverImage', 'tags', 'author'];
    for (const field of allowed) {
      if (body[field] !== undefined) {
        updateParts.push(`#${field} = :${field}`);
        exprNames[`#${field}`] = field;
        exprValues[`:${field}`] = field === 'tags' ? body[field].map(String) : body[field];
      }
    }

    // Handle publish/unpublish
    if (body.published !== undefined) {
      updateParts.push('published = :published');
      exprValues[':published'] = Boolean(body.published);

      if (body.published && !existing.publishedAt) {
        updateParts.push('publishedAt = :publishedAt');
        exprValues[':publishedAt'] = now;
      } else if (!body.published) {
        updateParts.push('publishedAt = :publishedAt');
        exprValues[':publishedAt'] = null;
      }
    }

    await ddb.send(
      new UpdateCommand({
        TableName: BLOG_TABLE,
        Key: { id: existing.id, slug: existing.slug },
        UpdateExpression: `SET ${updateParts.join(', ')}`,
        ExpressionAttributeNames: Object.keys(exprNames).length ? exprNames : undefined,
        ExpressionAttributeValues: exprValues,
      })
    );

    return { statusCode: 200, body: { message: 'Post updated.', id } };
  } catch (err) {
    console.error('adminUpdatePost error:', err);
    return { statusCode: 500, body: { error: 'Failed to update blog post.' } };
  }
}

/**
 * DELETE /admin/blog/{id}
 * Deletes a blog post.
 */
async function adminDeletePost(id) {
  if (!id) return { statusCode: 400, body: { error: 'Post ID is required.' } };

  try {
    const scanResult = await ddb.send(
      new ScanCommand({
        TableName: BLOG_TABLE,
        FilterExpression: '#id = :id',
        ExpressionAttributeNames: { '#id': 'id' },
        ExpressionAttributeValues: { ':id': id },
        Limit: 1,
      })
    );

    if (!scanResult.Items || scanResult.Items.length === 0) {
      return { statusCode: 404, body: { error: 'Post not found.' } };
    }

    const post = scanResult.Items[0];
    await ddb.send(
      new DeleteCommand({
        TableName: BLOG_TABLE,
        Key: { id: post.id, slug: post.slug },
      })
    );

    return { statusCode: 200, body: { message: 'Post deleted.', id } };
  } catch (err) {
    console.error('adminDeletePost error:', err);
    return { statusCode: 500, body: { error: 'Failed to delete blog post.' } };
  }
}

module.exports = {
  getPublishedPosts,
  getPostBySlug,
  adminGetAllPosts,
  adminCreatePost,
  adminUpdatePost,
  adminDeletePost,
};
