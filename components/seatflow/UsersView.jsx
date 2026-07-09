'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, Pencil, Trash2, KeyRound, Shield, ShieldCheck, Mail, Phone, Users } from 'lucide-react';
import { toast } from 'sonner';

const ROLE_LABELS = {
  super_admin: 'Super Admin', owner: 'Restaurant Owner', manager: 'Manager',
  cashier: 'Cashier', waiter: 'Waiter', receptionist: 'Receptionist',
};
const ROLE_COLORS = {
  super_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
  owner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  manager: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  cashier: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  waiter: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
  receptionist: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

async function api(method, path, body) {
  const r = await fetch(path, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, credentials: 'include' });
  return { ok: r.ok, data: await r.json().catch(() => null) };
}

export function UsersView({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null); // {mode:'add'|'edit'|'reset', user?}
  const [confirmDel, setConfirmDel] = useState(null);

  const load = async () => {
    const r = await api('GET', '/api/users');
    if (r.ok) setUsers(r.data);
  };
  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) => {
    if (filter !== 'all' && u.role !== filter) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return (u.name || '').toLowerCase().includes(s) || (u.email || '').toLowerCase().includes(s) || (u.username || '').toLowerCase().includes(s);
  });

  const counts = users.reduce((a, u) => { a[u.role] = (a[u.role] || 0) + 1; return a; }, {});
  const activeCount = users.filter((u) => u.active !== false).length;

  const remove = async () => {
    if (!confirmDel) return;
    const r = await api('DELETE', `/api/users/${confirmDel.id}`);
    if (r.ok) { toast(`${confirmDel.name} removed`); load(); }
    else toast.error(r.data?.error || 'Failed');
    setConfirmDel(null);
  };

  const toggleActive = async (u) => {
    const next = u.active === false;
    await api('PATCH', `/api/users/${u.id}`, { active: next });
    toast(`${u.name} ${next ? 'activated' : 'deactivated'}`);
    load();
  };

  const changeRole = async (u, role) => {
    await api('PATCH', `/api/users/${u.id}`, { role });
    toast(`${u.name} → ${ROLE_LABELS[role]}`);
    load();
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Access</div>
          <h1 className="font-serif text-3xl md:text-4xl tracking-tight mt-1">User management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your team&apos;s access, roles and passwords.</p>
        </div>
        <Button onClick={() => setModal({ mode: 'add' })} className="gap-1"><UserPlus className="h-4 w-4" /> Add user</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" /> Total users</div>
          <div className="text-2xl font-semibold mt-1 tabular-nums">{users.length}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5" /> Active</div>
          <div className="text-2xl font-semibold mt-1 tabular-nums">{activeCount}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Shield className="h-3.5 w-3.5" /> Admins</div>
          <div className="text-2xl font-semibold mt-1 tabular-nums">{(counts.super_admin || 0) + (counts.owner || 0)}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">Staff</div>
          <div className="text-2xl font-semibold mt-1 tabular-nums">{(counts.manager || 0) + (counts.cashier || 0) + (counts.waiter || 0) + (counts.receptionist || 0)}</div>
        </Card>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email, username…" className="pl-9" />
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All ({users.length})</TabsTrigger>
            <TabsTrigger value="super_admin">Admin ({counts.super_admin || 0})</TabsTrigger>
            <TabsTrigger value="owner">Owner ({counts.owner || 0})</TabsTrigger>
            <TabsTrigger value="manager">Mgr ({counts.manager || 0})</TabsTrigger>
            <TabsTrigger value="waiter">Waiter ({counts.waiter || 0})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <th className="text-left px-4 py-3 font-semibold">User</th>
              <th className="text-left px-4 py-3 font-semibold">Contact</th>
              <th className="text-left px-4 py-3 font-semibold">Role</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.map((u) => {
                const isActive = u.active !== false;
                const isSelf = currentUser?.id === u.id;
                return (
                  <motion.tr key={u.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9"><AvatarFallback className="bg-emerald-600 text-white text-xs">{u.name.split(' ').map((x) => x[0]).slice(0, 2).join('')}</AvatarFallback></Avatar>
                        <div className="min-w-0">
                          <div className="font-medium truncate flex items-center gap-1.5">{u.name}{isSelf && <span className="text-[10px] font-semibold uppercase text-emerald-600 tracking-wider">You</span>}</div>
                          <div className="text-xs text-muted-foreground">@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-muted-foreground inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {u.email}</div>
                      {u.phone && <div className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" /> {u.phone}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <Select value={u.role} onValueChange={(v) => changeRole(u, v)} disabled={isSelf}>
                        <SelectTrigger className="h-8 w-[150px] gap-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_LABELS).map(([k, v]) => (
                            <SelectItem key={k} value={k}><span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${ROLE_COLORS[k]}`}>{v}</span></SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Switch checked={isActive} onCheckedChange={() => !isSelf && toggleActive(u)} disabled={isSelf} />
                        <span className={`text-xs font-medium ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}`}>{isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" title="Edit" onClick={() => setModal({ mode: 'edit', user: u })}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" title="Reset password" onClick={() => setModal({ mode: 'reset', user: u })}><KeyRound className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700" title="Remove" onClick={() => !isSelf && setConfirmDel(u)} disabled={isSelf}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-sm text-muted-foreground">No users match your search.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <UserFormModal open={!!modal} state={modal} onClose={() => setModal(null)} onSuccess={() => { setModal(null); load(); }} />

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {confirmDel?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the account and revoke all access.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-red-600 hover:bg-red-700">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function UserFormModal({ open, state, onClose, onSuccess }) {
  const isReset = state?.mode === 'reset';
  const isEdit = state?.mode === 'edit';
  const isAdd = state?.mode === 'add';

  const [form, setForm] = useState({ name: '', email: '', phone: '', username: '', password: '', role: 'manager' });

  useEffect(() => {
    if (!open) return;
    if (isEdit) setForm({ name: state.user.name, email: state.user.email, phone: state.user.phone || '', username: state.user.username, password: '', role: state.user.role });
    else if (isReset) setForm({ ...form, password: '' });
    else setForm({ name: '', email: '', phone: '', username: '', password: '', role: 'manager' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, state]);

  const submit = async (e) => {
    e.preventDefault();
    if (isAdd) {
      const r = await api('POST', '/api/auth/register', { ...form });
      if (!r.ok) { toast.error(r.data?.error || 'Failed'); return; }
      toast.success(`${form.name} added`);
      onSuccess();
    } else if (isEdit) {
      const payload = { name: form.name, email: form.email, phone: form.phone, role: form.role };
      const r = await api('PATCH', `/api/users/${state.user.id}`, payload);
      if (!r.ok) { toast.error(r.data?.error || 'Failed'); return; }
      toast.success('Saved');
      onSuccess();
    } else if (isReset) {
      if (form.password.length < 6) { toast.error('Password must be 6+ characters'); return; }
      const r = await api('PATCH', `/api/users/${state.user.id}`, { password: form.password });
      if (!r.ok) { toast.error(r.data?.error || 'Failed'); return; }
      toast.success('Password reset');
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isAdd ? 'Add new user' : isEdit ? `Edit ${state?.user?.name}` : `Reset password for ${state?.user?.name}`}</DialogTitle>
          <DialogDescription>{isAdd ? 'They&apos;ll receive their sign-in credentials from you.' : isEdit ? 'Update details and role.' : 'Set a new password. The user will use this to sign in next time.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {!isReset && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2"><Label>Full name *</Label><Input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="space-y-1.5"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                {isAdd && <div className="space-y-1.5 col-span-2"><Label>Username *</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></div>}
                <div className="space-y-1.5 col-span-2">
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
          {(isAdd || isReset) && (
            <div className="space-y-1.5"><Label>{isReset ? 'New password *' : 'Password *'}</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="6+ characters" required /></div>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">{isAdd ? 'Create user' : isReset ? 'Reset password' : 'Save changes'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
