import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const variants = cva('inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors', {
  variants: {
    variant: {
      default: 'border-transparent bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
      success: 'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
      warning: 'border-transparent bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-300',
      muted: 'border-transparent bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    },
  },
  defaultVariants: { variant: 'default' },
});

export function Badge({ className, variant, ...props }) {
  return <span className={cn(variants({ variant }), className)} {...props} />;
}