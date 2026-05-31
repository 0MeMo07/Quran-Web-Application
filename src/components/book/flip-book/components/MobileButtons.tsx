import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../ui/cn';

export const FloatingButton = React.memo(({
  onClick, children, className,
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={cn(
        'w-10 h-10 rounded-2xl bg-black/50 backdrop-blur-xl',
        'border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.4)]',
        'flex items-center justify-center text-white/80 pointer-events-auto',
        'active:scale-90 transition-transform',
        className,
      )}
    >
      {children}
    </motion.button>
  );
});

export const BarBtn = React.memo(({
  onClick, children, active = false, accent = false, title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  accent?: boolean;
  title?: string;
}) => {
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
