'use client';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Clock, TrendingUp, Users, Utensils, Timer, Activity } from 'lucide-react';

const hourly = [
  { h: '12p', c: 4 }, { h: '1p', c: 9 }, { h: '2p', c: 12 }, { h: '3p', c: 6 },
  { h: '4p', c: 3 }, { h: '5p', c: 5 }, { h: '6p', c: 8 }, { h: '7p', c: 14 },
  { h: '8p', c: 18 }, { h: '9p', c: 15 }, { h: '10p', c: 9 },
];

const weekly = [
  { d: 'Mon', wait: 12 }, { d: 'Tue', wait: 10 }, { d: 'Wed', wait: 15 },
  { d: 'Thu', wait: 18 }, { d: 'Fri', wait: 26 }, { d: 'Sat', wait: 34 }, { d: 'Sun', wait: 28 },
];

const partySize = [
  { name: '2', v: 42 }, { name: '3', v: 18 }, { name: '4', v: 24 }, { name: '5', v: 8 }, { name: '6+', v: 8 },
];

const waitBuckets = [
  { name: '0–10m', v: 34 }, { name: '10–20m', v: 28 }, { name: '20–30m', v: 18 }, { name: '30–45m', v: 12 }, { name: '45m+', v: 8 },
];

const PIE_COLORS = ['hsl(158 64% 45%)', 'hsl(173 58% 45%)', 'hsl(43 84% 60%)', 'hsl(24 90% 60%)', 'hsl(0 70% 60%)'];

function Kpi({ icon, label, value, sub, positive }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
      {sub && <div className={`text-xs mt-1 ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>{sub}</div>}
    </Card>
  );
}

export function AnalyticsView() {
  const tooltipStyle = { borderRadius: 10, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: 12, color: 'hsl(var(--foreground))' };
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div>
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Analytics</div>
        <h1 className="font-serif text-3xl md:text-4xl tracking-tight mt-1">Insights</h1>
        <p className="text-sm text-muted-foreground mt-1">Understand your guests, tune your operations.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={<Clock className="h-3.5 w-3.5" />} label="Average wait" value="18m" sub="− 4m vs last week" positive />
        <Kpi icon={<TrendingUp className="h-3.5 w-3.5" />} label="Peak hour" value="8–9 PM" sub="32 covers avg" positive />
        <Kpi icon={<Timer className="h-3.5 w-3.5" />} label="Avg turnover" value="46m" sub="+ 3m healthier" positive />
        <Kpi icon={<Users className="h-3.5 w-3.5" />} label="Served (7d)" value="612" sub="+ 12%" positive />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Queue trend</h3>
              <p className="text-xs text-muted-foreground">Average wait time this week</p>
            </div>
            <span className="text-xs text-emerald-600 font-medium">Trending down</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="d" fontSize={12} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="wait" stroke="hsl(158 64% 45%)" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--background))' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <h3 className="font-semibold">Popular party size</h3>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={partySize} dataKey="v" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3} stroke="hsl(var(--card))">
                  {partySize.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="font-semibold">Hourly inflow</h3>
            <p className="text-xs text-muted-foreground">Guests added to queue · today</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="h" fontSize={12} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} />
                <Bar dataKey="c" fill="hsl(158 64% 45%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <h3 className="font-semibold">Waiting distribution</h3>
            <p className="text-xs text-muted-foreground">Time buckets · last 30 days</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waitBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} />
                <Bar dataKey="v" radius={[6, 6, 0, 0]}>
                  {waitBuckets.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
