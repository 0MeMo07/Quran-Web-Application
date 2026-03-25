import React from 'react';
import { Tooltip as HeroTooltip } from '@heroui/react';
import { cn } from './cn';

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
  delay?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default' | 'foreground';
  showArrow?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export function Tooltip({
  children,
  content,
  placement = 'top',
  delay = 300,
  color = 'foreground',
  showArrow = true,
  isDisabled = false,
  className,
}: TooltipProps) {
  return (
    <HeroTooltip
      content={content}
      placement={placement}
      delay={delay}
      color={color}
      showArrow={showArrow}
      isDisabled={isDisabled}
      classNames={{
        base: cn(
          'px-3 py-1.5 text-xs font-medium rounded-lg',
          'shadow-lg border border-border',
          className
        ),
      }}
    >
      {children}
    </HeroTooltip>
  );
}
