import React, { useEffect, useRef, useState } from 'react';
import { cn } from './cn';

export interface NumberTickerProps {
  value: number;
  /** Delay before animation starts in ms */
  delay?: number;
  /** Animation duration in ms */
  duration?: number;
  className?: string;
  /** Prefix shown before the number */
  prefix?: string;
  /** Suffix shown after the number */
  suffix?: string;
  /** Number of decimal places */
  decimalPlaces?: number;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Magic UI — NumberTicker
 * Smoothly animates from 0 (or previous value) to the target number.
 * Great for verse counts, surah numbers, page counts.
 */
export function NumberTicker({
  value,
  delay = 0,
  duration = 1200,
  className,
  prefix = '',
  suffix = '',
  decimalPlaces = 0,
}: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(0);

  useEffect(() => {
    const startAnimation = () => {
      startValueRef.current = displayValue;
      startTimeRef.current = null;

      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        const current = startValueRef.current + (value - startValueRef.current) * eased;
        setDisplayValue(current);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    };

    const timer = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay, duration]);

  const formatted = displayValue.toFixed(decimalPlaces);

  return (
    <span
      className={cn(
        'tabular-nums font-semibold',
        className
      )}
    >
      {prefix}{formatted}{suffix}
    </span>
  );
}
