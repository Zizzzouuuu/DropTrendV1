import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  type?: 'neutral' | 'success' | 'warning' | 'info';
}

export const Badge = ({ children, type = 'neutral', className, ...props }: BadgeProps) => {
  const styles = {
    neutral: "bg-slate-800 text-slate-300",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    info: "bg-blue-500/10 text-blue-400 border border-blue-500/20"
  };

  return (
    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", styles[type], className)} {...props}>
      {children}
    </span>
  );
};
