import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  glow?: 'blue' | 'purple' | 'green' | 'amber' | 'none';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  glow = 'none',
}) => {
  const glowStyles = {
    none: '',
    blue: 'shadow-[0_0_24px_-4px_rgba(145,168,255,0.18)] border-[#91A8FF]/30',
    purple: 'shadow-[0_0_24px_-4px_rgba(124,92,252,0.2)] border-[#7C5CFC]/30',
    green: 'shadow-[0_0_24px_-4px_rgba(53,214,160,0.18)] border-[#35D6A0]/30',
    amber: 'shadow-[0_0_24px_-4px_rgba(255,189,105,0.18)] border-[#FFBD69]/30',
  };

  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-2xl p-4 sm:p-5 transition-all duration-300 relative overflow-hidden ${
        glowStyles[glow]
      } ${
        hoverable
          ? 'hover:border-[#91A8FF]/40 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.6)] cursor-pointer'
          : ''
      } ${className}`}
    >
      {/* Subtle top glare highlight line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};
