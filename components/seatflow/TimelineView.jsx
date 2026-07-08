'use client';
import { Card } from '@/components/ui/card';
import { UserPlus, Utensils, LogOut, CalendarClock, Bell } from 'lucide-react';
import { formatMinsAgo } from '@/lib/seatflow/data';
import { motion } from 'framer-motion';

const ICONS = { added: UserPlus, seated: Utensils, left: LogOut, reservation: CalendarClock };
const COLORS = {
  added: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  seated: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  left: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
  reservation: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
};

export function TimelineView({ events }) {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[900px] mx-auto">
      <div className="mb-6">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notifications</div>
        <h1 className="font-serif text-3xl md:text-4xl tracking-tight mt-1">Today&apos;s timeline</h1>
        <p className="text-sm text-muted-foreground mt-1">Every guest, every table, every moment — in order.</p>
      </div>

      <Card className="p-5 md:p-7">
        <div className="relative">
          <div className="absolute left-5 top-2 bottom-2 w-px bg-border" />
          <ul className="space-y-5">
            {events.map((e, i) => {
              const Icon = ICONS[e.type] || Bell;
              return (
                <motion.li key={e.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="relative pl-14">
                  <div className={`absolute left-0 top-0 h-10 w-10 rounded-xl flex items-center justify-center border-4 border-background ${COLORS[e.type]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="pt-1">
                    <div className="text-sm font-medium">{e.message}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{formatMinsAgo(e.time)} · {new Date(e.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </Card>
    </div>
  );
}
