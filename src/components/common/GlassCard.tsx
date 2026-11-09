import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  glow = false,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={twMerge(
        clsx(
          'relative rounded-2xl p-6',
          'bg-[rgba(15,23,42,0.65)] backdrop-blur-md',
          'border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]',
          glow && 'shadow-[0_0_24px_rgba(59,130,246,0.15)] border-blue-500/30',
          className
        )
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
