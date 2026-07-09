'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { QueueList } from './QueueCard';
import { Button } from '@/components/ui/button';
import { Users, Utensils, Clock, TrendingUp, CircleCheck, IndianRupee, Activity, Timer, Plus, ArrowUpRight, ArrowRight } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import { formatMinsAgo } from '@/lib/seatflow/data';

const hourly = [
  { h: '12p', c: 4 }, { h: '1p', c: 9 }, { h: '2p', c: 12 }, { h: '3p', c: 6 },
  { h: '4p', c: 3 }, { h: '5p', c: 5 }, { h: '6p', c: 8 }, { h: '7p', c: 14 },
  { h: '8p', c: 18 }, { h: '9p', c: 15 }, { h: '10p', c: 9 },
];

function useAnimatedNumber(target) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf; const start = performance.now(); const from = 0;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / 800);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(from + (target - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}

function KpiCard({ icon, label, value, suffix, delta, positive = true, format = 'int', accent = 'emerald' }) {
  const n = useAnimatedNumber(typeof value === 'number' ? value : 0);
  const display = typeof value === 'number' ? (format === 'int' ? Math.round(n) : n.toFixed(1)) : value;
  const accentBg = { emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    sky: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300',
  }[accent];
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card className="p-4 md:p-5 border-border/80 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${accentBg}`}>{icon}</div>
          {delta != null && (
            <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3 rotate-90" />} {delta}
            </span>
          )}
        </div>
        <div className="mt-3 text-xs text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-2xl md:text-[26px] font-semibold tracking-tight tabular-nums">
          {display}{suffix && <span className="text-lg text-muted-foreground ml-0.5">{suffix}</span>}
        </div>
      </Card>
    </motion.div>
  );
}

export function Dashboard({ queue, tables, events, onAdd, onSeat, onRemove, onNoShow, setView }) {
  const waiting = queue.length;
  const available = tables.filter((t) => t.status === 'available').length;
  const occupied = tables.filter((t) => t.status === 'occupied').length;
  const avgWait = waiting > 0 ? Math.round(queue.reduce((a, q) => a + (Date.now() - q.arrivalTime) / 60000, 0) / waiting) : 0;
  const longest = waiting > 0 ? Math.round(Math.max(...queue.map((q) => (Date.now() - q.arrivalTime) / 60000))) : 0;
  const health = Math.max(0, Math.min(100, 100 - avgWait * 1.5 - Math.max(0, waiting - available) * 3));

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1500px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dashboard</div>
          <h1 className="font-serif text-3xl md:text-4xl tracking-tight mt-1">Good evening, Aarav.</h1>
          <p className="text-sm text-muted-foreground mt-1">Here&apos;s what&apos;s happening at Spice House right now.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setView('tables')} className="gap-1"><Utensils className="h-4 w-4" /> Floor plan</Button>
          <Button onClick={onAdd} className="gap-1"><Plus className="h-4 w-4" /> Add customer</Button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KpiCard icon={<Users className="h-4 w-4" />} label="Customers waiting" value={waiting} delta="+3" accent="emerald" />
        <KpiCard icon={<CircleCheck className="h-4 w-4" />} label="Tables available" value={available} suffix={`/${tables.length}`} accent="sky" />
        <KpiCard icon={<Utensils className="h-4 w-4" />} label="Occupied tables" value={occupied} suffix={`/${tables.length}`} accent="amber" />
        <KpiCard icon={<Clock className="h-4 w-4" />} label="Average wait" value={avgWait} suffix="m" delta="-4m" accent="purple" />
        <KpiCard icon={<CircleCheck className="h-4 w-4" />} label="Served today" value={87} delta="+12%" accent="emerald" />
        <KpiCard icon={<Timer className="h-4 w-4" />} label="Longest wait" value={longest} suffix="m" positive={false} accent="rose" />
        <KpiCard icon={<IndianRupee className="h-4 w-4" />} label="Today&apos;s revenue" value="₹ 1,42,300" delta="+8%" accent="slate" />
        <KpiCard icon={<Activity className="h-4 w-4" />} label="Queue health" value={Math.round(health)} suffix="/100" accent="emerald" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Live Queue */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[15px] font-semibold">Live queue</h2>
              <p className="text-xs text-muted-foreground">Sorted by arrival · auto-updating</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setView('queue')}>View all <ArrowRight className="h-3 w-3" /></Button>
          </div>
          <QueueList queue={queue.slice(0, 4)} onSeat={onSeat} onRemove={onRemove} onNoShow={onNoShow} compact />
        </div>

        {/* Right column */}
        <div className="space-y-4 md:space-y-6">
          {/* Floor snapshot */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[15px] font-semibold">Restaurant floor</h3>
                <p className="text-xs text-muted-foreground">{available} available · {occupied} seated</p>
              </div>
              <Button size="sm" variant="ghost" className="text-xs" onClick={() => setView('tables')}>Open <ArrowRight className="h-3 w-3 ml-0.5" /></Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {tables.map((t) => (
                <MiniTable key={t.id} t={t} />
              ))}
            </div>
          </Card>

          {/* Activity feed */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[15px] font-semibold">Recent activity</h3>
                <p className="text-xs text-muted-foreground">Today&apos;s events</p>
              </div>
              <Button size="sm" variant="ghost" className="text-xs" onClick={() => setView('timeline')}>Timeline <ArrowRight className="h-3 w-3 ml-0.5" /></Button>
            </div>
            <ul className="space-y-3">
              {events.slice(0, 5).map((e) => (
                <li key={e.id} className="flex gap-3 items-start">
                  <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                    e.type === 'seated' ? 'bg-emerald-500' : e.type === 'added' ? 'bg-sky-500' : e.type === 'reservation' ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground/90 truncate">{e.message}</div>
                    <div className="text-[11px] text-muted-foreground">{formatMinsAgo(e.time)}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {/* Sparkline */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-[15px] font-semibold">Guest inflow</h3>
                <p className="text-xs text-muted-foreground">Hour by hour today</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium"><TrendingUp className="h-3 w-3" /> +18%</span>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourly} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(158 64% 45%)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="hsl(158 64% 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="h" fontSize={10} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: 12 }} />
                  <Area type="monotone" dataKey="c" stroke="hsl(158 64% 40%)" strokeWidth={2} fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MiniTable({ t }) {
  const map = {
    available: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 pulse-available',
    occupied: 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300',
    cleaning: 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    reserved: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  };
  return (
    <div className={`aspect-square rounded-lg border flex flex-col items-center justify-center text-[11px] font-medium ${map[t.status]}`}>
      <div className="font-bold">T{t.number}</div>
      <div className="text-[9px] opacity-70">{t.capacity} seats</div>
    </div>
  );
}
