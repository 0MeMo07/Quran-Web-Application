import React from 'react';
import { cn } from './cn';

export interface BorderBeamProps {
  /** Container must be `position: relative` and `overflow: hidden` */
  size?: number;
  duration?: number;
  /** Beam anchor position 0-100 */
  anchor?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
  className?: string;
}

/**
 * Magic UI — BorderBeam
 * Renders an animated glowing beam that travels around the border.
 * Place inside a `relative overflow-hidden` container.
 */
export function BorderBeam({
  size = 200,
  duration = 12,
  anchor = 90,
  borderWidth = 1.5,
  colorFrom = '#10b981',
  colorTo = '#14b8a6',
  delay = 0,
  className,
}: BorderBeamProps) {
  return (
    <div
      style={
        {
          '--size': size,
          '--duration': `${duration}s`,
          '--anchor': anchor,
          '--border-width': `${borderWidth}px`,
          '--color-from': colorFrom,
          '--color-to': colorTo,
          '--delay': `${-delay}s`,
        } as React.CSSProperties
      }
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit]',
        '[border:calc(var(--border-width))_solid_transparent]',
        // beam mask
        '![mask-clip:padding-box,border-box]',
        '![mask-composite:intersect]',
        '[mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]',
        // animation
        'after:absolute after:aspect-square after:w-[calc(var(--size)*1px)]',
        'after:animate-[border-beam_var(--duration)_var(--delay)_linear_infinite]',
        'after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)]',
        'after:[offset-anchor:calc(var(--anchor)*1%)_50%]',
        'after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]',
        className
      )}
    />
  );
}
