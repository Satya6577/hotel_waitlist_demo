'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatWaitTime, waitColor } from '@/lib/seatflow/data';
import { Cake, Baby, Accessibility, Star, Phone, MoreHorizontal, MessageSquare, ArrowRight, Pencil, X, UserX, Sparkles, Users, Clock } from 'lucide-react';

export function QueueCard({ item, index, tick, onSeat, onRemove, onNoShow, compact }) {
  const { mins, label } = formatWaitTime(item.arrivalTime);
  const color = waitColor(mins);
  const isNext = index === 0;

  const colorMap = {
    green: { ring: 'ring-emerald-200 dark:ring-emerald-900', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300', dot: 'bg-emerald-500' },
    yellow: { ring: 'ring-amber-200 dark:ring-amber-900', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300', dot: 'bg-amber-500' },
    orange: { ring: 'ring-orange-200 dark:ring-orange-900', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300', dot: 'bg-orange-500' },
    red: { ring: 'ring-red-200 dark:ring-red-900', badge: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300', dot: 'bg-red-500' },
  }[color];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 200, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className={`group relative rounded-2xl border bg-card p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow ${
        isNext ? 'ring-2 ring-emerald-500/60 border-emerald-500/40' : 'border-border'
      }`}
    >
      {isNext && (
        <div className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase shadow">
          <Sparkles className="h-3 w-3" /> Next to Seat
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Queue number */}
        <div className={`shrink-0 h-14 w-14 rounded-xl border flex flex-col items-center justify-center ${isNext ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-muted/50 text-foreground border-border'}`}>
          <div className="text-[10px] font-medium opacity-80">QUEUE</div>
          <div className="text-lg font-bold leading-none tabular-nums">#{String(item.number).padStart(2, '0')}</div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[15px] truncate">{item.name}</h3>
            {item.vip && <Badge className="h-5 gap-1 bg-amber-500 hover:bg-amber-500 text-white"><Star className="h-3 w-3 fill-white" />VIP</Badge>}
            {item.priority === 'high' && !item.vip && <Badge variant="secondary" className="h-5">Priority</Badge>}
            {item.birthday && <span title="Birthday" className="text-pink-500"><Cake className="h-3.5 w-3.5" /></span>}
            {item.babyChair && <span title="Baby chair" className="text-sky-500"><Baby className="h-3.5 w-3.5" /></span>}
            {item.wheelchair && <span title="Wheelchair" className="text-indigo-500"><Accessibility className="h-3.5 w-3.5" /></span>}
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> Party of {item.party}</span>
            {item.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {item.phone}</span>}
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Est. {item.estimatedWait}m</span>
          </div>
          {item.request && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" /> {item.request}
            </div>
          )}
        </div>

        {/* Live timer */}
        <div className="text-right">
          <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${colorMap.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${colorMap.dot} animate-pulse`} />
            {label}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground tabular-nums">Waiting</div>
        </div>
      </div>

      {!compact && (
        <div className="mt-4 flex items-center gap-2">
          <Button size="sm" onClick={() => onSeat(item)} className="gap-1">
            <ArrowRight className="h-3.5 w-3.5" /> Seat customer
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Pencil className="h-3.5 w-3.5 mr-2" /> Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNoShow(item)}><UserX className="h-3.5 w-3.5 mr-2" /> Mark no-show</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRemove(item)} className="text-destructive focus:text-destructive"><X className="h-3.5 w-3.5 mr-2" /> Cancel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </motion.div>
  );
}

export function QueueList({ queue, onSeat, onRemove, onNoShow, compact = false }) {
  const [, forceTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {queue.map((item, i) => (
          <QueueCard key={item.id} item={item} index={i} onSeat={onSeat} onRemove={onRemove} onNoShow={onNoShow} compact={compact} />
        ))}
      </AnimatePresence>
      {queue.length === 0 && (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="font-medium">Queue is clear</div>
          <div className="text-sm text-muted-foreground mt-1">Every guest has been seated. Enjoy the calm.</div>
        </div>
      )}
    </div>
  );
}
