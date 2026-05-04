import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Lock, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { getBillingStatus } from '../lib/api';

export function ProGate({ feature, children }) {
  const navigate = useNavigate();
  const { data: billing, isLoading } = useQuery({
    queryKey: ['billing'],
    queryFn: getBillingStatus,
    staleTime: 5 * 60_000,
  });

  if (isLoading) return null;
  if (billing?.isPro) return children;

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
        <Lock className="h-6 w-6 text-indigo-500" />
      </div>
      <h2 className="mb-1 text-lg font-semibold text-slate-800">{feature} is a Pro feature</h2>
      <p className="mb-6 max-w-xs text-sm text-slate-500">
        Upgrade to Pro to unlock {feature.toLowerCase()} along with unlimited clients, Excel exports, demand letters, and email alerts.
      </p>
      <Button
        className="bg-indigo-600 hover:bg-indigo-700 text-white"
        onClick={() => navigate('/billing')}
      >
        <Zap className="mr-2 h-4 w-4" />
        Upgrade to Pro
      </Button>
    </div>
  );
}
