import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Wallet, BarChart3,
  RefreshCw, Settings, Clock, LogOut, Bell, Briefcase, ChevronDown, CreditCard, Zap,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn, formatCurrency } from '../lib/utils';
import { clearToken } from '../lib/auth';
import { useClient } from '../context/ClientContext';
import { getBillingStatus } from '../lib/api';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/sessions', label: 'Sessions',  icon: CalendarDays },
  { to: '/payments', label: 'Payments',  icon: Wallet },
  { to: '/monthly',  label: 'Monthly',   icon: BarChart3 },
  { to: '/sync',     label: 'Sync',      icon: RefreshCw },
  { to: '/clients',  label: 'Clients',   icon: Briefcase },
  { to: '/settings', label: 'Settings',  icon: Settings },
  { to: '/alerts',   label: 'Alerts',    icon: Bell },
  { to: '/billing',  label: 'Billing',   icon: CreditCard },
];

export function Sidebar({ balance }) {
  const navigate = useNavigate();
  const { clients, selectedClient, setSelectedClientId } = useClient();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const { data: billing } = useQuery({
    queryKey: ['billing'],
    queryFn: getBillingStatus,
    staleTime: 5 * 60_000,
  });

  const owed = balance > 0;
  const over = balance < 0;

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  function handleLogout() {
    clearToken();
    navigate('/login');
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col bg-slate-900 text-slate-100">
      <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-5">
        <Clock className="h-7 w-7 text-indigo-400" />
        <span className="text-lg font-semibold">Hours Tracker</span>
      </div>

      {/* Client switcher */}
      {clients.length > 0 && (
        <div className="relative border-b border-slate-800 p-3" ref={dropRef}>
          <button
            onClick={() => setDropOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-md bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <span className="flex items-center gap-2 truncate">
              <Briefcase className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
              <span className="truncate">{selectedClient?.name ?? 'Select client'}</span>
            </span>
            <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform', dropOpen && 'rotate-180')} />
          </button>

          {dropOpen && (
            <div className="absolute left-3 right-3 top-full mt-1 z-50 rounded-md border border-slate-700 bg-slate-800 shadow-lg">
              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedClientId(c.id); setDropOpen(false); }}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-xs text-left transition-colors hover:bg-slate-700',
                    c.id === selectedClient?.id && 'text-indigo-300 font-semibold',
                  )}
                >
                  {c.name}
                  {c.isDefault && <span className="ml-auto text-[10px] text-slate-500">default</span>}
                </button>
              ))}
              <div className="border-t border-slate-700">
                <button
                  onClick={() => { navigate('/clients'); setDropOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-indigo-400 hover:bg-slate-700"
                >
                  Manage clients →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-3 space-y-2">
        {billing && !billing.isPro && (
          <NavLink
            to="/billing"
            className="flex w-full items-center gap-2 rounded-md bg-indigo-600/20 px-3 py-2 text-xs font-medium text-indigo-300 hover:bg-indigo-600/30 transition-colors"
          >
            <Zap className="h-3.5 w-3.5 shrink-0" />
            Upgrade to Pro
          </NavLink>
        )}

        <div
          className={cn(
            'rounded-lg px-3 py-2 text-center text-xs font-semibold',
            owed  && 'bg-rose-950 text-rose-200',
            !owed && !over && 'bg-emerald-950 text-emerald-200',
            over  && 'bg-amber-950 text-amber-200',
          )}
        >
          <div className="text-slate-400">Balance</div>
          <div>{formatCurrency(balance)}</div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
