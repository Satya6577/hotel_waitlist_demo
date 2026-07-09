import { NextResponse } from 'next/server';
import { getDb, clean } from '@/lib/db';
import {
  hashPassword, verifyPassword, signToken, cookieHeader, clearCookieHeader,
  getUserFromRequest, ROLES, ROLE_ACCESS, DEFAULT_ROUTE, ROLE_LABELS,
} from '@/lib/auth';

function ok(data, init = {}) { return NextResponse.json(data, init); }
function bad(msg, status = 400) { return NextResponse.json({ error: msg }, { status }); }
async function readBody(req) { try { return await req.json(); } catch { return {}; } }

// --- Guards --------------------------------------------------------
function requireAuth(request) {
  const u = getUserFromRequest(request);
  if (!u) return { error: bad('unauthenticated', 401) };
  return { user: u };
}
function requireRole(request, roles) {
  const { user, error } = requireAuth(request);
  if (error) return { error };
  if (!roles.includes(user.role)) return { error: bad('forbidden', 403) };
  return { user };
}

// --- Seed defaults on first access --------------------------------
async function ensureDefaults(db) {
  const secCount = await db.collection('sections').countDocuments({});
  if (secCount === 0) {
    await db.collection('sections').insertMany([
      { id: crypto.randomUUID(), name: 'Section A', order: 1, color: 'emerald', createdAt: Date.now() },
      { id: crypto.randomUUID(), name: 'Section B', order: 2, color: 'sky', createdAt: Date.now() },
      { id: crypto.randomUUID(), name: 'Section C', order: 3, color: 'amber', createdAt: Date.now() },
    ]);
  }
  const waiterCount = await db.collection('waiters').countDocuments({});
  if (waiterCount === 0) {
    await db.collection('waiters').insertMany([
      { id: crypto.randomUUID(), name: 'Amit Patil', employeeId: 'EMP-101', phone: '+91 9812345678', status: 'available', createdAt: Date.now() },
      { id: crypto.randomUUID(), name: 'Neha Kulkarni', employeeId: 'EMP-102', phone: '+91 9823456789', status: 'available', createdAt: Date.now() },
      { id: crypto.randomUUID(), name: 'Sagar Joshi', employeeId: 'EMP-103', phone: '+91 9834567890', status: 'busy', createdAt: Date.now() },
      { id: crypto.randomUUID(), name: 'Priya Deshmukh', employeeId: 'EMP-104', phone: '+91 9845678901', status: 'off_duty', createdAt: Date.now() },
    ]);
  }
}

// ==================================================================
// GET
// ==================================================================
export async function GET(request, { params }) {
  const p = (await params).path || [];
  try {
    const db = await getDb();
    await ensureDefaults(db);

    // ---- Queue (EXISTING, unchanged behavior) ----
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

    // ---- Sections (NEW) ----
    if (p[0] === 'sections') {
      const items = await db.collection('sections').find({}).sort({ order: 1 }).toArray();
      return ok(items.map(clean));
    }

    // ---- Waiters (NEW) ----
    if (p[0] === 'waiters') {
      const items = await db.collection('waiters').find({}).sort({ createdAt: 1 }).toArray();
      return ok(items.map(clean));
    }

    // ---- Auth: me (NEW) ----
    if (p[0] === 'auth' && p[1] === 'me') {
      const u = getUserFromRequest(request);
      if (!u) return ok({ user: null });
      const dbUser = await db.collection('users').findOne({ id: u.id });
      if (!dbUser) return ok({ user: null });
      const { passwordHash, ...safe } = dbUser;
      return ok({ user: clean(safe), access: ROLE_ACCESS[dbUser.role] || [], defaultRoute: DEFAULT_ROUTE[dbUser.role] || 'dashboard', roleLabel: ROLE_LABELS[dbUser.role] });
    }
    if (p[0] === 'auth' && p[1] === 'has-users') {
      const count = await db.collection('users').countDocuments({});
      return ok({ hasUsers: count > 0 });
    }

    // ---- Users list (admin only) ----
    if (p[0] === 'users') {
      const g = requireRole(request, ['super_admin', 'owner']);
      if (g.error) return g.error;
      const users = await db.collection('users').find({}, { projection: { passwordHash: 0 } }).sort({ createdAt: 1 }).toArray();
      return ok(users.map(clean));
    }

    // ---- Notifications log (NEW) ----
    if (p[0] === 'notifications') {
      const items = await db.collection('notifications').find({}).sort({ time: -1 }).limit(50).toArray();
      return ok(items.map(clean));
    }

    return ok({ ok: true, service: 'SeatFlow API' });
  } catch (e) {
    return bad(e.message, 500);
  }
}

