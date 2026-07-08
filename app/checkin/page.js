'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SeatFlowLogo } from '@/components/seatflow/Logo';
import { Utensils, Users, Sparkles, ArrowRight, Cake, Baby, Star, Accessibility, ShieldCheck, Plus, Minus } from 'lucide-react';

export default function CheckinPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', party: 2, request: '', birthday: false, wheelchair: false, babyChair: false, notes: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setErr('Please tell us your name'); return; }
    setLoading(true); setErr('');
    try {
      const res = await fetch('/api/queue', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'guest' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Something went wrong');
      try { localStorage.setItem('seatflow-guest-id', data.id); } catch {}
      router.push(`/checkin/status?id=${data.id}`);
    } catch (e) { setErr(e.message); setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-emerald-950 dark:via-background dark:to-emerald-950/50">
      {/* Header */}
      <header className="px-5 pt-5 pb-3 flex items-center justify-between max-w-md mx-auto">
        <SeatFlowLogo size={28} />
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/70 backdrop-blur px-2.5 py-1 text-[11px] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Now seating
        </div>
      </header>

      <div className="px-5 pb-10 max-w-md mx-auto">
        {/* Restaurant hero */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
          className="rounded-3xl border border-border bg-card p-6 shadow-lg shadow-emerald-500/5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white"><Utensils className="h-5 w-5" /></div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Welcome to</div>
              <div className="font-serif text-2xl leading-tight">Spice House · Bandra</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Skip the line. Add yourself to our waitlist and we&apos;ll seat you as soon as a table opens up.</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <MiniStat label="Avg wait" value="18m" />
            <MiniStat label="In line" value="7" />
            <MiniStat label="Live" value="🟢" />
          </div>
        </motion.div>

        {/* Form card */}
        <motion.form onSubmit={submit} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}
          className="mt-5 rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm">
          <div>
            <h2 className="font-semibold">Join the queue</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Takes 30 seconds · no account needed</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Your name *</Label>
            <Input id="name" autoFocus value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Riya Kapoor" className="h-11" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Mobile number</Label>
            <Input id="phone" inputMode="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 98…" className="h-11" />
            <p className="text-[11px] text-muted-foreground">We&apos;ll text you when your table is ready.</p>
          </div>

          <div className="space-y-1.5">
            <Label>Party size</Label>
            <div className="grid grid-cols-6 gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button type="button" key={n} onClick={() => update('party', n)}
                  className={`h-11 rounded-lg border text-sm font-semibold transition-all ${form.party === n ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-border hover:bg-muted/50'}`}>
                  {n}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <button type="button" onClick={() => update('party', Math.max(1, form.party - 1))} className="h-8 w-8 rounded-md border grid place-items-center hover:bg-muted"><Minus className="h-3.5 w-3.5" /></button>
              <div className="text-sm text-muted-foreground">Party of <span className="font-semibold text-foreground tabular-nums">{form.party}</span></div>
              <button type="button" onClick={() => update('party', Math.min(20, form.party + 1))} className="h-8 w-8 rounded-md border grid place-items-center hover:bg-muted"><Plus className="h-3.5 w-3.5" /></button>
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Preferences (optional)</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Chip icon={<Cake className="h-3.5 w-3.5" />} label="Birthday" active={form.birthday} onClick={() => update('birthday', !form.birthday)} />
              <Chip icon={<Baby className="h-3.5 w-3.5" />} label="Baby chair" active={form.babyChair} onClick={() => update('babyChair', !form.babyChair)} />
              <Chip icon={<Accessibility className="h-3.5 w-3.5" />} label="Wheelchair" active={form.wheelchair} onClick={() => update('wheelchair', !form.wheelchair)} />
              <Chip icon={<Star className="h-3.5 w-3.5" />} label="Window seat" active={form.request === 'Window seat'} onClick={() => update('request', form.request === 'Window seat' ? '' : 'Window seat')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="req">Anything else?</Label>
            <Textarea id="req" rows={2} value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Allergies, occasion, seating preference…" />
          </div>

          <AnimatePresence>
            {err && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-md bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm px-3 py-2">{err}</motion.div>}
          </AnimatePresence>

          <Button type="submit" disabled={loading} className="w-full h-12 text-[15px] group">
            {loading ? 'Adding you to the line…' : (<>Join the queue <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>)}
          </Button>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground justify-center pt-1">
            <ShieldCheck className="h-3 w-3" /> Your details are only used to seat you today.
          </div>
        </motion.form>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl bg-muted/40 border border-border/50 py-2.5">
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function Chip({ icon, label, active, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all ${
        active ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' : 'border-border hover:bg-muted/40'
      }`}>
      {icon}<span>{label}</span>
    </button>
  );
}
