import React from 'react';
import { cn } from './cn';

export interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  children: React.ReactNode;
}

/**
 * Magic UI — ShimmerButton
 * A button with a shimmering light sweep across it. 
 * Perfect for primary calls-to-action.
 */
export function ShimmerButton({
  shimmerColor = 'rgba(255,255,255,0.35)',
  shimmerSize = '0.1em',
  borderRadius = '0.625rem',
  shimmerDuration = '1.8s',
  background = 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 50%, var(--color-primary) 100%)',
  className,
  children,
  style,
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      style={
        {
          '--shimmer-color': shimmerColor,
          '--shimmer-size': shimmerSize,
          '--border-radius': borderRadius,
          '--shimmer-duration': shimmerDuration,
          '--button-bg': background,
          borderRadius,
          background,
          ...style,
        } as React.CSSProperties
      }
      className={cn(
        'group relative inline-flex items-center justify-center gap-2',
        'overflow-hidden px-5 py-2.5 text-sm font-semibold text-white',
        'shadow-lg shadow-primary/25 hover:shadow-primary/40',
        'transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]',
        'disabled:pointer-events-none disabled:opacity-50',
        'dark:shadow-primary/20',
        className
      )}
      {...props}
    >
      {/* shimmer sweep */}
      <span
        className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/20
          group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out"
      />
      {/* glow dot */}
      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px
        bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
