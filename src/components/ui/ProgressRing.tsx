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
  ringType?: 'active' | 'repayment'; // New prop to differentiate behavior
  onDark?: boolean; // Keep existing prop
}

// Animation constants
const GHOST_ARC_ROTATION_REST = 'rotate 2.5s linear infinite';
const GHOST_ARC_ROTATION_HOVER = 'rotate 1.5s linear infinite';
const GLOW_FADE_IN = '200ms';
const GLOW_FADE_OUT = '300ms';
const REPAYMENT_SNAP_TIME = 150; // ms at 0%
const REPAYMENT_FILL_DURATION = 1200; // ms
const REPAYMENT_EASING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const REPAYMENT_ABORT_EASING = 'cubic-bezier(0.2, 0, 0, 1)';
const REPAYMENT_ABORT_DURATION = 200; // ms

export default function ProgressRing({
  progress,
  size = 100,
  strokeWidth = 7,
  status = 'active',
  label,
  value,
  onClick,
  interactive = true,
  ringType = 'active',
  onDark = false
}: ProgressRingProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(progress);
  const [showGhostArc, setShowGhostArc] = useState(ringType === 'active' && status === 'overdue');
  const [ghostSpeed, setGhostSpeed] = useState(GHOST_ARC_ROTATION_REST);
  const [glowIntensity, setGlowIntensity] = useState(0.4);
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
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
  
  // Get text color based on onDark prop
  const getTextColor = () => {
    if (status === 'overdue') return '#EF4444';
    if (clamped >= 100) return '#10B981';
    if (onDark) return '#FFFFFF';
    return '#111827';
  };
  
  // Get glow intensity based on status
  const getGlowIntensity = () => {
    if (status === 'overdue') return glowIntensity * 0.8;
    if (clamped >= 100) return 0.5;
    return 0.4;
  };
  
  // Pulse for overdue at rest
  useEffect(() => {
    if (ringType === 'active' && status === 'overdue' && !isHovering) {
      const interval = setInterval(() => {
        setGlowIntensity(prev => prev === 0.4 ? 0.8 : 0.4);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [ringType, status, isHovering]);
  
  // Ghost arc rotation
  useEffect(() => {
    if (ringType === 'active' && (status === 'overdue' || isHovering)) {
      setGhostSpeed(isHovering ? GHOST_ARC_ROTATION_HOVER : GHOST_ARC_ROTATION_REST);
    } else {
      setShowGhostArc(false);
    }
  }, [ringType, status, isHovering]);
  
  const handleRepaymentAnimation = () => {
    if (!interactive || ringType !== 'repayment') return;
    
    setIsAnimating(true);
    // Snap to 0%
    setDisplayProgress(0);
    
    // Hold at 0%
    setTimeout(() => {
      // Animate fill
      const startTime = Date.now();
      const targetProgress = clamped;
      
      const animateFill = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / REPAYMENT_FILL_DURATION);
        const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
        const current = targetProgress * easeOut(t);
        setDisplayProgress(current);
        
        if (t < 1) {
          animationRef.current = setTimeout(animateFill, 16);
        } else {
          setDisplayProgress(targetProgress);
          setIsAnimating(false);
        }
      };
      
      if (animationRef.current) clearTimeout(animationRef.current);
      animationRef.current = setTimeout(animateFill, REPAYMENT_SNAP_TIME);
    }, REPAYMENT_SNAP_TIME);
  };
  
  const abortRepaymentAnimation = () => {
    if (!interactive || ringType !== 'repayment') return;
    
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      // Snap to final value with quick ease
      setDisplayProgress(clamped);
      setIsAnimating(false);
    }
  };
  
  const handleMouseEnter = () => {
    if (!interactive) return;
    setIsHovering(true);
    
    if (ringType === 'repayment') {
      handleRepaymentAnimation();
    }
    
    if (ringType === 'active') {
      setGlowIntensity(1.0);
    }
  };
  
  const handleMouseLeave = () => {
    if (!interactive) return;
    setIsHovering(false);
    
    if (ringType === 'repayment') {
      abortRepaymentAnimation();
    }
    
    if (ringType === 'active') {
      setGlowIntensity(0.4);
    }
  };
  
  const currentProgress = ringType === 'repayment' && isAnimating ? displayProgress : clamped;
  const displayOffset = circumference - (circumference * currentProgress / 100);
  
  // Ghost arc (25% of circumference)
  const ghostArcLength = circumference * 0.25;
  const ghostDashArray = `${ghostArcLength} ${circumference - ghostArcLength}`;
  
  const handleTouchStart = () => handleMouseEnter();
  const handleTouchEnd = () => handleMouseLeave();
  
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
        
        {/* Ghost arc for Ring 1 */}
        {ringType === 'active' && (status === 'overdue' || isHovering) && (
          <g className="ghost-arc" style={{ animation: ghostSpeed }}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius + strokeWidth / 2}
              fill="none"
              stroke={ringColor}
              strokeWidth={strokeWidth - 2}
              strokeDasharray={ghostDashArray}
              strokeDashoffset={circumference * 0.25}
              strokeLinecap="round"
              strokeOpacity={isHovering ? 0.8 : 0.5}
            />
          </g>
        )}
        
        {/* Progress ring */}
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
          style={{ 
            filter: `drop-shadow(0 0 ${glowIntensity * 8}px ${ringColor}${Math.floor(glowIntensity * 100)})`,
            transition: isAnimating ? 'none' : `stroke-dashoffset ${REPAYMENT_ABORT_DURATION}ms ${REPAYMENT_ABORT_EASING}`
          }}
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {ringType === 'repayment' ? (
          <span 
            className="font-bold transition-colors duration-200"
            style={{ 
              fontSize: size <= 86 ? '0.9rem' : '1.1rem',
              color: getTextColor()
            }}
          >
            {Math.round(currentProgress)}%
          </span>
        ) : (
          <span 
            className="font-bold transition-colors duration-200"
            style={{ 
              fontSize: size <= 86 ? '0.9rem' : '1.1rem',
              color: getTextColor()
            }}
          >
            {Math.round(clamped)}%
          </span>
        )}
        {label && (
          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
            {label}
          </span>
        )}
        {value && !isHovering && (
          <span className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">
            {value}
          </span>
        )}
      </div>
      
      <style jsx>{`
        .ghost-arc {
          animation: ${ghostSpeed};
          transform-origin: center;
        }
        
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}