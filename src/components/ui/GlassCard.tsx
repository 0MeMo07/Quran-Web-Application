import React from 'react';
import { cn } from './cn';
import { BorderBeam } from './BorderBeam';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show animated border beam */
  beam?: boolean;
  /** Override beam color from */
  beamColorFrom?: string;
  /** Override beam color to */
  beamColorTo?: string;
  /** Beam animation duration (seconds) */
  beamDuration?: number;
  /** Extra blur amount (default: xl) */
  blur?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Tinted with primary color */
  tinted?: boolean;
}

const blurMap = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
  '2xl': 'backdrop-blur-2xl',
};

/**
 * Magic UI — GlassCard
 * A glassmorphic container with optional animated BorderBeam.
 * Matches the Quran app's frosted-glass aesthetic.
 */
export function GlassCard({
  children,
  className,
  beam = false,
  beamColorFrom = '#10b981',
  beamColorTo = '#14b8a6',
  beamDuration = 10,
  blur = 'xl',
  tinted = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        blurMap[blur],
        tinted
          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40'
          : 'bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-800/50',
        'shadow-lg shadow-gray-200/50 dark:shadow-black/30',
        className
      )}
      {...props}
    >
      {beam && (
        <BorderBeam
          colorFrom={beamColorFrom}
          colorTo={beamColorTo}
          duration={beamDuration}
          size={150}
          borderWidth={1.5}
        />
      )}
      {children}
    </div>
  );
}
