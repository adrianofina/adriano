"use client";

interface SungJinwooShadowProps {
  progress: number;
  status?: 'active' | 'overdue' | 'completed' | 'pending';
  height?: 'h-0.5' | 'h-1' | 'h-1.5';
  className?: string;
}

export default function SungJinwooShadow({ 
  progress, 
  status = 'active',
  height = 'h-1',
  className = ''
}: SungJinwooShadowProps) {
  const getColor = () => {
    if (progress >= 100) return 'bg-emerald-500';
    if (status === 'overdue') return 'bg-red-500';
    if (status === 'pending') return 'bg-amber-500';
    return 'bg-indigo-500';
  };

  const getTrackColor = () => {
    if (status === 'overdue') return 'bg-red-200 dark:bg-red-900/30';
    if (status === 'pending') return 'bg-amber-200 dark:bg-amber-900/30';
    return 'bg-gray-200 dark:bg-gray-700';
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`${height} w-full ${getTrackColor()} ${className}`}>
      <div 
        className={`h-full ${getColor()} transition-all duration-500`}
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  );
}
