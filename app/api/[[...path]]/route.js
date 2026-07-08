import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URL;
const dbName = process.env.DB_NAME && process.env.DB_NAME !== 'your_database_name' ? process.env.DB_NAME : 'seatflow';

let cachedClient = null;
async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }
  return cachedClient.db(dbName);
}

function ok(data, init = {}) { return NextResponse.json(data, init); }
function bad(msg, status = 400) { return NextResponse.json({ error: msg }, { status }); }

async function readBody(req) {
  try { return await req.json(); } catch { return {}; }
}

// Route dispatcher: /api/[...path]
export async function GET(request, { params }) {
  const p = (await params).path || [];
  try {
    const db = await getDb();

    if (p[0] === 'queue' && !p[1]) {
      const items = await db.collection('queue').find({ status: 'waiting' }).sort({ arrivalTime: 1 }).toArray();
      return ok(items.map(clean));
    }
    if (p[0] === 'queue' && p[1]) {
      const item = await db.collection('queue').findOne({ id: p[1] });
      if (!item) return bad('not found', 404);
      const ahead = await db.collection('queue').countDocuments({ status: 'waiting', arrivalTime: { $lt: item.arrivalTime } });
      return ok({ ...clean(item), position: item.status === 'waiting' ? ahead + 1 : 0 });
    }
    if (p[0] === 'events') {
      const events = await db.collection('events').find({}).sort({ time: -1 }).limit(30).toArray();
      return ok(events.map(clean));
    }
    return ok({ ok: true, service: 'SeatFlow API' });
  } catch (e) {
    return bad(e.message, 500);
  }
}

export async function POST(request, { params }) {
  const p = (await params).path || [];
  try {
    const db = await getDb();
    const body = await readBody(request);

    if (p[0] === 'queue' && !p[1]) {
      if (!body.name || !String(body.name).trim()) return bad('name required');
      // Auto-assign next queue number based on max ever seen today
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const last = await db.collection('queue')
        .find({ createdAt: { $gte: today.getTime() } })
        .sort({ number: -1 }).limit(1).toArray();
      const nextNumber = (last[0]?.number || 0) + 1;

      const doc = {
        id: crypto.randomUUID(),
        number: nextNumber,
        name: String(body.name).trim().slice(0, 60),
        phone: String(body.phone || '').trim().slice(0, 20),
        party: Math.max(1, Math.min(20, Number(body.party) || 2)),
        request: String(body.request || '').slice(0, 200),
        birthday: !!body.birthday,
        wheelchair: !!body.wheelchair,
        babyChair: !!body.babyChair,
        vip: !!body.vip,
        notes: String(body.notes || '').slice(0, 400),
        priority: body.vip ? 'high' : 'normal',
        source: body.source || 'staff',
        arrivalTime: Date.now(),
        createdAt: Date.now(),
        estimatedWait: 10 + Math.floor(Math.random() * 20),
        status: 'waiting',
      };
      await db.collection('queue').insertOne(doc);
      await db.collection('events').insertOne({
        id: crypto.randomUUID(), type: 'added',
        message: `${doc.name} added to queue (party of ${doc.party})${doc.source === 'guest' ? ' \u00b7 self check-in' : ''}`,
        time: Date.now(),
      });
      const ahead = await db.collection('queue').countDocuments({ status: 'waiting', arrivalTime: { $lt: doc.arrivalTime } });
      return ok({ ...clean(doc), position: ahead + 1 });
    }

    if (p[0] === 'queue' && p[1] === 'reset') {
      await db.collection('queue').deleteMany({});
      await db.collection('events').deleteMany({});
      return ok({ ok: true });
    }

    if (p[0] === 'queue' && p[1] === 'seed') {
      // Only seed if empty
      const count = await db.collection('queue').countDocuments({ status: 'waiting' });
      if (count > 0) return ok({ ok: true, seeded: false });
      const names = ['Raj Sharma', 'Priya Deshmukh', 'Amit Patil', 'Neha Kulkarni', 'Sagar Joshi', 'Ananya Iyer', 'Rohan Mehta'];
      const now = Date.now();
      const docs = names.map((n, i) => ({
        id: crypto.randomUUID(),
        number: i + 1,
        name: n,
        phone: `+91 9${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}`,
        party: 2 + (i % 6),
        request: i === 0 ? 'Window seat' : (i === 3 ? 'Quiet corner' : ''),
        birthday: i === 3, babyChair: i === 4, wheelchair: false, vip: i === 1,
        notes: '', priority: i === 1 ? 'high' : 'normal',
        source: 'staff',
        arrivalTime: now - (3 + i * 6) * 60 * 1000,
        createdAt: now - (3 + i * 6) * 60 * 1000,
        estimatedWait: 10 + i * 5,
        status: 'waiting',
      }));
      await db.collection('queue').insertMany(docs);
      return ok({ ok: true, seeded: docs.length });
    }

    return bad('route not found', 404);
  } catch (e) {
    return bad(e.message, 500);
  }
}

export async function PATCH(request, { params }) {
  const p = (await params).path || [];
  try {
    const db = await getDb();
    const body = await readBody(request);
    if (p[0] === 'queue' && p[1]) {
      const item = await db.collection('queue').findOne({ id: p[1] });
      if (!item) return bad('not found', 404);
      const updates = {};
      if (body.status) updates.status = body.status;
      if (body.name) updates.name = String(body.name).slice(0, 60);
      if (body.party) updates.party = Math.max(1, Math.min(20, Number(body.party)));
      await db.collection('queue').updateOne({ id: p[1] }, { $set: updates });

      if (body.status === 'seated') {
        await db.collection('events').insertOne({
          id: crypto.randomUUID(), type: 'seated',
          message: `${item.name} seated${body.tableNumber ? ` at Table ${body.tableNumber}` : ''}`,
          time: Date.now(),
        });
      } else if (body.status === 'cancelled' || body.status === 'no_show') {
        await db.collection('events').insertOne({
          id: crypto.randomUUID(), type: 'left',
          message: `${item.name} ${body.status === 'no_show' ? 'marked as no-show' : 'left the queue'}`,
          time: Date.now(),
        });
      }
      return ok({ ok: true });
    }
    return bad('route not found', 404);
  } catch (e) {
    return bad(e.message, 500);
  }
}

export async function DELETE(request, { params }) {
  const p = (await params).path || [];
  try {
    const db = await getDb();
    if (p[0] === 'queue' && p[1]) {
      await db.collection('queue').deleteOne({ id: p[1] });
      return ok({ ok: true });
    }
    return bad('route not found', 404);
  } catch (e) {
    return bad(e.message, 500);
  }
}

function clean(doc) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return rest;
}
