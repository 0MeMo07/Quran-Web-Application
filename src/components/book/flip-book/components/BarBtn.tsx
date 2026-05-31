import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../ui/cn';

interface BarBtnProps {
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  accent?: boolean;
  title?: string;
}

export const BarBtn = React.memo(function BarBtn({
  onClick,
  children,
  active = false,
  accent = false,
  title,
}: BarBtnProps) {
  return (
    <motion.button
      aria-label={title}
      whileTap={{ scale: 0.82 }}
      transition={{ type: 'spring', stiffness: 600, damping: 28 }}
      onClick={onClick}
      className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-150',
        accent   ? 'text-amber-500'
        : active ? 'text-foreground'
                 : 'text-foreground/35 hover:text-foreground/60',
      )}
    >
      {children}
    </motion.button>
  );
});
