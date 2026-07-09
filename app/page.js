'use client';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Login } from '@/components/seatflow/Login';
import { AppShell } from '@/components/seatflow/AppShell';
import { Dashboard } from '@/components/seatflow/Dashboard';
import { QueueView } from '@/components/seatflow/QueueView';
import { TablesViewV2 } from '@/components/seatflow/TablesViewV2';
import { AnalyticsView } from '@/components/seatflow/AnalyticsView';
import { TimelineView } from '@/components/seatflow/TimelineView';
import { SettingsView } from '@/components/seatflow/SettingsView';
import { WaitersView } from '@/components/seatflow/WaitersView';
import { AddCustomerModal } from '@/components/seatflow/AddCustomerModal';
<<<<<<< HEAD
import { NotifyReadyPopup } from '@/components/seatflow/NotifyReadyPopup';
import { generateSeedTables, generateSeedEvents } from '@/lib/seatflow/data';
=======
import { generateSeedTables, generateSeedEvents, generateSeedQueue } from '@/lib/seatflow/data';
>>>>>>> d9e3a9883090f1d612d325cd37e35c7abad8ab95

const STORAGE_KEY = 'seatflow-state-v2';

<<<<<<< HEAD
async function apiGet(path) {
  const r = await fetch(path, { cache: 'no-store', credentials: 'include' });
  if (!r.ok) throw new Error('api error');
  return r.json();
}
async function apiSend(method, path, body) {
  const r = await fetch(path, {
    method, headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  return r.json();
}

=======
>>>>>>> d9e3a9883090f1d612d325cd37e35c7abad8ab95
export default function Page() {
  const [authed, setAuthed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [access, setAccess] = useState(null);
  const [view, setView] = useState('dashboard');

  const [queue, setQueue] = useState([]);
  const [tables, setTables] = useState([]);
  const [events, setEvents] = useState([]);
  const [sections, setSections] = useState([]);
  const [waiters, setWaiters] = useState([]);

  const [addOpen, setAddOpen] = useState(false);
  const [notifyPopup, setNotifyPopup] = useState(null); // { customer, table }
  const [ready, setReady] = useState(false);

<<<<<<< HEAD
  // ----- Auth check on mount -----
  useEffect(() => {
    (async () => {
      try {
        const { user, access: acc, defaultRoute, roleLabel } = await apiGet('/api/auth/me');
        if (user) {
          setCurrentUser({ ...user, roleLabel });
          setAccess(acc);
          setAuthed(true);
          setView(defaultRoute || 'dashboard');
        }
      } catch {}

      // Local state
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setTables(parsed.tables?.length ? parsed.tables : generateSeedTables());
          setEvents(parsed.events?.length ? parsed.events : generateSeedEvents());
        } else {
          setTables(generateSeedTables());
          setEvents(generateSeedEvents());
        }
      } catch {
        setTables(generateSeedTables());
        setEvents(generateSeedEvents());
      }
      setReady(true);
    })();
  }, []);

  // ----- Load reference data (sections + waiters) after auth OR when demo/authed -----
  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        const [s, w] = await Promise.all([apiGet('/api/sections'), apiGet('/api/waiters')]);
        setSections(s || []);
        setWaiters(w || []);
        // Bind sectionId onto seeded tables if they only have sectionSlot
        setTables((prev) => prev.map((t) => {
          if (t.sectionId) return t;
          const slot = t.sectionSlot != null ? t.sectionSlot : 0;
          const sec = (s || [])[Math.min(slot, (s || []).length - 1)];
          return { ...t, sectionId: sec?.id };
        }));
      } catch {}

      // Queue: fetch, seed if empty
      try {
        let items = await apiGet('/api/queue');
        if (!items || items.length === 0) {
          await apiSend('POST', '/api/queue/seed');
          items = await apiGet('/api/queue');
        }
        setQueue(items || []);
      } catch { setQueue([]); }
    })();
  }, [ready]);

  // ----- Persist local UI state (tables + events; queue/sections/waiters live in backend) -----
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tables, events }));
  }, [tables, events, ready]);

  // ----- Poll queue for guest self check-ins -----
  useEffect(() => {
    if (!ready || !authed) return;
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
          return items || [];
        });
      } catch {}
    }, 4000);
    return () => clearInterval(t);
  }, [ready, authed]);

  // ----- Keyboard shortcut: N for add customer -----
