import React from 'react';
import { cn } from './cn';

type TabsValue = string;

const TabsContext = React.createContext<{
  value: TabsValue;
  onValueChange: (v: TabsValue) => void;
} | null>(null);

export function Tabs({
  value,
  onValueChange,
  children,
  className,
}: {
  value: TabsValue;
  onValueChange: (v: TabsValue) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn('inline-flex items-center gap-1 p-1 bg-slate-900/30 border border-slate-800 rounded-xl', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsTrigger({
  value,
  children,
}: {
  value: TabsValue;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('TabsTrigger must be used within Tabs');

  const active = value === ctx.value;

  return (
    <button
      type="button"
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        'px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors',
        active ? 'text-white' : 'text-slate-300 hover:text-slate-200',
      )}
      style={{ background: active ? 'rgba(139, 92, 246, 0.25)' : 'transparent' }}
    >
      {children}
    </button>
  );
}

