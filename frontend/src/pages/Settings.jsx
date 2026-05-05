import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { resetData } from '../lib/api';

export function Settings() {
  const qc = useQueryClient();

  const mutReset = useMutation({
    mutationFn: ({ scope }) => resetData({ scope }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['summary'] });
      qc.invalidateQueries({ queryKey: ['monthly'] });
      qc.invalidateQueries({ queryKey: ['sync-log'] });
      toast.success('Data reset complete');
    },
    onError: (e) => toast.error(e.response?.data?.error || e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Work types, rates, and billing rules are now configured per client — go to{' '}
          <a href="/clients" className="text-indigo-600 underline hover:text-indigo-800">Clients</a> to edit them.
        </p>
      </div>

      <Card className="border-rose-200 dark:border-rose-800">
        <CardHeader>
          <CardTitle className="text-base text-rose-700 dark:text-rose-400">Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-slate-600 dark:text-slate-400">
            Permanently deletes your data. Client configuration and work types are not affected.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="destructive"
              disabled={mutReset.isPending}
              onClick={() => {
                const v = prompt('Type RESET to delete ALL data (sessions + payments + sync history).');
                if (v !== 'RESET') return;
                mutReset.mutate({ scope: 'all' });
              }}
            >
              Reset all data
            </Button>
            <Button
              variant="outline"
              disabled={mutReset.isPending}
              onClick={() => {
                const v = prompt('Type RESET to delete sessions + sync history (payments kept).');
                if (v !== 'RESET') return;
                mutReset.mutate({ scope: 'sessions' });
              }}
            >
              Reset sessions only
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
