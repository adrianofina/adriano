"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

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
  onDark?: boolean;
  // Premium features
  rotationEffect?: boolean;
  glowIntensity?: number;
  breatheOnOverdue?: boolean;
}

// Animation constants
const MERCURY_WOBBLE_DURATION = 800;   // ms for rotation effect
const GLOW_FADE_IN_MS = 180;
const GLOW_FADE_OUT_MS = 320;
const OVERDUE_BREATHE_MS = 2400;       // full breathe cycle for overdue

// Premium spring easing - cubic-bezier(0.34, 1.56, 0.64, 1)
function springEase(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const c1 = 0.34, c2 = 1.56, c3 = 0.64;
  const p1 = 3 * c1 * t * (1 - t) ** 2;
  const p2 = 3 * c2 * t ** 2 * (1 - t);
  const p3 = c3 * t ** 3;
  return Math.min(1.08, p1 + p2 + p3);
}

// Color helpers
function getRingColor(progress: number, status: string): string {
  if (progress >= 100) return '#10B981';
  if (status === 'overdue') return '#EF4444';
  if (status === 'pending') return '#F59E0B';
  return '#818CF8';
}

function dropShadow(hex: string, blur: number, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `drop-shadow(0 0 ${blur}px rgba(${r},${g},${b},${alpha}))`;
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
  pulseOnOverdue = false,
  onDark = false,
  rotationEffect = true,
  glowIntensity = 8,
  breatheOnOverdue = true
}: ProgressRingProps) {
  const [displayProgress, setDisplayProgress] = useState(progress);
  const [isHovering, setIsHovering] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [glowBlur, setGlowBlur] = useState(pulseOnOverdue && status === 'overdue' ? glowIntensity : 0);
  const [glowAlpha, setGlowAlpha] = useState(pulseOnOverdue && status === 'overdue' ? 0.5 : 0);
  
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rotateRafRef = useRef<number | null>(null);
  const breatheRafRef = useRef<number | null>(null);
  const hoverRef = useRef(false);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, progress));
  const ringColor = getRingColor(clamped, status);
  const isOverdue = status === 'overdue';

  // ── Overdue breathing animation ──
  useEffect(() => {
    if (!breatheOnOverdue || !isOverdue || !pulseOnOverdue) {
      if (!isHovering) {
        setGlowBlur(isOverdue ? glowIntensity : 0);
        setGlowAlpha(isOverdue ? 0.4 : 0);
      }
      return;
    }

    let start: number;
    const breathe = (ts: number) => {
      if (!start) start = ts;
      if (hoverRef.current) {
        breatheRafRef.current = requestAnimationFrame(breathe);
        return;
      }
      const t = ((ts - start) % OVERDUE_BREATHE_MS) / OVERDUE_BREATHE_MS;
      const v = 0.5 - 0.5 * Math.cos(t * Math.PI * 2);
      setGlowBlur(glowIntensity + v * (glowIntensity + 4));
      setGlowAlpha(0.3 + v * 0.5);
      breatheRafRef.current = requestAnimationFrame(breathe);
    };
    breatheRafRef.current = requestAnimationFrame(breathe);
    return () => {
      if (breatheRafRef.current) cancelAnimationFrame(breatheRafRef.current);
    };
  }, [isOverdue, breatheOnOverdue, pulseOnOverdue, glowIntensity, isHovering]);

  // ── Mercury wobble / rotation effect on hover ──
  const startRotation = useCallback(() => {
    if (!rotationEffect || !interactive) return;
    if (rotateRafRef.current) cancelAnimationFrame(rotateRafRef.current);
    setIsRotating(true);
    
    const startAngle = rotationAngle;
    const targetAngle = startAngle + 360;
    const startTime = performance.now();
    
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / MERCURY_WOBBLE_DURATION);
      const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
      const newAngle = startAngle + (targetAngle - startAngle) * easeOut(t);
      setRotationAngle(newAngle);
      
      if (t < 1) {
        rotateRafRef.current = requestAnimationFrame(animate);
      } else {
        setRotationAngle(0);
        setIsRotating(false);
        rotateRafRef.current = null;
      }
    };
    
    rotateRafRef.current = requestAnimationFrame(animate);
  }, [rotationAngle, rotationEffect, interactive]);

  const handleMouseEnter = () => {
    if (!interactive) return;
    hoverRef.current = true;
    setIsHovering(true);
    startRotation();
    setGlowBlur(isOverdue ? glowIntensity + 10 : glowIntensity + 4);
    setGlowAlpha(isOverdue ? 0.9 : 0.65);

    if (animateOnHover && !isAnimating) {
      setIsAnimating(true);
      setDisplayProgress(0);
      
      const startTime = performance.now();
      const duration = 1200;
      const targetProgress = clamped;
      
      const animateProgress = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const eased = springEase(t);
        const current = targetProgress * eased;
        setDisplayProgress(Math.min(targetProgress, current));
        
        if (t < 1) {
          animationRef.current = setTimeout(() => requestAnimationFrame(animateProgress), 16);
        } else {
          setDisplayProgress(targetProgress);
          setIsAnimating(false);
        }
      };
      
      if (animationRef.current) clearTimeout(animationRef.current);
      requestAnimationFrame(animateProgress);
    }
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    hoverRef.current = false;
    setIsHovering(false);
    setIsRotating(false);
    setRotationAngle(0);
    
    if (rotateRafRef.current) {
      cancelAnimationFrame(rotateRafRef.current);
      rotateRafRef.current = null;
    }
    
    if (!isOverdue || !pulseOnOverdue) {
      setGlowBlur(isOverdue ? glowIntensity : 0);
      setGlowAlpha(isOverdue ? 0.4 : 0);
    }
    
    if (animateOnHover && animationRef.current) {
      clearTimeout(animationRef.current);
      setDisplayProgress(clamped);
      setIsAnimating(false);
    }
  };

  const currentProgress = isHovering && animateOnHover ? displayProgress : clamped;
  const dashOffset = circumference - (circumference * currentProgress / 100);
  
  // Apply rotation transform for the arc (Mercury wobble)
  const arcTransform = isRotating || rotationAngle !== 0
    ? `rotate(${rotationAngle}, ${size/2}, ${size/2})`
    : undefined;

  const getTextColor = () => {
    if (onDark) return '#FFFFFF';
    if (clamped < 50) return '#DC2626';
    if (clamped >= 100) return '#10B981';
    return '#1F2937';
  };
  
  const getSubColor = () => {
    if (onDark) return 'rgba(255,255,255,0.5)';
    return 'rgba(107,114,128,0.7)';
  };

  return (
    <div
      className="relative group"
      style={{
        width: size,
        height: size,
        cursor: interactive ? 'pointer' : 'default',
        minWidth: 44,
        minHeight: 44
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseEnter}
      onTouchEnd={handleMouseLeave}
      onClick={onClick}
    >
      <svg className="w-full h-full" style={{ display: 'block', transform: 'rotate(-90deg)' }}>
        {/* Track - the shadow path */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={onDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
          strokeWidth={strokeWidth}
        />
        {/* Arc with Mercury wobble rotation effect */}
        <g transform={arcTransform}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{
              filter: dropShadow(ringColor, glowBlur, glowAlpha),
              transition: isAnimating 
                ? 'none' 
                : `stroke-dashoffset 0.7s cubic-bezier(0.4, 0, 0.2, 1), filter ${isHovering ? GLOW_FADE_IN_MS : GLOW_FADE_OUT_MS}ms ease`,
            }}
          />
        </g>
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span
          className="font-bold"
          style={{
            fontSize: size <= 86 ? '0.88rem' : '1rem',
            color: getTextColor(),
            lineHeight: 1
          }}
        >
          {Math.round(currentProgress)}%
        </span>
        {label && (
          <span
            className="text-[0.52rem] font-semibold tracking-wide uppercase"
            style={{ color: getSubColor(), marginTop: 3 }}
          >
            {isHovering && animateOnHover ? 'preview' : label}
          </span>
        )}
        {value && !isHovering && (
          <span
            className="text-[0.45rem]"
            style={{ color: getSubColor(), marginTop: 1 }}
          >
            {value}
          </span>
        )}
      </div>
    </div>
  );
}
