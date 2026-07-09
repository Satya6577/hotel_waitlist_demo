'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { SeatFlowLogo } from './Logo';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Utensils, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';

export function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [hasUsers, setHasUsers] = useState(true);

  useEffect(() => {
    fetch('/api/auth/has-users').then((r) => r.json()).then((d) => setHasUsers(d.hasUsers));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Login failed');
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      onLogin(data);
    } catch (e) { setErr(e.message); setLoading(false); }
  };

  // Backward compatible demo login (if no users registered yet, allow the old demo flow)
  const demoLogin = () => {
    onLogin({ user: { name: 'Aarav Sharma', username: 'demo', role: 'owner', email: 'owner@spicehouse.in' },
      access: ['dashboard', 'queue', 'tables', 'waiters', 'timeline', 'analytics', 'settings'], defaultRoute: 'dashboard', roleLabel: 'Restaurant Owner' });
    toast.success('Signed in with demo account');
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      <div className="flex flex-col p-8 lg:p-14">
        <SeatFlowLogo />
        <div className="flex-1 flex items-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="w-full max-w-sm mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs text-muted-foreground mb-6">
              <Sparkles className="h-3 w-3 text-emerald-600" />
              Loved by 1,200+ restaurants across India
            </div>
            <h1 className="font-serif text-4xl lg:text-5xl leading-[1.05] tracking-tight text-foreground">Welcome back.</h1>
            <p className="mt-2 text-muted-foreground">Sign in to manage your queue and floor in real-time.</p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">Username or email</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="h-11" placeholder="owner@spicehouse.in" required />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" className="text-xs font-medium text-emerald-700 hover:underline">Forgot?</button>
                </div>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" required />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="remember" defaultChecked />
                <label htmlFor="remember" className="text-sm text-muted-foreground">Keep me signed in on this device</label>
              </div>
              {err && <div className="rounded-md bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm px-3 py-2">{err}</div>}
              <Button type="submit" disabled={loading} className="w-full h-11 text-[15px] font-medium group">
                {loading ? 'Signing in…' : (<>Sign in <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>)}
              </Button>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex-1 h-px bg-border" /> or <div className="flex-1 h-px bg-border" />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => (window.location.href = '/register')}>Create account</Button>
                {!hasUsers && (
                  <Button type="button" variant="ghost" className="h-11" onClick={demoLogin}>Try demo</Button>
                )}
              </div>

              <p className="text-center text-xs text-muted-foreground pt-2">By continuing you agree to SeatFlow&apos;s Terms and Privacy.</p>
            </form>
          </motion.div>
        </div>
        <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} SeatFlow Labs · Made for restaurants.</div>
      </div>

      <div className="hidden lg:block relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-600">
        <div className="absolute inset-0 noise-bg opacity-30" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-teal-300/20 blur-3xl" />

        <div className="relative h-full p-14 flex flex-col justify-between text-white">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" /> Live in production
            </div>
            <h2 className="mt-8 font-serif text-5xl leading-[1.05] max-w-md">Never lose a guest to a chaotic waitlist again.</h2>
            <p className="mt-4 text-white/80 max-w-md">SeatFlow keeps your queue perfectly ordered, tables perfectly assigned, and hosts perfectly calm — even on the busiest Saturday night.</p>
          </div>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center"><Utensils className="h-4 w-4" /></div>
                <div>
                  <div className="text-sm font-semibold">Spice House · Bandra</div>
                  <div className="text-xs text-white/70">Saturday, 8:42 PM</div>
                </div>
              </div>
              <div className="text-xs bg-emerald-300/20 text-emerald-200 rounded-full px-2 py-1">Health 92</div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Stat icon={<Users className="h-4 w-4" />} label="Waiting" value="7" />
              <Stat icon={<Utensils className="h-4 w-4" />} label="Occupied" value="9/12" />
              <Stat icon={<Clock className="h-4 w-4" />} label="Avg wait" value="18m" />
            </div>
            <div className="mt-4 space-y-2">
              {[{n:'#01 Raj S.',p:4,w:'32m'},{n:'#02 Priya D.',p:2,w:'21m'},{n:'#03 Amit P.',p:6,w:'14m'}].map((r) => (
                <div key={r.n} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                  <div className="text-sm">{r.n} · <span className="text-white/70">party of {r.p}</span></div>
                  <div className="text-xs text-white/80 tabular-nums">{r.w}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-3">
      <div className="flex items-center gap-1.5 text-white/70 text-[11px]">{icon}{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
