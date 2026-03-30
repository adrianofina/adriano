"use client";

import { useState } from 'react';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  value?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export default function ProgressRing({
  progress,
  size = 100,
  strokeWidth = 7,
  color = '#818CF8',
  label,
  value,
  onClick,
  interactive = true
}: ProgressRingProps) {
  const [hoverProgress, setHoverProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, progress));
  const dashOffset = circumference - (circumference * clamped) / 100;
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    let progressValue = ((angle + Math.PI) / (2 * Math.PI)) * 100;
    progressValue = Math.max(0, Math.min(100, progressValue));
    setHoverProgress(progressValue);
  };
  
  const displayProgress = isHovering ? Math.round(hoverProgress) : Math.round(clamped);
  const displayOffset = isHovering 
    ? circumference - (circumference * hoverProgress / 100)
    : dashOffset;
  
  return (
    <div 
      className="relative group"
      style={{ width: size, height: size }}
      onMouseEnter={() => interactive && setIsHovering(true)}
      onMouseMove={interactive ? handleMouseMove : undefined}
      onMouseLeave={() => {
        setIsHovering(false);
        setHoverProgress(0);
      }}
      onClick={onClick}
    >
      <svg className="w-full h-full -rotate-90" style={{ display: 'block' }}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={strokeWidth}
          className="dark:stroke-gray-700"
        />
        {/* Actual progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={displayOffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${color}70)` }}
        />
        {/* Hover preview ring */}
        {isHovering && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#8B5CF6"
            strokeWidth={strokeWidth + 2}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * hoverProgress / 100)}
            strokeLinecap="round"
            strokeOpacity="0.5"
            className="transition-none"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`font-bold text-gray-900 dark:text-white`} style={{ fontSize: size <= 86 ? '0.95rem' : '1.15rem' }}>
          {displayProgress}%
        </span>
        {label && (
          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
            {isHovering ? 'preview' : label}
          </span>
        )}
        {value && !isHovering && (
          <span className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">
            {value}
          </span>
        )}
      </div>
    </div>
  );
}
