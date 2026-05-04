import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Zap, CheckCircle, XCircle, ExternalLink, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
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

function Check() {
  return <CheckCircle className="mx-auto h-4 w-4 text-emerald-500" />;
}
function Cross() {
  return <XCircle className="mx-auto h-4 w-4 text-slate-300" />;
}

export function Billing() {
  const [searchParams] = useSearchParams();
  const justUpgraded = searchParams.get('success') === '1';

  useEffect(() => {
    if (justUpgraded) toast.success('Welcome to Pro! Your account has been upgraded.');
  }, [justUpgraded]);

  const { data: billing, isLoading } = useQuery({
    queryKey: ['billing'],
    queryFn: getBillingStatus,
    staleTime: 60_000,
  });

  const mutCheckout = useMutation({
    mutationFn: createCheckout,
    onSuccess: ({ url }) => { window.location.href = url; },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to start checkout. Check server configuration.'),
  });

  const mutPortal = useMutation({
    mutationFn: createBillingPortal,
    onSuccess: ({ url }) => { window.open(url, '_blank', 'noopener'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to open billing portal.'),
  });

  const isPro = billing?.isPro;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <p className="text-sm text-slate-500">Manage your plan and subscription.</p>
      </div>

      {/* Current plan card */}
      {isLoading ? (
        <Skeleton className="h-36 w-full" />
      ) : (
        <Card className={isPro ? 'border-indigo-300 bg-indigo-50/60' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className={`h-5 w-5 ${isPro ? 'text-indigo-600' : 'text-slate-400'}`} />
                <CardTitle className="text-base">
                  {isPro ? 'Pro plan' : 'Free plan'}
                </CardTitle>
              </div>
              {isPro && (
                <span className="rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
                  PRO
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPro ? (
              <>
                <p className="text-sm text-slate-600">
                  You have unlimited clients and access to all features.
                  {billing?.subscriptionStatus === 'cancelled' && (
                    <span className="ml-2 font-medium text-amber-600">
                      Subscription cancelled — access continues until end of billing period.
                    </span>
                  )}
                </p>
                <Button
                  variant="outline"
                  onClick={() => mutPortal.mutate()}
                  disabled={mutPortal.isPending}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {mutPortal.isPending ? 'Opening…' : 'Manage subscription'}
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600">
                  You&apos;re on the free plan — limited to <strong>1 client</strong>.
                  Upgrade to Pro for unlimited clients and everything else we ship in the future.
                </p>
                <Button
                  onClick={() => mutCheckout.mutate()}
                  disabled={mutCheckout.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  {mutCheckout.isPending ? 'Redirecting…' : 'Upgrade to Pro'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Feature comparison table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-slate-500">
                <th className="pb-2 font-medium">Feature</th>
                <th className="pb-2 text-center font-medium w-24">Free</th>
                <th className="pb-2 text-center font-medium w-24 text-indigo-600">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {FEATURES.map((f) => (
                <tr key={f.label}>
                  <td className="py-2.5 text-slate-700">{f.label}</td>
                  <td className="py-2.5 text-center">
                    {f.free === true ? <Check /> : f.free === false ? <Cross /> : (
                      <span className="text-xs text-slate-500">{f.free}</span>
                    )}
                  </td>
                  <td className="py-2.5 text-center">
                    {f.pro === true ? <Check /> : f.pro === false ? <Cross /> : (
                      <span className="text-xs font-semibold text-indigo-600">{f.pro}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Dev note */}
      {process.env.NODE_ENV !== 'production' && (
        <p className="text-xs text-slate-400 text-center">
          Billing is powered by LemonSqueezy. Configure <code>LEMONSQUEEZY_*</code> env vars in <code>backend/.env</code> to activate.
        </p>
      )}
    </div>
  );
}
