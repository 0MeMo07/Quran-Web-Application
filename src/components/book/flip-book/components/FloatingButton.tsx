import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../ui/cn';

interface FloatingButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export const FloatingButton = React.memo(function FloatingButton({
  onClick,
  children,
  className,
}: FloatingButtonProps) {
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
