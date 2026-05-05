import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Briefcase, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createClient } from '../lib/api';
import { completeOnboarding } from '../lib/api';
import { setUser, getUser } from '../lib/auth';
import { useClient } from '../context/ClientContext';

const CURRENCIES = ['EGP', 'USD', 'EUR', 'GBP', 'SAR', 'AED', 'QAR', 'KWD', 'INR', 'PKR'];

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { setSelectedClientId } = useClient();
  const [step, setStep] = useState(0);

  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('EGP');
  const [startDay, setStartDay] = useState(25);

  const mutClient = useMutation({
    mutationFn: createClient,
    onSuccess: (c) => {
      setSelectedClientId(c.id);
      finish();
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to create client'),
  });

  const mutOnboarding = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      const user = getUser();
      if (user) {
        setUser({ ...user, onboarding_completed: true });
      }
    },
  });

  function finish() {
    mutOnboarding.mutate();
    navigate('/dashboard', { replace: true });
  }

  function skip() {
    finish();
  }

  function handleCreateClient() {
    if (!name.trim()) {
      toast.error('Please enter a name for your client or employer');
      return;
    }
    mutClient.mutate({
      name: name.trim(),
      currency: currency.trim() || 'EGP',
      workCycleStartDay: Number(startDay) || 25,
      config: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        work_cycle_start_day: Number(startDay) || 25,
        currency: currency.trim() || 'EGP',
        work_types: [],
      },
    });
  }

  const steps = [
    {
      icon: Clock,
      title: 'Welcome to Hours Tracker',
      description: 'Track your sessions, calculate earnings, log payments, and get evidence when you\'re not paid on time. Let\'s set things up in under a minute.',
    },
    {
      icon: Briefcase,
      title: 'Add your first client',
      description: 'Who pays you? This could be your employer, a company you freelance for, or any project. You can add more clients later.',
    },
    {
      icon: Check,
      title: 'You\'re all set!',
      description: 'You can always add more clients, change work types, and configure settings later from the Clients and Settings pages.',
    },
  ];

  const current = steps[step];
  const Icon = current.icon;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Clock className="h-8 w-8 text-indigo-400" />
          <span className="text-2xl font-semibold text-white">Hours Tracker</span>
        </div>

        <div className="bg-slate-900 rounded-xl p-8 shadow-lg">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i <= step ? 'w-8 bg-indigo-500' : 'w-8 bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-indigo-600/20 flex items-center justify-center">
              <Icon className="h-6 w-6 text-indigo-400" />
            </div>
          </div>

          <h1 className="text-xl font-semibold text-white text-center mb-2">
            {current.title}
          </h1>
          <p className="text-sm text-slate-400 text-center mb-6">
            {current.description}
          </p>

          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { emoji: '💼', label: 'Track sessions' },
                  { emoji: '💰', label: 'Log payments' },
                  { emoji: '📊', label: 'View balance' },
                  { emoji: '📄', label: 'PDF invoices' },
                  { emoji: '🔔', label: 'Overdue alerts' },
                  { emoji: '🏢', label: 'Multi-client' },
                ].map(({ emoji, label }) => (
                  <div key={label} className="rounded-lg bg-slate-800 p-3 text-center">
                    <div className="text-lg mb-1">{emoji}</div>
                    <div className="text-xs text-slate-300">{label}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep(1)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-md py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                Get started <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Client / Employer name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Corp, My School"
                  className="w-full bg-slate-800 text-white border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Cycle start day
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={startDay}
                    onChange={(e) => setStartDay(e.target.value)}
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Day 1–28 of each month</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(0)}
                  className="flex items-center gap-1 rounded-md px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={handleCreateClient}
                  disabled={mutClient.isPending}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-md py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {mutClient.isPending ? 'Creating…' : <>Create & continue <ArrowRight className="h-4 w-4" /></>}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-lg bg-emerald-950/50 border border-emerald-800/50 p-4 text-center">
                <Check className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-emerald-300">Your workspace is ready!</p>
              </div>
              <button
                onClick={skip}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-md py-2.5 text-sm font-medium transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {step === 1 && (
            <button
              onClick={skip}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-300 mt-2"
            >
              Skip for now — I'll add a client later
            </button>
          )}
        </div>
      </div>
    </div>
  );
}