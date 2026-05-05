import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, AlertTriangle, X } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { getOverdueNotifications } from '../lib/api';
import { useClient } from '../context/ClientContext';

export function NotificationBell() {
  const { selectedClientId } = useClient();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['overdue', selectedClientId],
    queryFn: () => getOverdueNotifications(selectedClientId),
    staleTime: 60_000,
  });

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const hasOverdue = data?.hasOverdue ?? false;
  const overdueCount = data?.overdueCount ?? 0;
  const totalOwed = data?.totalOwed ?? 0;
  const cycles = data?.cycles ?? [];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors',
          hasOverdue
            ? 'text-rose-300 hover:bg-rose-950/50'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white',
        )}
      >
        <div className="relative">
          <Bell className="h-3.5 w-3.5" />
          {overdueCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white">
              {overdueCount > 9 ? '9+' : overdueCount}
            </span>
          )}
        </div>
        <span>Notifications</span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-72 rounded-lg border border-slate-700 bg-slate-800 shadow-xl z-50">
          <div className="flex items-center justify-between border-b border-slate-700 px-3 py-2">
            <h3 className="text-xs font-semibold text-slate-200">Overdue Cycles</h3>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {isLoading && (
              <div className="px-3 py-4 text-center text-xs text-slate-400">Loading...</div>
            )}

            {!isLoading && !hasOverdue && (
              <div className="px-3 py-4 text-center">
                <Bell className="mx-auto h-6 w-6 text-emerald-400 mb-1" />
                <p className="text-xs text-slate-400">All cycles are up to date</p>
              </div>
            )}

            {hasOverdue && (
              <div className="space-y-0">
                {cycles.map((c) => (
                  <div
                    key={c.salaryMonth}
                    className="flex items-start gap-2 border-b border-slate-700/50 px-3 py-2 last:border-b-0"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-rose-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-200">{c.salaryMonth}</p>
                      <p className="text-[10px] text-slate-400">
                        {c.cyclePeriod} &middot; {c.daysOverdue} day{c.daysOverdue !== 1 ? 's' : ''} overdue
                      </p>
                      <p className="text-xs font-semibold text-rose-300">
                        {formatCurrency(c.runningBalance)} owed
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {hasOverdue && (
            <div className="border-t border-slate-700 px-3 py-2">
              <p className="text-xs text-slate-300">
                Total overdue:{' '}
                <span className="font-semibold text-rose-300">{formatCurrency(totalOwed)}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}