import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ children, className, ...props }: CardProps) => (
  <div className={cn("bg-card text-card-foreground border border-[rgba(0,139,255,0.2)] rounded-xl overflow-hidden shadow-sm", className)} {...props}>
    {children}
  </div>
);
