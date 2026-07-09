'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SeatFlowLogo } from '@/components/seatflow/Logo';
import { ArrowRight, ShieldCheck, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', username: '', password: '', confirm: '', role: 'owner' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [isFirst, setIsFirst] = useState(false);

  useEffect(() => {
    fetch('/api/auth/has-users').then((r) => r.json()).then((d) => setIsFirst(!d.hasUsers));
  }, []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (form.password !== form.confirm) { setErr('Passwords do not match'); return; }
    if (form.password.length < 6) { setErr('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, username: form.username, password: form.password, role: form.role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Registration failed');
      toast.success(`Welcome, ${data.user.name}!`);
      router.push('/');
    } catch (e) { setErr(e.message); setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      <div className="flex flex-col p-8 lg:p-14">
        <SeatFlowLogo />
        <div className="flex-1 flex items-center py-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs text-muted-foreground mb-6">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              {isFirst ? 'Create the first admin account' : 'Create your team account'}
            </div>
            <h1 className="font-serif text-4xl lg:text-5xl leading-[1.05] tracking-tight text-foreground">Get started.</h1>
            <p className="mt-2 text-muted-foreground">{isFirst ? 'The first account is automatically made a Super Admin.' : 'Sign up to join your restaurant workspace.'}</p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <div className="space-y-1.5"><Label>Full name *</Label><Input autoFocus value={form.name} onChange={(e) => update('name', e.target.value)} className="h-11" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="h-11" required /></div>
                <div className="space-y-1.5"><Label>Mobile</Label><Input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="h-11" /></div>
              </div>
              <div className="space-y-1.5"><Label>Username *</Label><Input value={form.username} onChange={(e) => update('username', e.target.value)} className="h-11" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Password *</Label><Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} className="h-11" required /></div>
                <div className="space-y-1.5"><Label>Confirm *</Label><Input type="password" value={form.confirm} onChange={(e) => update('confirm', e.target.value)} className="h-11" required /></div>
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                {isFirst ? (
                  <div className="h-11 rounded-md border bg-muted/40 px-3 flex items-center text-sm text-muted-foreground">Super Admin · auto-assigned for the first account</div>
                ) : (
                  <Select value={form.role} onValueChange={(v) => update('role', v)}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Restaurant Owner</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                      <SelectItem value="receptionist">Receptionist</SelectItem>
                      <SelectItem value="waiter">Waiter</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              {err && <div className="rounded-md bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm px-3 py-2">{err}</div>}
              <Button type="submit" disabled={loading} className="w-full h-11 text-[15px] group">
                {loading ? 'Creating account…' : (<>Create account <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>)}
              </Button>
              <p className="text-center text-xs text-muted-foreground">Already have an account? <a href="/" className="text-emerald-700 font-medium hover:underline">Sign in</a></p>
            </form>
          </motion.div>
        </div>
      </div>

      <div className="hidden lg:block relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-600">
        <div className="absolute inset-0 noise-bg opacity-30" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative h-full p-14 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs">
            <Users className="h-3 w-3" /> Role-based access
          </div>
          <h2 className="mt-8 font-serif text-5xl leading-[1.05] max-w-md">Built for the whole team.</h2>
          <p className="mt-4 text-white/80 max-w-md">Owners see everything. Managers run operations. Waiters see their tables. Cashiers focus on billing. Receptionists manage reservations. Everyone stays in their lane.</p>
          <div className="mt-10 grid grid-cols-2 gap-3 max-w-md">
            {['Super Admin', 'Restaurant Owner', 'Manager', 'Cashier', 'Waiter', 'Receptionist'].map((r) => (
              <div key={r} className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm">{r}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
