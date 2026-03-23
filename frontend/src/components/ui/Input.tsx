import React from 'react';
import { cn } from './cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...rest }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'h-10 px-3 rounded-xl bg-slate-900/20 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30',
          className,
        )}
        {...rest}
      />
    );
  },
);

Input.displayName = 'Input';

