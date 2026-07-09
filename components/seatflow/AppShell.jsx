'use client';
import { useTheme } from 'next-themes';
import { SeatFlowLogo } from './Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LayoutDashboard, ListOrdered, LayoutGrid, LineChart, Settings, Bell, Search, Sun, Moon, ChevronsUpDown, Utensils, LogOut, User, Building2, UserRound } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ALL = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'queue', label: 'Queue', icon: ListOrdered, badge: 'live' },
  { id: 'tables', label: 'Tables', icon: LayoutGrid },
  { id: 'waiters', label: 'Waiters', icon: UserRound },
  { id: 'timeline', label: 'Timeline', icon: Bell },
  { id: 'analytics', label: 'Analytics', icon: LineChart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AppShell({ view, setView, children, waitingCount, onLogout, currentUser, access }) {
  const { theme, setTheme } = useTheme();

  // Filter nav by role access; if access is not provided (backward compat), show all
  const NAV = access?.length ? NAV_ALL.filter((n) => access.includes(n.id)) : NAV_ALL;
  const roleLabel = currentUser?.roleLabel || 'Restaurant Owner';
  const initials = (currentUser?.name || 'User').split(' ').map((x) => x[0]).slice(0, 2).join('');
  const firstName = (currentUser?.name || 'Aarav Sharma').split(' ')[0];

  return (
    <div className="min-h-screen w-full bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-[248px] shrink-0 flex-col bg-sidebar border-r border-sidebar-border">
        <div className="px-5 pt-5 pb-4">
          <SeatFlowLogo />
        </div>

        <div className="px-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-2.5 rounded-xl border border-sidebar-border bg-background hover:bg-accent/50 px-3 py-2 text-left transition-colors">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-xs font-semibold">SH</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">Spice House</div>
                  <div className="text-[11px] text-muted-foreground">Bandra West · Mumbai</div>
                </div>
                <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Your restaurants</DropdownMenuLabel>
              <DropdownMenuItem><Building2 className="h-4 w-4 mr-2" /> Spice House · Bandra</DropdownMenuItem>
              <DropdownMenuItem><Building2 className="h-4 w-4 mr-2" /> Spice House · Powai</DropdownMenuItem>
              <DropdownMenuItem><Building2 className="h-4 w-4 mr-2" /> The Green Fork · Pune</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>+ Add restaurant</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <nav className="mt-5 px-3 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-2">Workspace</div>
          <ul className="space-y-0.5">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = view === n.id;
              return (
                <li key={n.id}>
                  <button
                    onClick={() => setView(n.id)}
                    className={`relative w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/60'
                    }`}
                  >
                    {active && (
                      <motion.div layoutId="active-nav" className="absolute inset-0 rounded-lg bg-sidebar-accent" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                    )}
                    <Icon className="relative h-4 w-4" />
                    <span className="relative flex-1 text-left">{n.label}</span>
                    {n.id === 'queue' && waitingCount > 0 && (
                      <span className="relative inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />{waitingCount}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-4 pb-4">
          <div className="rounded-xl border border-sidebar-border bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Pro Tip</div>
            <div className="mt-1 text-xs text-foreground/80 leading-relaxed">Press <kbd className="px-1 py-0.5 rounded bg-background border text-[10px]">N</kbd> to add a new customer to the queue.</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top nav */}
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30 flex items-center px-4 md:px-6 gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input placeholder="Search customers, tables, notes…" className="pl-9 h-9 bg-muted/50 border-transparent focus-visible:bg-background" />
            <kbd className="hidden md:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground bg-background border rounded px-1.5 py-0.5">⌘ K</kbd>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="h-9 w-9">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 relative" onClick={() => setView('timeline')}>
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 flex items-center gap-2 rounded-full hover:bg-accent p-1 pr-3">
                  <Avatar className="h-7 w-7"><AvatarFallback className="bg-emerald-600 text-white text-xs">{initials}</AvatarFallback></Avatar>
                  <span className="hidden md:inline text-sm font-medium">{firstName}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <div className="text-sm font-medium">{currentUser?.name || 'Aarav Sharma'}</div>
                  <div className="text-xs text-muted-foreground font-normal">{roleLabel} · Spice House</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem><User className="h-4 w-4 mr-2" /> Profile</DropdownMenuItem>
                {(!access || access.includes('settings')) && <DropdownMenuItem onClick={() => setView('settings')}><Settings className="h-4 w-4 mr-2" /> Settings</DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive"><LogOut className="h-4 w-4 mr-2" /> Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
