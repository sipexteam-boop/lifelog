import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  isLoading?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-xl gap-2 font-medium',
    lg: 'px-6 py-3.5 text-base rounded-2xl gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#91A8FF] to-[#7C5CFC] text-slate-950 font-semibold shadow-[0_4px_20px_-4px_rgba(145,168,255,0.4)] hover:brightness-110 active:scale-[0.98]',
    secondary:
      'bg-[#101521]/90 border border-[#91A8FF]/25 text-[#91A8FF] hover:bg-[#91A8FF]/15 active:scale-[0.98]',
    success:
      'bg-[#35D6A0]/15 border border-[#35D6A0]/40 text-[#35D6A0] hover:bg-[#35D6A0]/25 active:scale-[0.98]',
    danger:
      'bg-[#FF6B82]/15 border border-[#FF6B82]/40 text-[#FF6B82] hover:bg-[#FF6B82]/25 active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white active:scale-[0.98]',
    outline:
      'bg-transparent border border-white/15 text-slate-200 hover:bg-white/5 active:scale-[0.98]',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all duration-200 select-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${
        sizeStyles[size]
      } ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
