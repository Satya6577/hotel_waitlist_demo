'use client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Clock, Utensils, Bell, Palette, Languages, Users } from 'lucide-react';
import { useTheme } from 'next-themes';

function Section({ icon, title, description, children }) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center justify-center">{icon}</div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </Card>
  );
}

function Row({ label, description, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-t first:border-t-0">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {description && <div className="text-xs text-muted-foreground">{description}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[900px] mx-auto space-y-6">
      <div>
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Settings</div>
        <h1 className="font-serif text-3xl md:text-4xl tracking-tight mt-1">Preferences</h1>
        <p className="text-sm text-muted-foreground mt-1">Tune SeatFlow to how your restaurant actually works.</p>
      </div>

      <Section icon={<Building2 className="h-4 w-4" />} title="Restaurant details" description="Displayed on receipts and staff app.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Restaurant name</Label><Input defaultValue="Spice House" /></div>
          <div className="space-y-1.5"><Label>Location</Label><Input defaultValue="Bandra West, Mumbai" /></div>
          <div className="space-y-1.5"><Label>Cuisine</Label><Input defaultValue="Modern Indian" /></div>
          <div className="space-y-1.5"><Label>Phone</Label><Input defaultValue="+91 22 4000 1234" /></div>
          <div className="md:col-span-2 space-y-1.5"><Label>Address</Label><Textarea rows={2} defaultValue="12 Linking Road, Bandra West, Mumbai 400050" /></div>
        </div>
      </Section>

      <Section icon={<Clock className="h-4 w-4" />} title="Business hours" description="When the queue is open for walk-ins.">
        {['Weekdays', 'Saturday', 'Sunday'].map((d, i) => (
          <Row key={d} label={d} description={i === 0 ? 'Mon–Fri' : ''}>
            <div className="flex items-center gap-2">
              <Input className="w-24" defaultValue={i === 2 ? '11:00' : '12:00'} />
              <span className="text-muted-foreground text-sm">to</span>
              <Input className="w-24" defaultValue={i === 0 ? '23:00' : '23:30'} />
            </div>
          </Row>
        ))}
      </Section>

      <Section icon={<Utensils className="h-4 w-4" />} title="Table configuration" description="How your floor is laid out.">
        <Row label="Total tables" description="Across all sections"><Input className="w-24" defaultValue={12} /></Row>
        <Row label="Total capacity" description="Maximum simultaneous covers"><Input className="w-24" defaultValue={54} /></Row>
        <Row label="Enable outdoor seating" description="Show separate section for terrace"><Switch defaultChecked /></Row>
        <Row label="Allow reservations to hold tables" description="Table stays reserved until 15m past reservation"><Switch defaultChecked /></Row>
      </Section>

      <Section icon={<Bell className="h-4 w-4" />} title="Notifications" description="When to alert your host and guests.">
        <Row label="SMS guest when ready" description="Auto-message when their table is next"><Switch defaultChecked /></Row>
        <Row label="Alert host if wait exceeds 30 minutes" description="Bright banner + sound"><Switch defaultChecked /></Row>
        <Row label="Weekly performance email" description="Sent every Monday at 9am"><Switch /></Row>
      </Section>

      <Section icon={<Palette className="h-4 w-4" />} title="Appearance" description="Theme and interface preferences.">
        <Row label="Theme" description="Switch between light and dark modes">
          <Select value={theme || 'light'} onValueChange={setTheme}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label="Language" description="Interface language">
          <Select defaultValue="en">
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">Hindi</SelectItem>
              <SelectItem value="mr">Marathi</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      </Section>

      <Section icon={<Users className="h-4 w-4" />} title="Staff management" description="Who can access this restaurant.">
        {[{n:'Aarav Sharma', r:'Owner', e:'owner@spicehouse.in'},{n:'Riya Kapoor', r:'Manager', e:'riya@spicehouse.in'},{n:'Karan D.', r:'Host', e:'karan@spicehouse.in'}].map((s) => (
          <div key={s.e} className="flex items-center justify-between py-3 border-t first:border-t-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold">{s.n.split(' ').map((x) => x[0]).join('')}</div>
              <div>
                <div className="text-sm font-medium">{s.n}</div>
                <div className="text-xs text-muted-foreground">{s.e}</div>
              </div>
            </div>
            <div className="text-xs bg-muted px-2 py-1 rounded-full font-medium">{s.r}</div>
          </div>
        ))}
        <div className="pt-4 border-t mt-2">
          <Button variant="outline" className="w-full">+ Invite team member</Button>
        </div>
      </Section>
    </div>
  );
}
