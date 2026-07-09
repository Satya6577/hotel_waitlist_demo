'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Sparkles, CircleCheck, ArrowRight, User, UserRound, Clock, Phone, MessageCircle, Layers } from 'lucide-react';
import { formatWaitTime } from '@/lib/seatflow/data';
import { buildWhatsAppUrl, buildTelUrl, tableReadyMessage } from '@/lib/seatflow/notifications';
import { toast } from 'sonner';

const STATUS = {
  available: { label: 'Available', dot: 'bg-emerald-500', chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300', card: 'border-emerald-500/50 bg-emerald-50/40 dark:bg-emerald-950/20 pulse-available' },
  occupied: { label: 'Occupied', dot: 'bg-red-500', chip: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300', card: 'border-red-500/40 bg-red-50/30 dark:bg-red-950/15' },
  cleaning: { label: 'Cleaning', dot: 'bg-sky-500', chip: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300', card: 'border-sky-500/40 bg-sky-50/40 dark:bg-sky-950/20' },
  reserved: { label: 'Reserved', dot: 'bg-amber-500', chip: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300', card: 'border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20' },
};

export function TablesViewV2({ tables, queue, waiters, sections, onAssign, onFree, onSetStatus, onUpdateTable, onNotifyReady }) {
  const [openTable, setOpenTable] = useState(null);
  const [activeSection, setActiveSection] = useState('all');

  const counts = tables.reduce((a, t) => { a[t.status] = (a[t.status] || 0) + 1; return a; }, {});

  const sectionsSorted = [...(sections || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

  const tablesBySection = sectionsSorted.map((s) => ({
    section: s,
    tables: tables.filter((t) => (t.sectionId || sectionsSorted[0]?.id) === s.id).sort((a, b) => a.number - b.number),
  }));

  const filteredSections = activeSection === 'all' ? tablesBySection : tablesBySection.filter((x) => x.section.id === activeSection);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Floor plan</div>
          <h1 className="font-serif text-3xl md:text-4xl tracking-tight mt-1">Tables</h1>
          <p className="text-sm text-muted-foreground mt-1">Organized by section. Tap any table to seat a guest, assign a waiter, or hold a reservation.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(STATUS).map(([k, v]) => (
            <div key={k} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs">
              <span className={`h-1.5 w-1.5 rounded-full ${v.dot}`} />
              <span className="text-muted-foreground">{v.label}</span>
              <span className="font-semibold tabular-nums">{counts[k] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section tabs */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All sections</TabsTrigger>
          {sectionsSorted.map((s) => (
            <TabsTrigger key={s.id} value={s.id}>{s.name}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="space-y-8">
        {filteredSections.map(({ section, tables: secTables }) => (
          <section key={section.id}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`h-8 w-8 rounded-lg grid place-items-center text-white text-sm font-semibold ${sectionBg(section.color)}`}>
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-semibold tracking-tight">{section.name}</h2>
                <p className="text-xs text-muted-foreground">{secTables.length} tables · {secTables.filter((t) => t.status === 'available').length} available</p>
              </div>
            </div>
            <div className="rounded-3xl border bg-card p-5 md:p-6 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 noise-bg opacity-40 pointer-events-none" />
              <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {secTables.map((t, i) => (
                  <TableCard key={t.id} t={t} i={i} waiter={waiters.find((w) => w.id === t.assignedWaiterId)} onClick={() => setOpenTable(t)} />
                ))}
                {secTables.length === 0 && (
                  <div className="col-span-full text-center py-8 text-sm text-muted-foreground">No tables in this section yet.</div>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>

      <TableActionModal
        table={openTable}
        onOpenChange={() => setOpenTable(null)}
        queue={queue}
        waiters={waiters}
        sections={sectionsSorted}
        onAssign={(c, waiterId) => { onAssign(openTable, c, waiterId); setOpenTable(null); }}
        onFree={() => { onFree(openTable); setOpenTable(null); }}
        onSetStatus={(s) => { onSetStatus(openTable, s); setOpenTable(null); }}
        onUpdateTable={(patch) => { onUpdateTable(openTable.id, patch); setOpenTable(null); }}
        onNotifyReady={() => { onNotifyReady(openTable); }}
      />
    </div>
  );
}

function sectionBg(color) {
  return {
    emerald: 'bg-emerald-600', sky: 'bg-sky-600', amber: 'bg-amber-600', rose: 'bg-rose-600', purple: 'bg-purple-600',
  }[color] || 'bg-emerald-600';
}

function TableCard({ t, i, waiter, onClick }) {
  const s = STATUS[t.status];
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
      whileHover={{ y: -2 }} onClick={onClick}
      className={`relative rounded-2xl border-2 p-4 text-left transition-all hover:shadow-lg ${s.card}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Table</div>
          <div className="font-serif text-3xl leading-none mt-0.5">{String(t.number).padStart(2, '0')}</div>
        </div>
        <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.chip}`}>
          <span className={`h-1 w-1 rounded-full ${s.dot}`} />{s.label}
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Users className="h-3 w-3" /> {t.capacity} seats
        </div>
        {/* Customer */}
        <div className="flex items-center gap-1.5 text-xs">
          <User className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">Guest:</span>
          <span className="font-medium truncate">{t.customerName || t.reservedFor?.name || '—'}</span>
        </div>
        {/* Waiter */}
        <div className="flex items-center gap-1.5 text-xs">
          <UserRound className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">Waiter:</span>
          <span className="font-medium truncate">{waiter?.name || '—'}</span>
        </div>
        {t.status === 'reserved' && t.reservedFor?.time && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300">
            <Clock className="h-3 w-3" />
            <span className="font-medium">{t.reservedFor.time}</span>
          </div>
        )}
        {t.status === 'occupied' && t.seatedAt && (
          <div className="text-[10px] text-muted-foreground tabular-nums text-right">Seated {Math.floor((Date.now() - t.seatedAt) / 60000)}m ago</div>
        )}
      </div>
    </motion.button>
  );
}

function TableActionModal({ table, onOpenChange, queue, waiters, sections, onAssign, onFree, onSetStatus, onUpdateTable, onNotifyReady }) {
  const [waiterId, setWaiterId] = useState('');
  const [reserveForm, setReserveForm] = useState({ name: '', phone: '', time: '' });
  const [tab, setTab] = useState('assign');

  useEffect(() => {
    if (table) { setWaiterId(table.assignedWaiterId || ''); setReserveForm({ name: '', phone: '', time: '' }); setTab(table.status === 'available' ? 'assign' : 'manage'); }
  }, [table]);

  if (!table) return null;

  const suggestions = queue.filter((q) => q.party <= table.capacity).slice(0, 4);
  const availableWaiters = waiters.filter((w) => w.status !== 'off_duty');

  const submitReserve = (e) => {
    e.preventDefault();
    if (!reserveForm.name.trim()) return;
    onUpdateTable({ status: 'reserved', reservedFor: { ...reserveForm } });
  };

  return (
    <Dialog open={!!table} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden gap-0">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white px-6 py-5">
          <DialogTitle className="text-white text-xl font-semibold flex items-center gap-2">Table {String(table.number).padStart(2, '0')}
            <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${STATUS[table.status].chip}`}>{STATUS[table.status].label}</span>
          </DialogTitle>
          <DialogDescription className="text-emerald-100 text-sm">Capacity {table.capacity} · {sections.find((s) => s.id === table.sectionId)?.name || 'Unassigned'}</DialogDescription>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Tabs */}
          <div className="inline-flex rounded-lg bg-muted p-1 text-xs">
            {table.status === 'available' && <TabBtn active={tab === 'assign'} onClick={() => setTab('assign')}>Seat guest</TabBtn>}
            {table.status === 'available' && <TabBtn active={tab === 'reserve'} onClick={() => setTab('reserve')}>Reserve</TabBtn>}
            <TabBtn active={tab === 'manage'} onClick={() => setTab('manage')}>Manage</TabBtn>
          </div>

          {tab === 'assign' && table.status === 'available' && (
            <>
              {/* Waiter selector */}
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Assign waiter</Label>
                <Select value={waiterId || 'none'} onValueChange={(v) => setWaiterId(v === 'none' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Choose a waiter" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No waiter</SelectItem>
                    {availableWaiters.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name} · {w.status === 'busy' ? 'Busy' : 'Available'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Suggested guests</div>
                {suggestions.length === 0 && <div className="text-sm text-muted-foreground">No compatible guests in queue.</div>}
                <div className="space-y-2">
                  {suggestions.map((s, i) => {
                    const { label } = formatWaitTime(s.arrivalTime);
                    return (
                      <div key={s.id} className={`flex items-center gap-3 rounded-xl border p-3 ${i === 0 ? 'border-emerald-500/60 bg-emerald-50/50 dark:bg-emerald-950/30' : 'border-border'}`}>
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center font-bold text-sm">#{String(s.number).padStart(2, '0')}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate flex items-center gap-2">
                            {s.name}{i === 0 && <span className="text-[10px] font-semibold uppercase text-emerald-600">Best match</span>}
                          </div>
                          <div className="text-xs text-muted-foreground">Party of {s.party} · waiting {label}</div>
                        </div>
                        <Button size="sm" onClick={() => onAssign(s, waiterId)} className="gap-1">Assign <ArrowRight className="h-3 w-3" /></Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {tab === 'reserve' && table.status === 'available' && (
            <form onSubmit={submitReserve} className="space-y-4">
              <div className="space-y-1.5"><Label>Guest name *</Label><Input autoFocus value={reserveForm.name} onChange={(e) => setReserveForm({ ...reserveForm, name: e.target.value })} placeholder="e.g. Rahul Sharma" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Phone (for WhatsApp)</Label><Input value={reserveForm.phone} onChange={(e) => setReserveForm({ ...reserveForm, phone: e.target.value })} placeholder="+91 98…" /></div>
                <div className="space-y-1.5"><Label>Time</Label><Input value={reserveForm.time} onChange={(e) => setReserveForm({ ...reserveForm, time: e.target.value })} placeholder="7:30 PM" /></div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Assign waiter (optional)</Label>
                <Select value={waiterId || 'none'} onValueChange={(v) => setWaiterId(v === 'none' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Choose a waiter" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No waiter</SelectItem>
                    {availableWaiters.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => onOpenChange()}>Cancel</Button>
                <Button type="submit">Reserve table</Button>
              </DialogFooter>
            </form>
          )}

          {tab === 'manage' && (
            <>
              {table.status === 'occupied' && (
                <div className="rounded-xl border p-4">
                  <div className="text-xs text-muted-foreground">Currently seated</div>
                  <div className="font-semibold text-lg mt-0.5">{table.customerName || '—'}</div>
                  {table.seatedAt && <div className="text-xs text-muted-foreground mt-1">Seated {Math.floor((Date.now() - table.seatedAt) / 60000)}m ago</div>}
                </div>
              )}
              {table.status === 'reserved' && table.reservedFor && (
                <div className="rounded-xl border-2 border-amber-300 bg-amber-50/60 dark:bg-amber-950/20 p-4">
                  <div className="text-xs text-amber-700 dark:text-amber-300 uppercase tracking-wider font-semibold">Reserved for</div>
                  <div className="font-semibold text-lg mt-0.5">{table.reservedFor.name}</div>
                  {table.reservedFor.time && <div className="text-sm text-muted-foreground">Arrival time: {table.reservedFor.time}</div>}
                  {table.reservedFor.phone && <div className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {table.reservedFor.phone}</div>}
                  <Button size="sm" onClick={onNotifyReady} className="mt-3 gap-1 bg-green-600 hover:bg-green-700">
                    <MessageCircle className="h-3.5 w-3.5" /> Notify guest via WhatsApp
                  </Button>
                </div>
              )}

              {/* Waiter reassign */}
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Assigned waiter</Label>
                <div className="flex gap-2">
                  <Select value={waiterId || 'none'} onValueChange={(v) => { const id = v === 'none' ? '' : v; setWaiterId(id); onUpdateTable({ assignedWaiterId: id }); }}>
                    <SelectTrigger><SelectValue placeholder="Choose a waiter" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No waiter</SelectItem>
                      {availableWaiters.map((w) => <SelectItem key={w.id} value={w.id}>{w.name} · {w.status === 'busy' ? 'Busy' : 'Available'}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground mb-2">Update status</div>
                <div className="flex gap-2 flex-wrap">
                  {table.status !== 'available' && <Button variant="outline" size="sm" onClick={() => onSetStatus('available')}>→ Available</Button>}
                  {table.status === 'occupied' && <Button size="sm" onClick={onFree}><CircleCheck className="h-4 w-4 mr-1" /> Mark as done</Button>}
                  {table.status !== 'cleaning' && <Button variant="outline" size="sm" onClick={() => onSetStatus('cleaning')}>→ Cleaning</Button>}
                  {table.status === 'available' && <Button variant="outline" size="sm" onClick={() => onSetStatus('reserved')}>→ Reserved</Button>}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TabBtn({ active, children, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`px-3 py-1.5 rounded-md font-medium transition-colors ${active ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
      {children}
    </button>
  );
}
