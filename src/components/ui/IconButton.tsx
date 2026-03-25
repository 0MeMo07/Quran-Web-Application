import React from 'react';
import { Button as HeroButton, Tooltip as HeroTooltip } from '@heroui/react';
import { motion } from 'framer-motion';
import { cn } from './cn';

type IconButtonVariant = 'solid' | 'soft' | 'ghost';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
  isLoading?: boolean;
}

const variantClasses: Record<IconButtonVariant, string> = {
  solid:
    'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 shadow-sm shadow-primary/20',
  soft:
    'bg-secondary text-foreground hover:bg-secondary/80 active:bg-secondary/70',
  ghost:
    'bg-transparent text-muted-foreground hover:bg-secondary/50 active:bg-secondary/70',
};

const sizeClasses = {
  sm: 'p-1.5 rounded-md',
  md: 'p-2 rounded-lg',
  lg: 'p-2.5 rounded-xl',
};

export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  tooltip,
  isLoading = false,
  className,
  disabled,
  type = 'button',
  value,
  ...props
}: IconButtonProps) {
  const heroVariant: 'solid' | 'flat' | 'light' =
    variant === 'solid' ? 'solid' : variant === 'soft' ? 'flat' : 'light';
  const normalizedValue: string | undefined = Array.isArray(value)
    ? value.join(',')
    : typeof value === 'number'
      ? String(value)
      : (value as string | undefined);

  const trigger = (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="inline-block"
    >
      <HeroButton
        type={type}
        isIconOnly
        isLoading={isLoading}
        isDisabled={disabled || isLoading}
        value={normalizedValue}
        aria-label={tooltip}
        title={tooltip}
        variant={heroVariant}
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
        className={cn(
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...(props as Record<string, unknown>)}
      >
        {icon}
      </HeroButton>
    </motion.div>
  );

  if (!tooltip) {
    return trigger;
  }

  return (
    <HeroTooltip content={tooltip} placement="top" delay={250}>
      <div className="inline-block">{trigger}</div>
    </HeroTooltip>
  );
}
