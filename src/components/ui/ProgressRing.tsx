"use client";

import { useState, useEffect, useRef } from 'react';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  status?: 'active' | 'overdue' | 'completed' | 'pending';
  label?: string;
  value?: string;
  onClick?: () => void;
  interactive?: boolean;
  animateOnHover?: boolean;
  pulseOnOverdue?: boolean;
}

export default function ProgressRing({
  progress,
  size = 100,
  strokeWidth = 7,
  status = 'active',
  label,
  value,
  onClick,
  interactive = true,
  animateOnHover = false,
  pulseOnOverdue = false
}: ProgressRingProps) {
  const [hoverProgress, setHoverProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(progress);
  const [hasPulse, setHasPulse] = useState(pulseOnOverdue && status === 'overdue');
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, progress));
  
  // Get color based on status
  const getColor = () => {
    if (clamped >= 100) return '#10B981';
    if (status === 'overdue') return '#EF4444';
    if (status === 'pending') return '#F59E0B';
    return '#818CF8';
  };
  
  const ringColor = getColor();
  
  // Get glow intensity based on status
  const getGlowIntensity = () => {
    if (status === 'overdue') return '0 0 12px rgba(239,68,68,0.6)';
    if (clamped >= 100) return '0 0 8px rgba(16,185,129,0.5)';
    return '0 0 6px rgba(129,140,248,0.4)';
  };
  
  // Pulse animation for overdue
  useEffect(() => {
    if (pulseOnOverdue && status === 'overdue') {
      const interval = setInterval(() => {
        setHasPulse(prev => !prev);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [pulseOnOverdue, status]);
  
  const handleMouseEnter = () => {
    if (!interactive) return;
    setIsHovering(true);
    
    if (animateOnHover) {
      setIsAnimating(true);
      setDisplayProgress(0);
      setHoverProgress(0);
      
      const startTime = Date.now();
      const duration = 1200;
      const targetProgress = clamped;
      
      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
        const current = targetProgress * easeOut(t);
        setDisplayProgress(current);
        setHoverProgress(current);
        
        if (t < 1) {
          animationRef.current = setTimeout(animate, 16);
        } else {
          setDisplayProgress(targetProgress);
          setHoverProgress(targetProgress);
          setIsAnimating(false);
        }
      };
      
      if (animationRef.current) clearTimeout(animationRef.current);
      animationRef.current = setTimeout(animate, 16);
    }
  };
  
  const handleMouseLeave = () => {
    if (!interactive) return;
    setIsHovering(false);
    
    if (animateOnHover && animationRef.current) {
      clearTimeout(animationRef.current);
      setDisplayProgress(clamped);
      setHoverProgress(clamped);
      setIsAnimating(false);
    }
  };
  
  const currentProgress = isHovering && animateOnHover ? displayProgress : clamped;
  const displayOffset = circumference - (circumference * currentProgress / 100);
  
  const handleTouchStart = () => {
    handleMouseEnter();
  };
  
  const handleTouchEnd = () => {
    handleMouseLeave();
  };
  
  return (
    <div 
      className="relative group"
      style={{ width: size, height: size }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onClick}
    >
      <svg className="w-full h-full -rotate-90" style={{ display: 'block' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={strokeWidth}
          className="dark:stroke-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={isNaN(displayOffset) ? circumference : displayOffset}
          strokeLinecap="round"
          className={`transition-all duration-300 ease-out ${hasPulse ? 'animate-pulse-scale' : ''}`}
          style={{ 
            filter: `drop-shadow(${getGlowIntensity()})`,
            transition: isAnimating ? 'none' : 'stroke-dashoffset 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
        {isHovering && !animateOnHover && (
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
        <span 
          className="font-bold transition-colors duration-200 dark:text-white"
          style={{ 
            fontSize: size <= 86 ? '0.9rem' : '1.1rem',
            color: status === 'overdue' ? '#EF4444' : (clamped >= 100 ? '#10B981' : '#111827')
          }}
        >
          {Math.round(currentProgress)}%
        </span>
        {label && (
          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
            {isHovering && animateOnHover ? 'preview' : label}
          </span>
        )}
        {value && !isHovering && (
          <span className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">
            {value}
          </span>
        )}
      </div>
      
      <style jsx>{`
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .animate-pulse-scale {
          animation: pulse-scale 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}