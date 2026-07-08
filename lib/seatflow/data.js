// Seed data + helpers for SeatFlow
export const INDIAN_NAMES = [
  'Raj Sharma', 'Priya Deshmukh', 'Amit Patil', 'Neha Kulkarni', 'Sagar Joshi',
  'Ananya Iyer', 'Rohan Mehta', 'Kavya Nair', 'Vikram Rao', 'Isha Reddy',
  'Aditya Bose', 'Meera Shah', 'Karan Malhotra', 'Divya Menon', 'Arjun Kapoor',
];

const REQUESTS = ['Window seat', 'Quiet corner', 'Near the bar', 'Away from AC', 'High chair needed', ''];

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function generateSeedQueue() {
  const now = Date.now();
  const pool = [...INDIAN_NAMES].sort(() => Math.random() - 0.5);
  const items = [];
  for (let i = 0; i < 7; i++) {
    const minsAgo = 3 + i * 6 + randInt(0, 3);
    items.push({
      id: crypto.randomUUID(),
      number: i + 1,
      name: pool[i],
      phone: `+91 9${randInt(100000000, 999999999)}`,
      party: randInt(2, 8),
      arrivalTime: now - minsAgo * 60 * 1000,
      estimatedWait: 10 + i * 5,
      request: pick(REQUESTS),
      priority: i === 0 ? 'high' : i < 2 ? 'normal' : 'normal',
      vip: i === 1,
      birthday: i === 3,
      wheelchair: false,
      babyChair: i === 4,
      notes: '',
      status: 'waiting',
    });
  }
  return items;
}

export function generateSeedTables() {
  // 12 tables with various statuses
  const cfg = [
    { number: 1, capacity: 2 }, { number: 2, capacity: 2 }, { number: 3, capacity: 4 },
    { number: 4, capacity: 4 }, { number: 5, capacity: 4 }, { number: 6, capacity: 6 },
    { number: 7, capacity: 6 }, { number: 8, capacity: 8 }, { number: 9, capacity: 2 },
    { number: 10, capacity: 4 }, { number: 11, capacity: 4 }, { number: 12, capacity: 6 },
  ];
  const statuses = ['available', 'occupied', 'available', 'cleaning', 'available', 'occupied',
    'reserved', 'available', 'occupied', 'available', 'available', 'occupied'];
  return cfg.map((t, i) => ({
    id: crypto.randomUUID(),
    number: t.number,
    capacity: t.capacity,
    status: statuses[i],
    customerName: statuses[i] === 'occupied' ? pick(INDIAN_NAMES) : null,
    seatedAt: statuses[i] === 'occupied' ? Date.now() - randInt(5, 55) * 60000 : null,
  }));
}

export function generateSeedEvents() {
  const now = Date.now();
  return [
    { id: crypto.randomUUID(), type: 'added', message: 'Ananya Iyer added to queue (party of 3)', time: now - 2 * 60000 },
    { id: crypto.randomUUID(), type: 'seated', message: 'Table 6 assigned to Rohan Mehta', time: now - 8 * 60000 },
    { id: crypto.randomUUID(), type: 'added', message: 'Karan Malhotra added to queue (party of 4)', time: now - 14 * 60000 },
    { id: crypto.randomUUID(), type: 'left', message: 'Meera Shah left the queue', time: now - 21 * 60000 },
    { id: crypto.randomUUID(), type: 'reservation', message: 'Reservation created for 7:30 PM · Party of 6', time: now - 34 * 60000 },
    { id: crypto.randomUUID(), type: 'seated', message: 'Table 2 assigned to Priya Deshmukh', time: now - 48 * 60000 },
  ];
}

export function formatMinsAgo(ms) {
  const mins = Math.floor((Date.now() - ms) / 60000);
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 min ago';
  if (mins < 60) return `${mins} mins ago`;
  const h = Math.floor(mins / 60);
  return `${h}h ${mins % 60}m ago`;
}

export function formatWaitTime(ms) {
  const mins = Math.floor((Date.now() - ms) / 60000);
  const s = Math.floor(((Date.now() - ms) % 60000) / 1000);
  return { mins, seconds: s, label: `${mins}:${String(s).padStart(2, '0')}` };
}

export function waitColor(mins) {
  if (mins >= 45) return 'red';
  if (mins >= 30) return 'orange';
  if (mins >= 20) return 'yellow';
  return 'green';
}