=======
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
>>>>>>> d9e3a9883090f1d612d325cd37e35c7abad8ab95
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

<<<<<<< HEAD
  const refreshWaiters = async () => { try { setWaiters(await apiGet('/api/waiters') || []); } catch {} };

  // ----- Queue handlers -----
  const handleAdd = async (item) => {
    setQueue((q) => [...q, item].sort((a, b) => a.arrivalTime - b.arrivalTime));
    addEvent('added', `${item.name} added to queue (party of ${item.party})`);
    toast.success(`${item.name} added to queue`, { description: `Queue #${String(item.number).padStart(2, '0')} · party of ${item.party}` });
    try {
      await apiSend('POST', '/api/queue', { ...item, source: 'staff' });
      const items = await apiGet('/api/queue'); setQueue(items || []);
    } catch {}
  };

  const seatCustomerAtTable = async (customer, table, waiterId) => {
    setTables((ts) => ts.map((t) => t.id === table.id ? { ...t, status: 'occupied', customerName: customer.name, customerPhone: customer.phone, seatedAt: Date.now(), assignedWaiterId: waiterId || t.assignedWaiterId || null } : t));
    setQueue((q) => q.filter((c) => c.id !== customer.id));
    addEvent('seated', `Table ${table.number} assigned to ${customer.name}`);
    toast.success(`Seated at Table ${table.number}`, { description: `${customer.name} · party of ${customer.party}` });
    try { await apiSend('PATCH', `/api/queue/${customer.id}`, { status: 'seated', tableNumber: table.number }); } catch {}
  };

  const handleSeat = async (customer) => {
    const candidates = tables.filter((t) => t.status === 'available' && t.capacity >= customer.party).sort((a, b) => a.capacity - b.capacity);
    if (candidates.length === 0) { toast.error('No compatible table available', { description: `Need a table for ${customer.party}. Free one up first.` }); return; }
    await seatCustomerAtTable(customer, candidates[0]);
  };

  const handleAssign = async (table, customer, waiterId) => {
    await seatCustomerAtTable(customer, table, waiterId);
=======
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
>>>>>>> d9e3a9883090f1d612d325cd37e35c7abad8ab95
  };

  const handleFreeTable = (table) => {
    setTables((ts) => ts.map((t) => t.id === table.id ? { ...t, status: 'cleaning', customerName: null, customerPhone: null, seatedAt: null } : t));
    addEvent('left', `Table ${table.number} finished · sent for cleaning`);
    toast(`Table ${table.number} freed`, { description: 'Marked for cleaning.' });
  };

  const handleSetTableStatus = (table, status) => {
    // Detect reserved → available transition → trigger notification popup
    const wasReserved = table.status === 'reserved' && !!table.reservedFor;
    setTables((ts) => ts.map((t) => {
      if (t.id !== table.id) return t;
      const patch = { ...t, status };
      if (status === 'available') { patch.customerName = null; patch.customerPhone = null; patch.seatedAt = null; }
      return patch;
    }));
    toast(`Table ${table.number} · ${status}`);
    addEvent('table_status', `Table ${table.number} status → ${status}`);

    if (wasReserved && status === 'available') {
      // Fire notify popup
      setNotifyPopup({ customer: table.reservedFor, table });
    }
  };

  const handleUpdateTable = (tableId, patch) => {
    setTables((ts) => ts.map((t) => t.id === tableId ? { ...t, ...patch } : t));
    if (patch.status === 'reserved') toast.success('Reservation created', { description: patch.reservedFor?.name });
    if (patch.assignedWaiterId !== undefined) {
      const w = waiters.find((x) => x.id === patch.assignedWaiterId);
      if (w) { toast(`Assigned ${w.name}`); addEvent('waiter_assigned', `${w.name} assigned to Table`); }
    }
  };

  const handleNotifyReadyManual = (table) => {
    if (table?.reservedFor) setNotifyPopup({ customer: table.reservedFor, table });
    else toast.error('No reservation on this table');
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

  const handleLogout = async () => {
    try { await apiSend('POST', '/api/auth/logout'); } catch {}
    setAuthed(false); setCurrentUser(null); setAccess(null); setView('dashboard');
  };

  const onNotifySent = async () => {
    if (!notifyPopup) return;
    try {
      await apiSend('POST', '/api/notifications', {
        customerName: notifyPopup.customer?.name,
        customerPhone: notifyPopup.customer?.phone,
        tableNumber: notifyPopup.table?.number,
        type: 'table_ready',
        provider: 'whatsapp_click',
        status: 'sent',
      });
    } catch {}
    toast.success('📩 WhatsApp opened — click Send to notify guest');
    addEvent('notified', `WhatsApp opened for ${notifyPopup.customer?.name} · Table ${notifyPopup.table?.number}`);
    setNotifyPopup(null);
  };

  if (!ready) return <div className="min-h-screen bg-background" />;

  if (!authed) {
    return <Login onLogin={(data) => {
      setCurrentUser({ ...data.user, roleLabel: data.roleLabel });
      setAccess(data.access || null);
      setAuthed(true);
      setView(data.defaultRoute || 'dashboard');
    }} />;
  }

  const canAccess = (v) => !access || access.includes(v);

  const views = {
    dashboard: canAccess('dashboard') && <Dashboard queue={queue} tables={tables} events={events} onAdd={() => setAddOpen(true)} onSeat={handleSeat} onRemove={handleRemove} onNoShow={handleNoShow} setView={setView} />,
    queue: canAccess('queue') && <QueueView queue={queue} onAdd={() => setAddOpen(true)} onSeat={handleSeat} onRemove={handleRemove} onNoShow={handleNoShow} />,
    tables: canAccess('tables') && <TablesViewV2 tables={tables} queue={queue} waiters={waiters} sections={sections} onAssign={handleAssign} onFree={handleFreeTable} onSetStatus={handleSetTableStatus} onUpdateTable={handleUpdateTable} onNotifyReady={handleNotifyReadyManual} />,
    waiters: canAccess('waiters') && <WaitersView waiters={waiters} onRefresh={refreshWaiters} />,
    timeline: canAccess('timeline') && <TimelineView events={events} />,
    analytics: canAccess('analytics') && <AnalyticsView />,
    settings: canAccess('settings') && <SettingsView />,
  };

  const currentView = views[view] || (
    <div className="p-8 max-w-lg mx-auto text-center">
      <div className="font-serif text-2xl mb-2">Access restricted</div>
      <div className="text-sm text-muted-foreground">Your role ({currentUser?.roleLabel}) doesn&apos;t have access to this section.</div>
    </div>
  );

  return (
    <>
      <AppShell view={view} setView={setView} waitingCount={queue.length} onLogout={handleLogout} currentUser={currentUser} access={access}>
        <AnimatePresence mode="wait">
          <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
            {currentView}
          </motion.div>
        </AnimatePresence>
      </AppShell>
      <AddCustomerModal open={addOpen} onOpenChange={setAddOpen} onAdd={handleAdd} nextNumber={nextNumber} />
      <NotifyReadyPopup open={!!notifyPopup} item={notifyPopup} onClose={() => setNotifyPopup(null)} onSent={onNotifySent} />
    </>
  );
}
