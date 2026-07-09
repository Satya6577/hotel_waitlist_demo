// Auth utility: JWT signing/verification + role helpers
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const SECRET = process.env.JWT_SECRET || 'dev-secret-do-not-use-in-prod';
const COOKIE_NAME = 'seatflow_token';
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const ROLES = ['super_admin', 'owner', 'manager', 'cashier', 'waiter', 'receptionist'];

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  owner: 'Restaurant Owner',
  manager: 'Manager',
  cashier: 'Cashier',
  waiter: 'Waiter',
  receptionist: 'Receptionist',
};

// Route access matrix (which nav views each role can see)
export const ROLE_ACCESS = {
  super_admin: ['dashboard', 'queue', 'tables', 'waiters', 'timeline', 'analytics', 'settings'],
  owner: ['dashboard', 'queue', 'tables', 'waiters', 'timeline', 'analytics', 'settings'],
  manager: ['dashboard', 'queue', 'tables', 'waiters', 'timeline', 'analytics'],
  cashier: ['dashboard', 'tables', 'timeline'],
  waiter: ['tables', 'queue'],
  receptionist: ['queue', 'tables', 'timeline'],
};

export const DEFAULT_ROUTE = {
  super_admin: 'dashboard',
  owner: 'dashboard',
  manager: 'dashboard',
  cashier: 'tables',
  waiter: 'tables',
  receptionist: 'queue',
};

export function hashPassword(pw) { return bcrypt.hashSync(pw, 10); }
export function verifyPassword(pw, hash) { try { return bcrypt.compareSync(pw, hash); } catch { return false; } }

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: TOKEN_MAX_AGE });
}
export function verifyToken(token) {
  try { return jwt.verify(token, SECRET); } catch { return null; }
}

export function cookieHeader(token) {
  return `${COOKIE_NAME}=${token}; Path=/; Max-Age=${TOKEN_MAX_AGE}; HttpOnly; SameSite=Lax`;
}
export function clearCookieHeader() {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
}

export function readTokenFromRequest(request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.split(';').map((s) => s.trim()).find((s) => s.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  return decodeURIComponent(match.substring(COOKIE_NAME.length + 1));
}

export function getUserFromRequest(request) {
  const token = readTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

export function roleCanAccess(role, view) {
  if (!role) return false;
  return (ROLE_ACCESS[role] || []).includes(view);
}

export { COOKIE_NAME };
