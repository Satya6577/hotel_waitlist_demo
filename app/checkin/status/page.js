'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SeatFlowLogo } from '@/components/seatflow/Logo';
import { Button } from '@/components/ui/button';
import { Users, Clock, Sparkles, CheckCircle2, PartyPopper, Utensils, ArrowLeft, X } from 'lucide-react';

function StatusInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);

  const load = useCallback(async () => {
    if (!id) { setError('Missing id'); return; }
    try {
      const res = await fetch(`/api/queue/${id}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Not found');
      setMe(await res.json());
    } catch (e) { setError(e.message); }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const t = setInterval(() => { load(); setTick((n) => n + 1); }, 5000);
    const t2 = setInterval(() => setTick((n) => n + 1), 1000);
    return () => { clearInterval(t); clearInterval(t2); };
  }, [load]);

  const cancel = async () => {
    if (!id) return;
    if (!confirm('Leave the queue?')) return;
    await fetch(`/api/queue/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'cancelled' }) });
    try { localStorage.removeItem('seatflow-guest-id'); } catch {}
    router.push('/checkin');
  };

  if (error) return <Fallback message={error} />;
  if (!me) return <Fallback message="Loading…" />;

  const waitMs = Date.now() - me.arrivalTime;
  const mins = Math.floor(waitMs / 60000);
  const secs = Math.floor((waitMs % 60000) / 1000);
  const estRemaining = Math.max(0, (me.estimatedWait || 15) - mins);

  const isSeated = me.status === 'seated';
  const isCancelled = me.status === 'cancelled' || me.status === 'no_show';

  if (isSeated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 text-white flex flex-col">
        <div className="p-5"><SeatFlowLogo size={28} /></div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="h-24 w-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-6">
            <PartyPopper className="h-12 w-12" />
          </motion.div>
          <div className="font-serif text-5xl leading-none">Your table is ready!</div>
          <p className="mt-4 text-white/85 max-w-sm">Please head to the host stand — they&apos;re expecting you, <span className="font-semibold">{me.name}</span>.</p>
          <div className="mt-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-4">
            <div className="text-xs uppercase tracking-wider text-white/70">Queue #</div>
            <div className="font-serif text-4xl">{String(me.number).padStart(2, '0')}</div>
          </div>
        </div>
      </div>
    );
  }

  if (isCancelled) return <Fallback message="You&apos;re no longer in the queue." showBack />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-emerald-950 dark:via-background dark:to-emerald-950/50">
      <div className="max-w-md mx-auto px-5 pt-5">
        <div className="flex items-center justify-between">
          <SeatFlowLogo size={28} />
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/70 backdrop-blur px-2.5 py-1 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
          </div>
        </div>

        {/* Hero card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="mt-4 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-6 shadow-xl shadow-emerald-500/20">
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-emerald-400/30 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-teal-300/20 blur-3xl" />
          <div className="relative">
            <div className="text-xs uppercase tracking-wider text-emerald-100">You&apos;re in line, {me.name.split(' ')[0]}</div>
            <div className="mt-6 flex items-baseline gap-2">
              <div className="font-serif text-[88px] leading-none">#{String(me.position).padStart(2, '0')}</div>
              <div className="text-lg text-emerald-100">in queue</div>
            </div>
            <div className="mt-2 text-sm text-emerald-100">Queue number <span className="font-semibold text-white">#{String(me.number).padStart(2, '0')}</span> · party of {me.party}</div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/10 border border-white/15 p-3">
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-100"><Clock className="h-3 w-3" /> Waiting</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">{mins}:{String(secs).padStart(2, '0')}</div>
              </div>
              <div className="rounded-xl bg-white/10 border border-white/15 p-3">
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-100"><Sparkles className="h-3 w-3" /> Est. remaining</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">~{estRemaining}m</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress */}
        <div className="mt-4 rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold">Your progress</div>
              <div className="text-xs text-muted-foreground">We&apos;ll notify you when it&apos;s your turn</div>
            </div>
            <div className="text-xs text-muted-foreground tabular-nums">{me.position} of many</div>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(6, 100 - me.position * 15)}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <ul className="mt-4 space-y-2">
            <Step done label="Added to queue" desc={`Queue #${String(me.number).padStart(2, '0')} · arrived just now`} />
            <Step active={me.position === 1} label={me.position === 1 ? 'You&apos;re next!' : 'Waiting for a table'} desc={me.position === 1 ? 'Please stay nearby' : `${me.position - 1} ${me.position - 1 === 1 ? 'group' : 'groups'} ahead of you`} />
            <Step label="Table ready" desc="You&apos;ll see this screen turn green" />
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <button onClick={() => router.push('/checkin')} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button onClick={cancel} className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-medium">
            <X className="h-4 w-4" /> Leave the queue
          </button>
        </div>

        <div className="mt-6 pb-8 text-center text-[11px] text-muted-foreground">This page updates automatically · keep it open</div>
      </div>
    </div>
  );
}

function Step({ done, active, label, desc }) {
  return (
    <li className="flex items-start gap-3">
      <div className={`mt-0.5 h-5 w-5 rounded-full grid place-items-center shrink-0 ${
        done ? 'bg-emerald-500 text-white' : active ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500 animate-pulse' : 'bg-muted text-muted-foreground'
      }`}>
        {done ? <CheckCircle2 className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      </div>
      <div>
        <div className={`text-sm font-medium ${active ? 'text-emerald-700 dark:text-emerald-300' : ''}`}>{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </li>
  );
}

function Fallback({ message, showBack }) {
  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="text-center max-w-sm">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-muted grid place-items-center mb-4"><Utensils className="h-5 w-5 text-muted-foreground" /></div>
        <div className="font-serif text-2xl">{message}</div>
        {showBack && <Button className="mt-4" onClick={() => (window.location.href = '/checkin')}>Join the queue again</Button>}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Fallback message="Loading…" />}>
      <StatusInner />
    </Suspense>
  );
}
