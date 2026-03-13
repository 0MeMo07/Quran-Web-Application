import React from 'react';
import { Chip as HeroChip } from '@heroui/react';
import { cn } from './cn';

type ChipVariant = 'solid' | 'flat' | 'bordered' | 'light' | 'faded' | 'shadow' | 'dot';
type ChipColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default';

export interface ChipProps {
  children: React.ReactNode;
  variant?: ChipVariant;
  color?: ChipColor;
  size?: 'sm' | 'md' | 'lg';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  isDisabled?: boolean;
  onClose?: () => void;
  className?: string;
}

export function Chip({
  children,
  variant = 'flat',
  color = 'primary',
  size = 'md',
  radius = 'full',
  startContent,
  endContent,
  isDisabled,
  onClose,
  className,
}: ChipProps) {
  return (
    <HeroChip
      variant={variant}
      color={color}
      size={size}
      radius={radius}
      startContent={startContent}
      endContent={endContent}
      isDisabled={isDisabled}
      onClose={onClose}
      className={cn(
        'font-medium',
        color === 'primary' && variant === 'flat' &&
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        className
      )}
    >
      {children}
    </HeroChip>
  );
}
