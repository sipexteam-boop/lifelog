import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  color?: string; // hex or tailwind class
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  color = 'bg-gradient-to-r from-[#91A8FF] via-[#7C5CFC] to-[#35D6A0]',
  showLabel = false,
  className = '',
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div className={`w-full ${className}`}>
      <div
        className="w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5"
        style={{ height: height + 2 }}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-slate-400 mt-1 font-mono">
          <span>{clamped}%</span>
        </div>
      )}
    </div>
  );
};

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  subtext?: string;
  centerText?: string;
  glow?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 110,
  strokeWidth = 9,
  color = '#91A8FF',
  subtext,
  centerText,
  glow = true,
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated Active Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700 ease-out"
          style={{
            filter: glow ? `drop-shadow(0 0 6px ${color}66)` : undefined,
          }}
        />
      </svg>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-bold tracking-tight text-white font-mono">
          {centerText || `${clamped}%`}
        </span>
        {subtext && (
          <span className="text-[10px] text-slate-400 font-medium px-1 truncate max-w-[85%]">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};
