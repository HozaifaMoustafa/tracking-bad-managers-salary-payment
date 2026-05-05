import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Wallet, Scale } from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { getMonthlyBreakdown, getSessions, getSummary } from '../lib/api';
import { formatCurrency, formatDateUi, formatDurationHours } from '../lib/utils';
import { useClient } from '../context/ClientContext';

export function Dashboard() {
  const { selectedClientId } = useClient();

  const qSummary = useQuery({
    queryKey: ['summary', selectedClientId],
    queryFn: () => getSummary(selectedClientId),
  });
  const qMonthly = useQuery({
    queryKey: ['monthly', selectedClientId],
    queryFn: () => getMonthlyBreakdown(selectedClientId),
  });
  const qRecent = useQuery({
    queryKey: ['sessions', 'recent', selectedClientId],
    queryFn: () => getSessions({ page: 1, sortBy: 'date', sortDir: 'desc', clientId: selectedClientId }),
  });

  const s = qSummary.data;
  const monthly = qMonthly.data || [];
  const recent = qRecent.isSuccess ? (qRecent.data?.data || []).slice(0, 10) : [];

  const barData = monthly.map((m) => ({ name: m.salaryMonth, earned: m.expectedEarnings }));
  const lineData = monthly.map((m) => ({ name: m.salaryMonth, earned: m.cumulativeEarned, paid: m.cumulativePaid }));

  const balanceTone = !s ? 'default' : s.balance > 0 ? 'balance-owed' : s.balance < 0 ? 'overpaid' : 'balance-ok';

  if (qSummary.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (qSummary.isError || !s) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Overview of earnings, payments, and recent sessions.</p>
        </div>
        <div className="bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-lg p-4">
          <p className="font-medium">Failed to load dashboard data</p>
          <p className="text-sm mt-1">{qSummary.error?.response?.data?.error || qSummary.error?.message || 'An unexpected error occurred.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Overview of earnings, payments, and recent sessions.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Earned" value={formatCurrency(s.totalEarned)}
          subtitle={`${s.totalSessions} sessions · ${formatDurationHours(s.totalHours)}`} icon={TrendingUp} tone="earned" />
        <StatCard title="Total Received" value={formatCurrency(s.totalPaid)}
          subtitle="From payment log" icon={Wallet} tone="paid" />
        <StatCard title="Balance Owed" value={formatCurrency(s.balance)}
          subtitle={s.balance > 0 ? 'You are owed this amount' : s.balance < 0 ? 'Overpaid vs earned' : 'Balanced'}
          icon={Scale} tone={balanceTone} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Monthly expected earnings</CardTitle></CardHeader>
          <CardContent className="h-72">
            {barData.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No session data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="earned" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Cumulative earned vs paid</CardTitle></CardHeader>
          <CardContent className="h-72">
            {lineData.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No data for chart.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                  <Line type="monotone" dataKey="earned" stroke="#059669" strokeWidth={2} dot={false} name="Earned" />
                  <Line type="monotone" dataKey="paid" stroke="#2563eb" strokeWidth={2} dot={false} name="Paid" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent sessions</CardTitle>
          <Button variant="outline" size="sm" asChild><Link to="/sessions">View all</Link></Button>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No sessions yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((row) => (
                  <TableRow key={row.id} className={row.flagged ? 'border-l-4 border-l-amber-400' : ''}>
                    <TableCell>{formatDateUi(row.date)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{row.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {row.flagged && <AlertTriangle className="h-4 w-4 text-amber-500" title="Flagged" />}
                        <Badge variant="muted">{row.category}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>{formatDurationHours(row.durationHours)}</TableCell>
                    <TableCell>{formatCurrency(row.earnings)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
