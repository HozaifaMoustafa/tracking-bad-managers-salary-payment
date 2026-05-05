import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Zap, CheckCircle, XCircle, ExternalLink, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';
import { getBillingStatus, createCheckout, createBillingPortal } from '../lib/api';

const FEATURES = [
  { label: 'Work session tracking',         free: true,       pro: true },
  { label: 'Payment history & balance',     free: true,       pro: true },
  { label: 'PDF invoice per salary cycle',  free: true,       pro: true },
  { label: 'ICS calendar import',           free: true,       pro: true },
  { label: 'Number of clients/employers',   free: '1 client', pro: 'Unlimited' },
  { label: 'Monthly breakdown & reports',   free: false,      pro: true },
  { label: 'Excel export',                  free: false,      pro: true },
  { label: 'Payment demand letter (PDF)',   free: false,      pro: true },
  { label: 'Overdue email alerts',          free: false,      pro: true },
  { label: 'Google Calendar sync',          free: false,      pro: true },
];

const PRICING = {
  monthly: { label: 'Monthly', price: '$5', period: 'per month', sub: null },
  annual:  { label: 'Annual',  price: '$45', period: 'per year', sub: '$3.75 / month · billed annually' },
};

function Check() {
  return <CheckCircle className="mx-auto h-4 w-4 text-emerald-500" />;
}
function Cross() {
  return <XCircle className="mx-auto h-4 w-4 text-slate-300 dark:text-slate-600" />;
}

export function Billing() {
  const [searchParams] = useSearchParams();
  const justUpgraded = searchParams.get('success') === '1';
  const [cycle, setCycle] = useState('annual');

  useEffect(() => {
    if (justUpgraded) toast.success('Welcome to Pro! Your account has been upgraded.');
  }, [justUpgraded]);

  const { data: billing, isLoading } = useQuery({
    queryKey: ['billing'],
    queryFn: getBillingStatus,
    staleTime: 60_000,
  });

  const mutCheckout = useMutation({
    mutationFn: (billingCycle) => createCheckout(billingCycle),
    onSuccess: ({ url }) => { window.location.href = url; },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to start checkout. Check server configuration.'),
  });

  const mutPortal = useMutation({
    mutationFn: createBillingPortal,
    onSuccess: ({ url }) => { window.open(url, '_blank', 'noopener'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to open billing portal.'),
  });

  const isPro = billing?.isPro;
  const pricing = PRICING[cycle];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Billing</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your plan and subscription.</p>
      </div>

      {/* Current plan card */}
      {isLoading ? (
        <Skeleton className="h-36 w-full" />
      ) : isPro ? (
        <Card className="border-indigo-300 bg-indigo-50/60 dark:bg-indigo-950/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <CardTitle className="text-base">Pro plan</CardTitle>
              </div>
              <span className="rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">PRO</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              You have unlimited clients and access to all features.
              {billing?.subscriptionStatus === 'cancelled' && (
                <span className="ml-2 font-medium text-amber-600">
                  Subscription cancelled — access continues until end of billing period.
                </span>
              )}
            </p>
            <Button variant="outline" onClick={() => mutPortal.mutate()} disabled={mutPortal.isPending}>
              <ExternalLink className="mr-2 h-4 w-4" />
              {mutPortal.isPending ? 'Opening…' : 'Manage subscription'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* ── Upgrade section ── */
        <div className="space-y-4">
          {/* Billing cycle toggle */}
          <div className="flex items-center justify-center">
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-1 gap-1">
              {(['monthly', 'annual']).map((c) => (
                <button
                  key={c}
                  onClick={() => setCycle(c)}
                  className={cn(
                    'relative flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-all',
                    cycle === c
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300',
                  )}
                >
                  {c === 'annual' ? 'Annual' : 'Monthly'}
                  {c === 'annual' && (
                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                      Save 25%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing card */}
          <Card className="border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/60 dark:from-indigo-950/60 to-white dark:to-slate-900">
            <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-6">
              <div>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-5xl font-bold text-slate-900 dark:text-slate-100">{pricing.price}</span>
                  <span className="mb-2 text-sm text-slate-500 dark:text-slate-400">{pricing.period}</span>
                </div>
                {pricing.sub && (
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{pricing.sub}</p>
                )}
              </div>

              <Button
                size="lg"
                className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-700 text-white text-base"
                onClick={() => mutCheckout.mutate(cycle)}
                disabled={mutCheckout.isPending}
              >
                <Zap className="mr-2 h-4 w-4" />
                {mutCheckout.isPending ? 'Redirecting…' : `Upgrade to Pro — ${pricing.price}`}
              </Button>

              <p className="text-xs text-slate-400 dark:text-slate-500">
                Secure payment via LemonSqueezy · Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feature comparison table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">What&apos;s included</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-slate-500 dark:text-slate-400">
                <th className="pb-2 font-medium">Feature</th>
                <th className="pb-2 text-center font-medium w-24">Free</th>
                <th className="pb-2 text-center font-medium w-24 text-indigo-600 dark:text-indigo-400">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {FEATURES.map((f) => (
                <tr key={f.label}>
                  <td className="py-2.5 text-slate-700 dark:text-slate-300">{f.label}</td>
                  <td className="py-2.5 text-center">
                    {f.free === true ? <Check /> : f.free === false ? <Cross /> : (
                      <span className="text-xs text-slate-500 dark:text-slate-400">{f.free}</span>
                    )}
                  </td>
                  <td className="py-2.5 text-center">
                    {f.pro === true ? <Check /> : f.pro === false ? <Cross /> : (
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{f.pro}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {process.env.NODE_ENV !== 'production' && (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
          Billing is powered by LemonSqueezy. Configure <code>LEMONSQUEEZY_*</code> env vars in <code>backend/.env</code> to activate.
        </p>
      )}
    </div>
  );
}
