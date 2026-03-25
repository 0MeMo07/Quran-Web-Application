import { Divider as HeroDivider } from '@heroui/react';
import { cn } from './cn';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  /** Show an Arabic star ornament in the center */
  ornament?: boolean;
  className?: string;
  label?: string;
}

const STAR_ORNAMENT = '✦';

export function Divider({
  orientation = 'horizontal',
  ornament = false,
  className,
  label,
}: DividerProps) {
  if (ornament || label) {
    return (
      <div className={cn('flex items-center gap-3 w-full my-2', className)}>
        <HeroDivider className="flex-1 bg-border" />
        <span className="text-primary/70 text-sm select-none shrink-0">
          {label || STAR_ORNAMENT}
        </span>
        <HeroDivider className="flex-1 bg-border" />
      </div>
    );
  }

  return (
    <HeroDivider
      orientation={orientation}
      className={cn('bg-border', className)}
    />
  );
}
