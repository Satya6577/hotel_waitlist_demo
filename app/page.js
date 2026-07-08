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
import { generateSeedTables, generateSeedEvents, generateSeedQueue } from '@/lib/seatflow/data';

const STORAGE_KEY = 'seatflow-state-v1';

export default function Page() {
  const [authed, setAuthed] = useState(false);
  const [view, setView] = useState('dashboard');
  const [queue, setQueue] = useState([]);
  const [tables, setTables] = useState([]);
  const [events, setEvents] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Initialize from local storage or generate seed data
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setAuthed(parsed.authed || false);
        setQueue(parsed.queue?.length ? parsed.queue : generateSeedQueue());
        setTables(parsed.tables?.length ? parsed.tables : generateSeedTables());
        setEvents(parsed.events?.length ? parsed.events : generateSeedEvents());
      } else {
        setQueue(generateSeedQueue());
        setTables(generateSeedTables());
        setEvents(generateSeedEvents());
      }
    } catch {
      setQueue(generateSeedQueue());
      setTables(generateSeedTables());
      setEvents(generateSeedEvents());
    }
    setReady(true);
  }, []);

  // Persist to local storage
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ authed, queue, tables, events }));
  }, [authed, queue, tables, events, ready]);

  // Keyboard shortcut: N -> add customer
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

  const handleAdd = (item) => {
    setQueue((q) => [...q, item].sort((a, b) => a.arrivalTime - b.arrivalTime));
    addEvent('added', `${item.name} added to queue (party of ${item.party})`);
    toast.success(`${item.name} added to queue`, { description: `Queue #${String(item.number).padStart(2, '0')} · party of ${item.party}` });
  };

  const handleSeat = (customer) => {
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
  };

  const handleAssign = (table, customer) => {
    setTables((ts) => ts.map((t) => t.id === table.id ? { ...t, status: 'occupied', customerName: customer.name, seatedAt: Date.now() } : t));
    setQueue((q) => q.filter((c) => c.id !== customer.id));
    addEvent('seated', `Table ${table.number} assigned to ${customer.name}`);
    toast.success(`Seated at Table ${table.number}`);
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

  const handleRemove = (customer) => {
    setQueue((q) => q.filter((c) => c.id !== customer.id));
    addEvent('left', `${customer.name} left the queue`);
    toast(`${customer.name} removed from queue`);
  };

  const handleNoShow = (customer) => {
    setQueue((q) => q.filter((c) => c.id !== customer.id));
    addEvent('left', `${customer.name} marked as no-show`);
    toast.warning(`${customer.name} marked as no-show`);
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
