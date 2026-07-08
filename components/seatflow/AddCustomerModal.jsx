'use client';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Cake, Accessibility, Baby, Star, Plus, Minus } from 'lucide-react';

export function AddCustomerModal({ open, onOpenChange, onAdd, nextNumber }) {
  const [form, setForm] = useState(initial());
  useEffect(() => { if (open) setForm(initial()); }, [open]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      number: nextNumber,
      name: form.name.trim(),
      phone: form.phone.trim(),
      party: Number(form.party) || 2,
      request: form.request,
      birthday: form.birthday,
      wheelchair: form.wheelchair,
      babyChair: form.babyChair,
      vip: form.vip,
      notes: form.notes,
      priority: form.vip ? 'high' : 'normal',
      arrivalTime: Date.now(),
      estimatedWait: 10 + Math.floor(Math.random() * 20),
      status: 'waiting',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden gap-0">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-white text-xl font-semibold">Add to Queue</DialogTitle>
              <DialogDescription className="text-emerald-100 text-sm">Queue #{String(nextNumber).padStart(2, '0')} · arrival captured now</DialogDescription>
            </div>
            <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center text-2xl font-serif">{String(nextNumber).padStart(2, '0')}</div>
          </div>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Customer name *</Label>
              <Input autoFocus value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Raj Sharma" required />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 98…" />
            </div>
            <div className="space-y-1.5">
              <Label>Party size</Label>
              <div className="flex items-center h-10 rounded-md border bg-background">
                <button type="button" onClick={() => update('party', Math.max(1, form.party - 1))} className="px-3 h-full text-muted-foreground hover:text-foreground"><Minus className="h-4 w-4" /></button>
                <div className="flex-1 text-center font-semibold tabular-nums">{form.party}</div>
                <button type="button" onClick={() => update('party', Math.min(20, form.party + 1))} className="px-3 h-full text-muted-foreground hover:text-foreground"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Special request</Label>
              <Input value={form.request} onChange={(e) => update('request', e.target.value)} placeholder="Window seat, quiet corner…" />
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Preferences</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Toggle icon={<Cake className="h-4 w-4" />} label="Birthday" active={form.birthday} onChange={(v) => update('birthday', v)} />
              <Toggle icon={<Star className="h-4 w-4" />} label="VIP guest" active={form.vip} onChange={(v) => update('vip', v)} />
              <Toggle icon={<Accessibility className="h-4 w-4" />} label="Wheelchair" active={form.wheelchair} onChange={(v) => update('wheelchair', v)} />
              <Toggle icon={<Baby className="h-4 w-4" />} label="Baby chair" active={form.babyChair} onChange={(v) => update('babyChair', v)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Internal notes</Label>
            <Textarea rows={2} value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Regular guest, prefers table by window…" />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="min-w-[140px]">Add to queue</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Toggle({ icon, label, active, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!active)}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${
        active ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' : 'border-border hover:bg-muted/50'
      }`}>
      {icon}<span className="flex-1 text-left">{label}</span>
      <Checkbox checked={active} className="pointer-events-none" />
    </button>
  );
}

function initial() {
  return { name: '', phone: '', party: 2, request: '', birthday: false, wheelchair: false, babyChair: false, vip: false, notes: '' };
}
