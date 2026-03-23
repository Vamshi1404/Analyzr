import { cn } from './cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed';

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3',
  md: 'h-10 px-4',
  lg: 'h-12 px-6',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-purple-600/90 hover:bg-purple-600 text-white',
  secondary: 'bg-slate-900/35 hover:bg-slate-900/55 border border-slate-800 text-slate-100',
  outline: 'bg-transparent border border-slate-700 text-slate-100 hover:bg-slate-900/35',
  ghost: 'bg-transparent hover:bg-slate-900/25 border border-transparent text-slate-100',
  danger: 'bg-red-500/15 hover:bg-red-500/25 border border-red-500/25 text-red-200',
};

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(base, sizeClasses[size], variantClasses[variant], className)}
      {...rest}
    />
  );
}

