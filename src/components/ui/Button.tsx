import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
}

export const Button = ({ children, variant = 'primary', size = 'md', className, ...props }: ButtonProps) => {
  const base = "rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer";
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95",
    outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground active:scale-95",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3 text-base",
    icon: "h-10 w-10 p-2"
  };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
};
