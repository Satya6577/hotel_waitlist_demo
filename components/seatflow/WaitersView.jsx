'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { UserPlus, Phone, IdCard, Pencil, Trash2, Search, Users2 } from 'lucide-react';
import { toast } from 'sonner';

const STATUS = {
  available: { label: 'Available', chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300', dot: 'bg-emerald-500' },
  busy: { label: 'Busy', chip: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300', dot: 'bg-amber-500' },
  off_duty: { label: 'Off duty', chip: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', dot: 'bg-slate-400' },
};

export function WaitersView({ waiters, onRefresh }) {
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(null); // {mode:'add'|'edit', waiter?:{}}
  const [confirmDel, setConfirmDel] = useState(null);

  const filtered = waiters.filter((w) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (w.name || '').toLowerCase().includes(s) || (w.employeeId || '').toLowerCase().includes(s) || (w.phone || '').includes(s);
  });

  const stats = waiters.reduce((a, w) => { a[w.status] = (a[w.status] || 0) + 1; return a; }, {});

  const save = async (payload) => {
    if (modal?.mode === 'edit') {
      const res = await fetch(`/api/waiters/${modal.waiter.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { toast.success('Waiter updated'); onRefresh(); setModal(null); } else { toast.error('Update failed'); }
    } else {
      const res = await fetch('/api/waiters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { toast.success('Waiter added'); onRefresh(); setModal(null); } else { toast.error('Add failed'); }
    }
  };

  const del = async () => {
    if (!confirmDel) return;
    const res = await fetch(`/api/waiters/${confirmDel.id}`, { method: 'DELETE' });
    if (res.ok) { toast(`${confirmDel.name} removed`); onRefresh(); }
    setConfirmDel(null);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Team</div>
          <h1 className="font-serif text-3xl md:text-4xl tracking-tight mt-1">Waiters</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your service team and their availability.</p>
        </div>
        <Button onClick={() => setModal({ mode: 'add' })} className="gap-1"><UserPlus className="h-4 w-4" /> Add waiter</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard icon={<Users2 className="h-4 w-4" />} label="Total staff" value={waiters.length} accent="emerald" />
        <StatCard label="Available" value={stats.available || 0} accent="emerald" dot />
        <StatCard label="Busy" value={stats.busy || 0} accent="amber" dot />
        <StatCard label="Off duty" value={stats.off_duty || 0} accent="slate" dot />
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, employee ID, phone…" className="pl-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <AnimatePresence>
          {filtered.map((w) => (
            <motion.div key={w.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
              <Card className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <Avatar className="h-11 w-11"><AvatarFallback className="bg-emerald-600 text-white font-semibold">{w.name.split(' ').map((x) => x[0]).slice(0, 2).join('')}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-semibold truncate">{w.name}</div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS[w.status]?.chip}`}>
                        <span className={`h-1 w-1 rounded-full ${STATUS[w.status]?.dot}`} />{STATUS[w.status]?.label}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><IdCard className="h-3 w-3" /> {w.employeeId || '—'}</span>
                      {w.phone && <span className="inline-flex items-center gap-1.5"><Phone className="h-3 w-3" /> {w.phone}</span>}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Select value={w.status} onValueChange={async (v) => { await fetch(`/api/waiters/${w.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: v }) }); onRefresh(); toast.success(`${w.name} · ${STATUS[v].label}`); }}>
                    <SelectTrigger className="h-9 flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="off_duty">Off duty</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setModal({ mode: 'edit', waiter: w })}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="outline" size="icon" className="h-9 w-9 text-red-600 hover:text-red-700" onClick={() => setConfirmDel(w)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed p-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3"><Users2 className="h-6 w-6" /></div>
            <div className="font-medium">No waiters found</div>
            <div className="text-sm text-muted-foreground mt-1">{q ? 'Try a different search.' : 'Add your first team member to get started.'}</div>
          </div>
        )}
      </div>

      <WaiterFormModal open={!!modal} initial={modal?.waiter} mode={modal?.mode} onClose={() => setModal(null)} onSave={save} />

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {confirmDel?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the waiter from your team. Assigned tables will need to be reassigned.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={del} className="bg-red-600 hover:bg-red-700">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({ icon, label, value, accent = 'slate', dot }) {
  const dotMap = { emerald: 'bg-emerald-500', amber: 'bg-amber-500', slate: 'bg-slate-400' };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon || (dot && <span className={`h-1.5 w-1.5 rounded-full ${dotMap[accent]}`} />)}
        {label}
      </div>
      <div className="text-2xl font-semibold mt-1 tabular-nums">{value}</div>
    </Card>
  );
}

function WaiterFormModal({ open, initial, mode, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', employeeId: '', phone: '', status: 'available' });
  useEffect(() => {
    if (open) setForm({ name: initial?.name || '', employeeId: initial?.employeeId || '', phone: initial?.phone || '', status: initial?.status || 'available' });
  }, [open, initial]);
  const submit = (e) => { e.preventDefault(); if (!form.name.trim()) return; onSave(form); };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit waiter' : 'Add new waiter'}</DialogTitle>
          <DialogDescription>{mode === 'edit' ? 'Update this team member\'s details.' : 'Add a new team member to your service staff.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5"><Label>Full name *</Label><Input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Amit Patil" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Employee ID</Label><Input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} placeholder="EMP-101" /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98…" /></div>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="off_duty">Off duty</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">{mode === 'edit' ? 'Save changes' : 'Add waiter'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