// ==================================================================
// POST
// ==================================================================
export async function POST(request, { params }) {
  const p = (await params).path || [];
  try {
    const db = await getDb();
    await ensureDefaults(db);
    const body = await readBody(request);

    // ---- Queue (EXISTING) ----
    if (p[0] === 'queue' && !p[1]) {
      if (!body.name || !String(body.name).trim()) return bad('name required');
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const last = await db.collection('queue').find({ createdAt: { $gte: today.getTime() } }).sort({ number: -1 }).limit(1).toArray();
      const nextNumber = (last[0]?.number || 0) + 1;

      const doc = {
        id: crypto.randomUUID(),
        number: nextNumber,
        name: String(body.name).trim().slice(0, 60),
        phone: String(body.phone || '').trim().slice(0, 20),
        party: Math.max(1, Math.min(20, Number(body.party) || 2)),
        request: String(body.request || '').slice(0, 200),
        birthday: !!body.birthday, wheelchair: !!body.wheelchair, babyChair: !!body.babyChair, vip: !!body.vip,
        notes: String(body.notes || '').slice(0, 400),
        priority: body.vip ? 'high' : 'normal',
        source: body.source || 'staff',
        arrivalTime: Date.now(), createdAt: Date.now(),
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
      const count = await db.collection('queue').countDocuments({ status: 'waiting' });
      if (count > 0) return ok({ ok: true, seeded: false });
      const names = ['Raj Sharma', 'Priya Deshmukh', 'Amit Patil', 'Neha Kulkarni', 'Sagar Joshi', 'Ananya Iyer', 'Rohan Mehta'];
      const now = Date.now();
      const docs = names.map((n, i) => ({
        id: crypto.randomUUID(), number: i + 1, name: n,
        phone: `+91 9${String(Math.floor(Math.random() * 1e9)).padStart(9, '0')}`,
        party: 2 + (i % 6), request: i === 0 ? 'Window seat' : (i === 3 ? 'Quiet corner' : ''),
        birthday: i === 3, babyChair: i === 4, wheelchair: false, vip: i === 1,
        notes: '', priority: i === 1 ? 'high' : 'normal', source: 'staff',
        arrivalTime: now - (3 + i * 6) * 60 * 1000, createdAt: now - (3 + i * 6) * 60 * 1000,
        estimatedWait: 10 + i * 5, status: 'waiting',
      }));
      await db.collection('queue').insertMany(docs);
      return ok({ ok: true, seeded: docs.length });
    }

    // ---- Sections (NEW) ----
    if (p[0] === 'sections') {
      const g = requireRole(request, ['super_admin', 'owner', 'manager']);
      if (g.error) return g.error;
      const count = await db.collection('sections').countDocuments({});
      const doc = {
        id: crypto.randomUUID(),
        name: String(body.name || `Section ${count + 1}`).slice(0, 40),
        order: Number(body.order) || count + 1,
        color: body.color || 'emerald',
        createdAt: Date.now(),
      };
      await db.collection('sections').insertOne(doc);
      return ok(clean(doc));
    }

    // ---- Waiters (NEW) ----
    if (p[0] === 'waiters') {
      const g = requireRole(request, ['super_admin', 'owner', 'manager']);
      if (g.error) return g.error;
      if (!body.name) return bad('name required');
      const doc = {
        id: crypto.randomUUID(),
        name: String(body.name).slice(0, 60),
        employeeId: String(body.employeeId || `EMP-${Math.floor(100 + Math.random() * 900)}`).slice(0, 20),
        phone: String(body.phone || '').slice(0, 20),
        status: ['available', 'busy', 'off_duty'].includes(body.status) ? body.status : 'available',
        createdAt: Date.now(),
      };
      await db.collection('waiters').insertOne(doc);
      return ok(clean(doc));
    }

    // ---- Auth: register (NEW) ----
    if (p[0] === 'auth' && p[1] === 'register') {
      const { name, email, phone, username, password, role } = body || {};
      if (!name || !email || !username || !password) return bad('name, email, username, password required');
      if (String(password).length < 6) return bad('password must be at least 6 characters');
      const roleFinal = ROLES.includes(role) ? role : 'owner';

      // First user auto becomes super_admin
      const usersCount = await db.collection('users').countDocuments({});
      const isFirst = usersCount === 0;
      const finalRole = isFirst ? 'super_admin' : roleFinal;

      const existing = await db.collection('users').findOne({ $or: [{ email: String(email).toLowerCase() }, { username: String(username).toLowerCase() }] });
      if (existing) return bad('user with this email or username already exists', 409);

      const doc = {
        id: crypto.randomUUID(),
        name: String(name).slice(0, 80),
        email: String(email).toLowerCase().slice(0, 120),
        phone: String(phone || '').slice(0, 20),
        username: String(username).toLowerCase().slice(0, 40),
        role: finalRole,
        passwordHash: hashPassword(String(password)),
        createdAt: Date.now(),
      };
      await db.collection('users').insertOne(doc);

      const token = signToken({ id: doc.id, username: doc.username, role: doc.role, name: doc.name });
      const { passwordHash, ...safe } = doc;
      const res = ok({ user: clean(safe), access: ROLE_ACCESS[doc.role], defaultRoute: DEFAULT_ROUTE[doc.role], roleLabel: ROLE_LABELS[doc.role] });
      res.headers.set('Set-Cookie', cookieHeader(token));
      return res;
    }

    // ---- Auth: login (NEW) ----
    if (p[0] === 'auth' && p[1] === 'login') {
      const { username, password } = body || {};
      if (!username || !password) return bad('username and password required');
      const identifier = String(username).toLowerCase();
      const user = await db.collection('users').findOne({ $or: [{ username: identifier }, { email: identifier }] });
      if (!user) return bad('invalid credentials', 401);
      if (!verifyPassword(String(password), user.passwordHash)) return bad('invalid credentials', 401);

      const token = signToken({ id: user.id, username: user.username, role: user.role, name: user.name });
      const { passwordHash, ...safe } = user;
      const res = ok({ user: clean(safe), access: ROLE_ACCESS[user.role], defaultRoute: DEFAULT_ROUTE[user.role], roleLabel: ROLE_LABELS[user.role] });
      res.headers.set('Set-Cookie', cookieHeader(token));
      return res;
    }

    // ---- Auth: logout (NEW) ----
    if (p[0] === 'auth' && p[1] === 'logout') {
      const res = ok({ ok: true });
      res.headers.set('Set-Cookie', clearCookieHeader());
      return res;
    }

    // ---- Notifications: log (NEW) ----
    if (p[0] === 'notifications') {
      const doc = {
        id: crypto.randomUUID(),
        customerName: String(body.customerName || ''),
        customerPhone: String(body.customerPhone || ''),
        tableNumber: body.tableNumber || null,
        type: String(body.type || 'table_ready'),
        provider: String(body.provider || 'whatsapp_click'),
        status: String(body.status || 'sent'),
        message: String(body.message || ''),
        time: Date.now(),
      };
      await db.collection('notifications').insertOne(doc);
      return ok(clean(doc));
    }

    return bad('route not found', 404);
  } catch (e) {
    return bad(e.message, 500);
  }
}

// ==================================================================
// PATCH
// ==================================================================
export async function PATCH(request, { params }) {
  const p = (await params).path || [];
  try {
    const db = await getDb();
    const body = await readBody(request);

    // Queue (EXISTING)
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

    // Sections
    if (p[0] === 'sections' && p[1]) {
      const g = requireRole(request, ['super_admin', 'owner', 'manager']);
      if (g.error) return g.error;
      const updates = {};
      if (body.name != null) updates.name = String(body.name).slice(0, 40);
      if (body.order != null) updates.order = Number(body.order);
      if (body.color != null) updates.color = body.color;
      await db.collection('sections').updateOne({ id: p[1] }, { $set: updates });
      return ok({ ok: true });
    }

    // Waiters
    if (p[0] === 'waiters' && p[1]) {
      const g = requireRole(request, ['super_admin', 'owner', 'manager']);
      if (g.error) return g.error;
      const updates = {};
      if (body.name != null) updates.name = String(body.name).slice(0, 60);
      if (body.employeeId != null) updates.employeeId = String(body.employeeId).slice(0, 20);
      if (body.phone != null) updates.phone = String(body.phone).slice(0, 20);
      if (body.status != null && ['available', 'busy', 'off_duty'].includes(body.status)) updates.status = body.status;
      await db.collection('waiters').updateOne({ id: p[1] }, { $set: updates });
      return ok({ ok: true });
    }

    return bad('route not found', 404);
  } catch (e) { return bad(e.message, 500); }
}

// ==================================================================
// DELETE
// ==================================================================
export async function DELETE(request, { params }) {
  const p = (await params).path || [];
  try {
    const db = await getDb();

    if (p[0] === 'queue' && p[1]) {
      await db.collection('queue').deleteOne({ id: p[1] });
      return ok({ ok: true });
    }

    if (p[0] === 'sections' && p[1]) {
      const g = requireRole(request, ['super_admin', 'owner', 'manager']);
      if (g.error) return g.error;
      await db.collection('sections').deleteOne({ id: p[1] });
      return ok({ ok: true });
    }
    if (p[0] === 'waiters' && p[1]) {
      const g = requireRole(request, ['super_admin', 'owner', 'manager']);
      if (g.error) return g.error;
      await db.collection('waiters').deleteOne({ id: p[1] });
      return ok({ ok: true });
    }

    return bad('route not found', 404);
  } catch (e) { return bad(e.message, 500); }
}
