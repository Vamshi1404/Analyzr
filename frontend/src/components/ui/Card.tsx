import { cn } from './cn';

type CardTone = 'default' | 'muted' | 'elevated';

export function Card({
  className,
  tone = 'default',
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { tone?: CardTone }) {
  const toneClasses: Record<CardTone, string> = {
    default: 'bg-slate-900/35 border border-slate-800',
    muted: 'bg-slate-950/20 border border-slate-800',
    elevated: 'bg-slate-900/40 border border-slate-700',
  };

  return (
    <div
      className={cn(
        'rounded-2xl backdrop-blur-sm overflow-hidden',
        toneClasses[tone],
        className,
      )}
      {...rest}
    />
  );
}

