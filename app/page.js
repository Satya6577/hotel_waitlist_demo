'use client';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Login } from '@/components/seatflow/Login';
import { AppShell } from '@/components/seatflow/AppShell';
import { Dashboard } from '@/components/seatflow/Dashboard';
import { QueueView } from '@/components/seatflow/QueueView';
import { TablesView } from '@/components/seatflow/TablesView';
import { AnalyticsView } from '@/components/seatflow/AnalyticsView';
import { TimelineView } from '@/components/seatflow/TimelineView';
import { SettingsView } from '@/components/seatflow/SettingsView';
import { AddCustomerModal } from '@/components/seatflow/AddCustomerModal';
import { generateSeedTables, generateSeedEvents } from '@/lib/seatflow/data';

const STORAGE_KEY = 'seatflow-state-v1';

// Mock API functions for GitHub Pages (no server-side support)
async function apiGet(path) {
  // When deployed on GitHub Pages, return mock data
  if (typeof window === 'undefined') return [];
  
  try {
    const r = await fetch(path, { cache: 'no-store' });
    if (!r.ok) throw new Error('api error');
    return r.json();
  } catch {
    // Fallback to mock data for GitHub Pages
    return [];
  }
}

async function apiSend(method, path, body) {
  // Mock API calls for GitHub Pages (local storage only)
  try {
    const r = await fetch(path, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    return r.json();
  } catch {
    return { ok: true };
  }
}

export default function Page() {
  const [authed, setAuthed] = useState(false);
  const [view, setView] = useState('dashboard');
  const [queue, setQueue] = useState([]);
  const [tables, setTables] = useState([]);
  const [events, setEvents] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Load state from local storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setAuthed(parsed.authed || false);
        setTables(parsed.tables?.length ? parsed.tables : generateSeedTables());
        setEvents(parsed.events?.length ? parsed.events : generateSeedEvents());
        setQueue(parsed.queue?.length ? parsed.queue : generateSeedTables());
      } else {
        setTables(generateSeedTables());
        setEvents(generateSeedEvents());
        setQueue([]);
      }
    } catch {
      setTables(generateSeedTables());
      setEvents(generateSeedEvents());
      setQueue([]);
    }
    setReady(true);
  }, []);

  // Poll for queue updates (local storage fallback)
  useEffect(() => {
    if (!ready) return;
    const t = setInterval(async () => {
      try {
        const items = await apiGet('/api/queue');
        setQueue((prev) => {
          const known = new Set(prev.map((q) => q.id));
          const newcomers = (items || []).filter((q) => !known.has(q.id) && q.source === 'guest');
          newcomers.forEach((n) => {
            toast.success(`👋 ${n.name} joined via QR`, { description: `Queue #${String(n.number).padStart(2, '0')} · party of ${n.party}` });
            setEvents((ev) => [{ id: crypto.randomUUID(), type: 'added', message: `${n.name} self checked-in (party of ${n.party})`, time: Date.now() }, ...ev].slice(0, 40));
          });
          return items && items.length ? items : prev;
        });
      } catch {}
    }, 4000);
    return () => clearInterval(t);
  }, [ready]);

  // Persist state to local storage
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ authed, tables, events, queue }));
  }, [authed, tables, events, queue, ready]);

  // Keyboard shortcut
  useEffect(() => {
    if (!authed) return;
    const handler = (e) => {
      if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'n' || e.key === 'N') { e.preventDefault(); setAddOpen(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [authed]);

  const nextNumber = useMemo(() => {
    const max = queue.reduce((m, q) => Math.max(m, q.number), 0);
    return max + 1;
  }, [queue]);

  const addEvent = useCallback((type, message) => {
    setEvents((ev) => [{ id: crypto.randomUUID(), type, message, time: Date.now() }, ...ev].slice(0, 40));
  }, []);

  const handleAdd = async (item) => {
    setQueue((q) => [...q, item].sort((a, b) => a.arrivalTime - b.arrivalTime));
    addEvent('added', `${item.name} added to queue (party of ${item.party})`);
    toast.success(`${item.name} added to queue`, { description: `Queue #${String(item.number).padStart(2, '0')} · party of ${item.party}` });
    try {
      await apiSend('POST', '/api/queue', { ...item, source: 'staff' });
    } catch {}
  };

  const handleSeat = async (customer) => {
    const candidates = tables.filter((t) => t.status === 'available' && t.capacity >= customer.party).sort((a, b) => a.capacity - b.capacity);
    if (candidates.length === 0) {
      toast.error('No compatible table available', { description: `Need a table for ${customer.party}. Free one up first.` });
      return;
    }
    const table = candidates[0];
    setTables((ts) => ts.map((t) => t.id === table.id ? { ...t, status: 'occupied', customerName: customer.name, seatedAt: Date.now() } : t));
    setQueue((q) => q.filter((c) => c.id !== customer.id));
    addEvent('seated', `Table ${table.number} assigned to ${customer.name}`);
    toast.success(`Seated at Table ${table.number}`, { description: `${customer.name} · party of ${customer.party}` });
    try { await apiSend('PATCH', `/api/queue/${customer.id}`, { status: 'seated', tableNumber: table.number }); } catch {}
  };

  const handleAssign = async (table, customer) => {
    setTables((ts) => ts.map((t) => t.id === table.id ? { ...t, status: 'occupied', customerName: customer.name, seatedAt: Date.now() } : t));
    setQueue((q) => q.filter((c) => c.id !== customer.id));
    addEvent('seated', `Table ${table.number} assigned to ${customer.name}`);
    toast.success(`Seated at Table ${table.number}`);
    try { await apiSend('PATCH', `/api/queue/${customer.id}`, { status: 'seated', tableNumber: table.number }); } catch {}
  };

  const handleFreeTable = (table) => {
    setTables((ts) => ts.map((t) => t.id === table.id ? { ...t, status: 'cleaning', customerName: null, seatedAt: null } : t));
    addEvent('left', `Table ${table.number} finished · sent for cleaning`);
    toast(`Table ${table.number} freed`, { description: 'Marked for cleaning.' });
  };

  const handleSetTableStatus = (table, status) => {
    setTables((ts) => ts.map((t) => t.id === table.id ? { ...t, status, customerName: status === 'available' ? null : t.customerName, seatedAt: status === 'available' ? null : t.seatedAt } : t));
    toast(`Table ${table.number} · ${status}`);
  };

  const handleRemove = async (customer) => {
    setQueue((q) => q.filter((c) => c.id !== customer.id));
    addEvent('left', `${customer.name} left the queue`);
    toast(`${customer.name} removed from queue`);
    try { await apiSend('PATCH', `/api/queue/${customer.id}`, { status: 'cancelled' }); } catch {}
  };

  const handleNoShow = async (customer) => {
    setQueue((q) => q.filter((c) => c.id !== customer.id));
    addEvent('left', `${customer.name} marked as no-show`);
    toast.warning(`${customer.name} marked as no-show`);
    try { await apiSend('PATCH', `/api/queue/${customer.id}`, { status: 'no_show' }); } catch {}
  };

  const handleLogout = () => { setAuthed(false); setView('dashboard'); };

  if (!ready) return <div className="min-h-screen bg-background" />;

  if (!authed) {
    return <Login onLogin={() => { setAuthed(true); toast.success('Welcome back to SeatFlow'); }} />;
  }

  const views = {
    dashboard: <Dashboard queue={queue} tables={tables} events={events} onAdd={() => setAddOpen(true)} onSeat={handleSeat} onRemove={handleRemove} onNoShow={handleNoShow} setView={setView} />,
    queue: <QueueView queue={queue} onAdd={() => setAddOpen(true)} onSeat={handleSeat} onRemove={handleRemove} onNoShow={handleNoShow} />,
    tables: <TablesView tables={tables} queue={queue} onAssign={handleAssign} onFree={handleFreeTable} onSetStatus={handleSetTableStatus} />,
    timeline: <TimelineView events={events} />,
    analytics: <AnalyticsView />,
    settings: <SettingsView />,
  };

  return (
    <>
      <AppShell view={view} setView={setView} waitingCount={queue.length} onLogout={handleLogout}>
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {views[view]}
          </motion.div>
        </AnimatePresence>
      </AppShell>
      <AddCustomerModal open={addOpen} onOpenChange={setAddOpen} onAdd={handleAdd} nextNumber={nextNumber} />
    </>
  );
}
