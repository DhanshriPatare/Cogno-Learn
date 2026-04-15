import React from 'react';
import { cn } from '../lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  key?: React.Key;
}

export default function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div className={cn(
      "backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 transition-all duration-300",
      hover && "hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-cosmic-indigo/10",
      className
    )}>
      {children}
    </div>
  );
}
