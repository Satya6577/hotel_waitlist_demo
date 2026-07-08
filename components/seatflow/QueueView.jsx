'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QueueList } from './QueueCard';
import { Card } from '@/components/ui/card';
import { Plus, Users, Clock, Timer } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function QueueView({ queue, onAdd, onSeat, onRemove, onNoShow }) {
  const [filter, setFilter] = useState('all');
  const filtered = queue.filter((q) => filter === 'all' || (filter === 'vip' ? q.vip : filter === 'priority' ? q.priority === 'high' : true));
  const avgWait = queue.length > 0 ? Math.round(queue.reduce((a, q) => a + (Date.now() - q.arrivalTime) / 60000, 0) / queue.length) : 0;
  const longest = queue.length > 0 ? Math.round(Math.max(...queue.map((q) => (Date.now() - q.arrivalTime) / 60000))) : 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Queue</div>
          <h1 className="font-serif text-3xl md:text-4xl tracking-tight mt-1">Live waitlist</h1>
          <p className="text-sm text-muted-foreground mt-1">Automatically ordered by arrival time · timers update every second.</p>
        </div>
        <Button onClick={onAdd} className="gap-1"><Plus className="h-4 w-4" /> Add customer</Button>
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" /> In queue</div>
          <div className="text-2xl font-semibold mt-1 tabular-nums">{queue.length}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> Avg wait</div>
          <div className="text-2xl font-semibold mt-1 tabular-nums">{avgWait}<span className="text-lg text-muted-foreground">m</span></div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Timer className="h-3.5 w-3.5" /> Longest wait</div>
          <div className="text-2xl font-semibold mt-1 tabular-nums">{longest}<span className="text-lg text-muted-foreground">m</span></div>
        </Card>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All ({queue.length})</TabsTrigger>
          <TabsTrigger value="vip">VIP ({queue.filter((q) => q.vip).length})</TabsTrigger>
          <TabsTrigger value="priority">Priority ({queue.filter((q) => q.priority === 'high').length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <QueueList queue={filtered} onSeat={onSeat} onRemove={onRemove} onNoShow={onNoShow} />
    </div>
  );
}
