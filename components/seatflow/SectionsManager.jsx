'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layers, Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = [
  { id: 'emerald', label: 'Emerald', class: 'bg-emerald-600' },
  { id: 'sky', label: 'Sky', class: 'bg-sky-600' },
  { id: 'amber', label: 'Amber', class: 'bg-amber-600' },
  { id: 'rose', label: 'Rose', class: 'bg-rose-600' },
  { id: 'purple', label: 'Purple', class: 'bg-purple-600' },
];

async function api(method, path, body) {
  const r = await fetch(path, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, credentials: 'include' });
  return { ok: r.ok, data: await r.json().catch(() => null) };
}

export function SectionsManager({ sections, onRefresh }) {
  const [editing, setEditing] = useState(null); // id being renamed
  const [draft, setDraft] = useState('');
  const [newName, setNewName] = useState('');

  const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

  const saveName = async (s) => {
    if (!draft.trim()) return;
    const r = await api('PATCH', `/api/sections/${s.id}`, { name: draft.trim() });
    if (r.ok) { toast.success(`Renamed to “${draft.trim()}”`); onRefresh(); setEditing(null); }
    else toast.error(r.data?.error || 'Failed to rename');
  };

  const toggleEnabled = async (s) => {
    await api('PATCH', `/api/sections/${s.id}`, { enabled: !(s.enabled ?? true) });
    onRefresh();
    toast(`${s.name} ${s.enabled === false ? 'enabled' : 'disabled'}`);
  };

  const changeColor = async (s, color) => {
    await api('PATCH', `/api/sections/${s.id}`, { color });
    onRefresh();
  };

  const move = async (s, dir) => {
    const idx = sortedSections.findIndex((x) => x.id === s.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sortedSections.length) return;
    const a = sortedSections[idx], b = sortedSections[swapIdx];
    await Promise.all([
      api('PATCH', `/api/sections/${a.id}`, { order: b.order }),
      api('PATCH', `/api/sections/${b.id}`, { order: a.order }),
    ]);
    onRefresh();
  };

  const remove = async (s) => {
    if (!confirm(`Delete ${s.name}? Tables in this section will need to be reassigned.`)) return;
    const r = await api('DELETE', `/api/sections/${s.id}`);
    if (r.ok) { toast(`${s.name} deleted`); onRefresh(); }
  };

  const addSection = async (e) => {
    e?.preventDefault();
    if (!newName.trim()) return;
    const order = (sections[sections.length - 1]?.order || sections.length) + 1;
    const r = await api('POST', '/api/sections', { name: newName.trim(), order, color: 'emerald', enabled: true });
    if (r.ok) { toast.success(`“${newName.trim()}” added`); setNewName(''); onRefresh(); }
  };

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {sortedSections.map((s, i) => {
          const isEnabled = s.enabled !== false;
          const isEditing = editing === s.id;
          return (
            <motion.div key={s.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className={`rounded-xl border p-4 flex items-center gap-3 ${isEnabled ? 'bg-card' : 'bg-muted/40 opacity-70'}`}>
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => move(s, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
                  <button onClick={() => move(s, 1)} disabled={i === sortedSections.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
                </div>
                <div className={`h-8 w-8 rounded-lg grid place-items-center text-white ${COLORS.find((c) => c.id === s.color)?.class || 'bg-emerald-600'}`}><Layers className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveName(s)} className="h-9 max-w-xs" />
                      <Button size="sm" onClick={() => saveName(s)} className="h-9 gap-1"><Check className="h-3.5 w-3.5" /> Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(null)} className="h-9"><X className="h-3.5 w-3.5" /></Button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditing(s.id); setDraft(s.name); }} className="font-semibold text-left hover:text-emerald-700 dark:hover:text-emerald-400">
                      {s.name}
                    </button>
                  )}
                  <div className="text-xs text-muted-foreground mt-0.5">Order {s.order} · {isEnabled ? 'Visible' : 'Hidden'}</div>
                </div>
                <Select value={s.color || 'emerald'} onValueChange={(v) => changeColor(s, v)}>
                  <SelectTrigger className="w-28 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COLORS.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="inline-flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${c.class}`} />{c.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Switch checked={isEnabled} onCheckedChange={() => toggleEnabled(s)} />
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-red-600 hover:text-red-700" onClick={() => remove(s)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <form onSubmit={addSection} className="flex items-center gap-2 pt-2">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Ground Floor, Terrace, AC Hall…" className="h-10" />
        <Button type="submit" className="h-10 gap-1"><Plus className="h-4 w-4" /> Add section</Button>
      </form>
    </div>
  );
}
