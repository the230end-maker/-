import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'novel_writer';
const collections = [
  'novel',
  'chapters',
  'characters',
  'world',
  'glossary',
  'timeline',
  'relationships',
  'novel_state',
  'agent_conversations',
  'settings',
  'backups',
];
const singletonCollections = ['novel', 'world', 'novel_state', 'settings'];

declare global {
  var __novelWriterMongoClient: MongoClient | undefined;
}

async function getDb() {
  if (!global.__novelWriterMongoClient) {
    global.__novelWriterMongoClient = new MongoClient(uri);
    await global.__novelWriterMongoClient.connect();
  }
  return global.__novelWriterMongoClient.db(dbName);
}

async function readBody(req: any) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function send(res: any, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

async function readState() {
  const db = await getDb();
  const state: Record<string, unknown> = {};
  for (const collection of collections) {
    state[collection] = singletonCollections.includes(collection)
      ? await db.collection(collection).findOne({})
      : await db.collection(collection).find({}).toArray();
  }
  return state;
}

export default async function handler(req: any, res: any) {
  try {
    const parts = Array.isArray(req.query.path) ? req.query.path : [req.query.path].filter(Boolean);
    const [resource, id] = parts;
    const db = await getDb();

    if (req.method === 'GET' && resource === 'state') {
      return send(res, 200, await readState());
    }

    if (req.method === 'POST' && resource === 'novel') {
      const body = await readBody(req);
      await db.collection('novel').deleteMany({});
      await db.collection('novel').insertOne({
        ...body,
        id: body.id || crypto.randomUUID(),
        createdAt: body.createdAt || new Date().toISOString(),
        lastModified: new Date().toISOString(),
      });
      return send(res, 200, { ok: true });
    }

    if (req.method === 'GET' && resource === 'backup' && id === 'export') {
      const backup: Record<string, unknown> = {};
      for (const collection of collections.filter((item) => item !== 'backups')) {
        backup[collection] = singletonCollections.includes(collection)
          ? await db.collection(collection).findOne({})
          : await db.collection(collection).find({}).toArray();
      }
      backup.exportedAt = new Date().toISOString();
      await db.collection('backups').insertOne({
        createdAt: backup.exportedAt,
        novel: (backup.novel as any)?.title || 'بدون اسم',
      });
      return send(res, 200, backup);
    }

    if (req.method === 'POST' && resource === 'backup' && id === 'import') {
      const backup = await readBody(req);
      if (!backup.novel || !Array.isArray(backup.chapters)) {
        return send(res, 400, { error: 'ملف النسخ الاحتياطي غير صالح' });
      }
      for (const collection of collections.filter((item) => item !== 'backups')) {
        await db.collection(collection).deleteMany({});
      }
      for (const collection of collections.filter((item) => item !== 'backups')) {
        const value = backup[collection];
        if (Array.isArray(value) && value.length) await db.collection(collection).insertMany(value);
        else if (value) await db.collection(collection).insertOne(value);
      }
      return send(res, 200, { ok: true, backup });
    }

    if (req.method === 'POST' && collections.includes(resource)) {
      const body = await readBody(req);
      const doc = { ...body, id: body.id || crypto.randomUUID(), updatedAt: new Date().toISOString() };
      await db.collection(resource).updateOne({ id: doc.id }, { $set: doc }, { upsert: true });
      return send(res, 200, doc);
    }

    if (req.method === 'DELETE' && collections.includes(resource) && id) {
      await db.collection(resource).deleteOne({ id });
      return send(res, 200, { ok: true });
    }

    return send(res, 404, { error: 'Not found' });
  } catch (error: any) {
    return send(res, 500, { error: error?.message || 'Unexpected server error' });
  }
}
