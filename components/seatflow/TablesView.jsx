'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Users, Clock, Sparkles, CircleCheck, Utensils, ArrowRight } from 'lucide-react';
import { formatWaitTime } from '@/lib/seatflow/data';

const STATUS = {
  available: { label: 'Available', dot: 'bg-emerald-500', chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300', card: 'border-emerald-500/50 bg-emerald-50/40 dark:bg-emerald-950/20 pulse-available' },
  occupied: { label: 'Occupied', dot: 'bg-slate-400', chip: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', card: 'border-border bg-muted/30' },
  cleaning: { label: 'Cleaning', dot: 'bg-amber-500', chip: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300', card: 'border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20' },
  reserved: { label: 'Reserved', dot: 'bg-sky-500', chip: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300', card: 'border-sky-500/40 bg-sky-50/40 dark:bg-sky-950/20' },
};

export function TablesView({ tables, queue, onAssign, onFree, onSetStatus }) {
  const [openTable, setOpenTable] = useState(null);
  const counts = tables.reduce((a, t) => { a[t.status] = (a[t.status] || 0) + 1; return a; }, {});

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Floor plan</div>
          <h1 className="font-serif text-3xl md:text-4xl tracking-tight mt-1">Tables</h1>
          <p className="text-sm text-muted-foreground mt-1">Tap any table to seat a guest, mark it clean, or hold a reservation.</p>
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

      <div className="rounded-3xl border bg-card p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 noise-bg opacity-40 pointer-events-none" />
        <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((t, i) => (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -2 }}
              onClick={() => setOpenTable(t)}
              className={`relative rounded-2xl border-2 p-5 text-left transition-all hover:shadow-lg ${STATUS[t.status].card}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Table</div>
                  <div className="font-serif text-4xl leading-none mt-0.5">{String(t.number).padStart(2, '0')}</div>
                </div>
                <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS[t.status].chip}`}>
                  <span className={`h-1 w-1 rounded-full ${STATUS[t.status].dot}`} />
                  {STATUS[t.status].label}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" /> {t.capacity} seats
                </div>
                {t.status === 'occupied' && t.customerName && (
                  <div className="text-[11px] text-foreground/70 truncate max-w-[100px]">{t.customerName}</div>
                )}
                {t.status === 'occupied' && t.seatedAt && (
                  <div className="text-[10px] text-muted-foreground tabular-nums">{Math.floor((Date.now() - t.seatedAt) / 60000)}m</div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <TableActionModal table={openTable} onOpenChange={() => setOpenTable(null)} queue={queue} onAssign={(c) => { onAssign(openTable, c); setOpenTable(null); }} onFree={() => { onFree(openTable); setOpenTable(null); }} onSetStatus={(s) => { onSetStatus(openTable, s); setOpenTable(null); }} />
    </div>
  );
}

function TableActionModal({ table, onOpenChange, queue, onAssign, onFree, onSetStatus }) {
  if (!table) return null;
  const suggestions = queue.filter((q) => q.party <= table.capacity).slice(0, 4);
  return (
    <Dialog open={!!table} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden gap-0">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white px-6 py-5">
          <DialogTitle className="text-white text-xl font-semibold">Table {String(table.number).padStart(2, '0')}</DialogTitle>
          <DialogDescription className="text-emerald-100 text-sm">Capacity {table.capacity} · currently {table.status}</DialogDescription>
        </div>
        <div className="p-6 space-y-5">
          {table.status === 'available' && (
            <>
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
                            {s.name}
                            {i === 0 && <span className="text-[10px] font-semibold uppercase text-emerald-600">Best match</span>}
                          </div>
                          <div className="text-xs text-muted-foreground">Party of {s.party} · waiting {label}</div>
                        </div>
                        <Button size="sm" onClick={() => onAssign(s)} className="gap-1">Assign <ArrowRight className="h-3 w-3" /></Button>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground mb-2">Or update status</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onSetStatus('reserved')}>Mark as reserved</Button>
                  <Button variant="outline" size="sm" onClick={() => onSetStatus('cleaning')}>Send for cleaning</Button>
                </div>
              </div>
            </>
          )}
          {table.status === 'occupied' && (
            <div className="space-y-3">
              <div className="rounded-xl border p-4">
                <div className="text-xs text-muted-foreground">Currently seated</div>
                <div className="font-semibold text-lg mt-0.5">{table.customerName || '—'}</div>
                <div className="text-xs text-muted-foreground mt-1">Seated {table.seatedAt ? Math.floor((Date.now() - table.seatedAt) / 60000) + ' minutes ago' : 'recently'}</div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={onFree}><CircleCheck className="h-4 w-4 mr-1" /> Mark as done</Button>
                <Button variant="outline" onClick={() => onSetStatus('cleaning')}>Cleaning</Button>
              </div>
            </div>
          )}
          {(table.status === 'cleaning' || table.status === 'reserved') && (
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => onSetStatus('available')}><Sparkles className="h-4 w-4 mr-1" /> Mark as available</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
