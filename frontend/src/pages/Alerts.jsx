import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bell, Send, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { getAlertSettings, saveAlertSettings, sendTestAlert } from '../lib/api';
import { ProGate } from '../components/ProGate';

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString();
}

export function Alerts() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['alertSettings'], queryFn: getAlertSettings });

  const [form, setForm] = useState({ alert_email: '', threshold_days: 7, enabled: true });

  useEffect(() => {
    if (data) {
      setForm({
        alert_email: data.alert_email || '',
        threshold_days: data.threshold_days ?? 7,
        enabled: data.enabled !== false && data.enabled !== 0,
      });
    }
  }, [data]);

  const mutSave = useMutation({
    mutationFn: saveAlertSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alertSettings'] });
      toast.success('Alert settings saved');
    },
    onError: (e) => toast.error(e.response?.data?.error || e.message),
  });

  const mutTest = useMutation({
    mutationFn: sendTestAlert,
    onSuccess: () => toast.success('Test alert triggered — check your inbox'),
    onError: (e) => toast.error(e.response?.data?.error || e.message),
  });

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  const isConfigured = !!data?.alert_email;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Alert Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Get an email when your salary is overdue by more than a set number of days.
        </p>
      </div>

      <ProGate feature="Email alerts">

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            <CardTitle className="text-base">Email Notifications</CardTitle>
          </div>
          {isConfigured && (
            <Badge
              className={
                form.enabled
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-500 dark:text-slate-400'
              }
            >
              {form.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid max-w-md gap-4">
            <div>
              <Label htmlFor="alert-email">Alert email</Label>
              <Input
                id="alert-email"
                type="email"
                placeholder="you@example.com"
                value={form.alert_email}
                onChange={(e) => set('alert_email', e.target.value)}
              />
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Where to send overdue payment notifications.
              </p>
            </div>

            <div>
              <Label htmlFor="threshold-days">Days overdue before alerting</Label>
              <Input
                id="threshold-days"
                type="number"
                min={1}
                max={90}
                value={form.threshold_days}
                onChange={(e) => set('threshold_days', Number(e.target.value))}
                className="max-w-[120px]"
              />
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Alert when a salary cycle ends and remains unpaid for this many days.
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Enable alerts</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Uncheck to pause without losing your settings.</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 cursor-pointer accent-indigo-600"
                checked={form.enabled}
                onChange={(e) => set('enabled', e.target.checked)}
              />
            </div>
          </div>

          {data?.last_alerted_at && (
            <div className="flex items-center gap-2 rounded-md bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              Last alert sent: {formatDate(data.last_alerted_at)}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button
          size="lg"
          onClick={() => mutSave.mutate(form)}
          disabled={mutSave.isPending || !form.alert_email}
        >
          {mutSave.isPending ? 'Saving…' : 'Save settings'}
        </Button>

        {isConfigured && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => mutTest.mutate()}
            disabled={mutTest.isPending}
          >
            <Send className="mr-2 h-4 w-4" />
            {mutTest.isPending ? 'Sending…' : 'Send test alert'}
          </Button>
        )}
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 text-xs text-slate-500 dark:text-slate-400 space-y-1 max-w-lg">
        <p className="font-medium text-slate-600 dark:text-slate-400">How it works</p>
        <p>Every day at 9:00 AM the server checks your unpaid salary cycles.</p>
        <p>If any cycle ended more than <strong>{form.threshold_days} day{form.threshold_days !== 1 ? 's' : ''}</strong> ago and still has an outstanding balance, you'll receive an email.</p>
        <p>You'll receive at most one alert per 20 hours to avoid spam.</p>
        <p className="pt-1">SMTP must be configured in the server's <code>.env</code> file for emails to send.</p>
      </div>
      </ProGate>
    </div>
  );
}
