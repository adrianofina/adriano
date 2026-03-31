"use client";

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Phone, Mail, MapPin, CreditCard, FileText, Edit,
  Upload, CheckCircle, Clock, User, Briefcase, Building,
  AlertCircle, TrendingUp, Plus, Eye, Download, DollarSign, Trash2
} from 'lucide-react';
import LoanModal from '@/components/modals/LoanModal';
import PaymentModal from '@/components/modals/PaymentModal';
import DocumentUploadModal from '@/components/modals/DocumentUploadModal';
import * as React from 'react';
const { useState, useEffect, useRef, useCallback } = React;

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION CONSTANTS — with just a little tweak 
// ─────────────────────────────────────────────────────────────────────────────

// Ring 1 — LoanHealthRing
const MERCURY_WOBBLE_DURATION   = 480;   // ms — total mercury slosh duration
const MERCURY_WOBBLE_CYCLES     = 2.5;   // oscillation cycles during slosh
const MERCURY_AMPLITUDE_RATIO   = 0.06;  // fraction of circumference to slosh
const GLOW_FADE_IN_MS           = 180;
const GLOW_FADE_OUT_MS          = 320;
const OVERDUE_BREATHE_MS        = 2400;  // ms — full breathe cycle

// Ring 2 — RepaymentRing
const REPAY_RESET_HOLD_MS       = 160;   // pause at 0 before fill
const REPAY_FILL_MS             = 1300;
const REPAY_ABORT_MS            = 220;   // snap to final on leave

// Ring 3 — LoanProgressRing (mini)
const MINI_RESET_HOLD_MS        = 100;
const MINI_FILL_MS              = 900;
const MINI_ABORT_MS             = 180;

// ─────────────────────────────────────────────────────────────────────────────
// SPRING EASING — approximates cubic-bezier(0.34, 1.56, 0.64, 1)
// ─────────────────────────────────────────────────────────────────────────────
function springEase(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const c1 = 0.34, c2 = 1.56, c3 = 0.64;
  const p1 = 3 * c1 * t * (1 - t) ** 2;
  const p2 = 3 * c2 * t ** 2 * (1 - t);
  const p3 = c3 * t ** 3;
  return Math.min(1.08, p1 + p2 + p3);
}

// ─────────────────────────────────────────────────────────────────────────────
// COLOR HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function healthColor(score: number): string {
  if (score >= 80) return '#10B981';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
}

function dropShadow(hex: string, blur: number, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `drop-shadow(0 0 ${blur}px rgba(${r},${g},${b},${alpha}))`;
}

// ─────────────────────────────────────────────────────────────────────────────
// LOAN HEALTH FORMULA
// ─────────────────────────────────────────────────────────────────────────────
function computeLoanHealth(c: Customer): number {
  const repaymentRatio = c.totalBorrowed > 0 ? c.totalRepaid / c.totalBorrowed : 0;
  const overdueRatio   = c.totalLoans    > 0 ? c.overdueLoans / c.totalLoans    : 0;
  const activeRatio    = c.totalLoans    > 0 ? c.activeLoans  / c.totalLoans    : 0;
  return Math.round(
    repaymentRatio                 * 40 +
    (1 - overdueRatio)             * 35 +
    (1 - Math.min(activeRatio, 1)) * 25
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────────────────────────────
interface Customer {
  id: string; customerId: string; firstName: string; surname: string;
  middleName?: string; phoneNumber: string; alternativePhone?: string;
  email?: string; gender?: string; dateOfBirth?: string;
  address?: string; city?: string; region?: string;
  occupation?: string; employer?: string; monthlyIncome?: number;
  businessName?: string; maritalStatus?: string; dependents?: number;
  nationalId?: string; bankName?: string; accountNumber?: string;
  mobileMoneyProvider?: string; mobileMoneyNumber?: string;
  creditScore?: number; riskLevel?: 'low' | 'medium' | 'high';
  category?: string; totalLoans: number; activeLoans: number;
  overdueLoans: number; totalBorrowed: number; totalRepaid: number;
  createdAt: string; updatedAt: string;
}
interface Loan {
  id: string; loanId: string; amount: number; amountPaid?: number;
  status: string; purpose: string; progress: number;
  dueDate?: string; interestRate?: number; remainingBalance?: number;
}
interface Document {
  id: string; name?: string; fileName?: string; type?: string;
  documentType?: string; size?: number; fileSize?: number;
  fileUrl?: string; uploadedAt: string; verified: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── LoanHealthRing  (Ring 1 — header)
// ─────────────────────────────────────────────────────────────────────────────

const LoanHealthRing = ({
  customer, size = 90, strokeWidth = 6, onDark = false,
}: {
  customer: Customer; size?: number; strokeWidth?: number; onDark?: boolean;
}) => {
  const score      = computeLoanHealth(customer);
  const clamped    = Math.min(100, Math.max(0, score));
  const color      = healthColor(clamped);
  const isOverdue  = customer.overdueLoans > 0;

  const radius        = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const baseDashOffset = circumference - (circumference * clamped / 100);

  const [rotationAngle, setRotationAngle] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [glowBlur, setGlowBlur] = useState(isOverdue ? 6 : 0);
  const [glowAlpha, setGlowAlpha] = useState(isOverdue ? 0.5 : 0);
  const [isHovering, setIsHovering] = useState(false);

  const rotateRaf = useRef<number | null>(null);
  const breatheRaf = useRef<number | null>(null);
  const hoverRef = useRef(false);

  // ── Overdue resting breathe ───
  useEffect(() => {
    if (!isOverdue) { setGlowBlur(0); setGlowAlpha(0); return; }
    let start: number;
    const breathe = (ts: number) => {
      if (!start) start = ts;
      if (hoverRef.current) { breatheRaf.current = requestAnimationFrame(breathe); return; }
      const t = ((ts - start) % OVERDUE_BREATHE_MS) / OVERDUE_BREATHE_MS;
      const v = 0.5 - 0.5 * Math.cos(t * Math.PI * 2);
      setGlowBlur(4 + v * 8);
      setGlowAlpha(0.3 + v * 0.5);
      breatheRaf.current = requestAnimationFrame(breathe);
    };
    breatheRaf.current = requestAnimationFrame(breathe);
    return () => { if (breatheRaf.current) cancelAnimationFrame(breatheRaf.current); };
  }, [isOverdue]);

  // ── Rotating arc effect on hover ───
  const startRotation = useCallback(() => {
    if (rotateRaf.current) cancelAnimationFrame(rotateRaf.current);
    setIsRotating(true);
    
    // Rotate from current angle to +360deg
    const startAngle = rotationAngle;
    const targetAngle = startAngle + 360;
    const duration = 800; // ms - smooth and visible
    const startTime = performance.now();
    
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Ease out for smooth finish
      const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
      const newAngle = startAngle + (targetAngle - startAngle) * easeOut(t);
      setRotationAngle(newAngle);
      
      if (t < 1) {
        rotateRaf.current = requestAnimationFrame(animate);
      } else {
        // Settle back to original position
        setRotationAngle(0);
        setIsRotating(false);
        rotateRaf.current = null;
      }
    };
    
    rotateRaf.current = requestAnimationFrame(animate);
  }, [rotationAngle]);

  const handleEnter = useCallback(() => {
    hoverRef.current = true;
    setIsHovering(true);
    startRotation();
    setGlowBlur(isOverdue ? 16 : 10);
    setGlowAlpha(isOverdue ? 0.90 : 0.65);
  }, [startRotation, isOverdue]);

  const handleLeave = useCallback(() => {
    hoverRef.current = false;
    setIsHovering(false);
    if (rotateRaf.current) { cancelAnimationFrame(rotateRaf.current); rotateRaf.current = null; }
    setIsRotating(false);
    setRotationAngle(0);
    if (!isOverdue) { setGlowBlur(0); setGlowAlpha(0); }
  }, [isOverdue]);

  // Apply rotation to the arc via transform
  const arcTransform = isRotating || rotationAngle !== 0
    ? `rotate(${rotationAngle}deg, ${size/2}, ${size/2})`
    : undefined;

  const dashOffset = baseDashOffset;

  const textColor = clamped < 50 ? '#EF4444' : clamped >= 80 ? '#10B981' : (onDark ? '#FFFFFF' : '#64718d');
  const subColor  = onDark ? 'rgba(230, 229, 229, 0.88)' : 'rgba(168, 168, 168, 0.7)';
  return (
    <div
      style={{ width: size, height: size, position: 'relative', cursor: 'pointer', minWidth: 44, minHeight: 44 }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchStart={handleEnter}
      onTouchEnd={handleLeave}
    >
      <svg width={size} height={size} style={{ display: 'block', transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={onDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}
          strokeWidth={strokeWidth} />
        {/* Arc with rotation transform */}
        <g transform={arcTransform ? `rotate(${rotationAngle}, ${size/2}, ${size/2})` : undefined}>
          <circle cx={size/2} cy={size/2} r={radius} fill="none"
            stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{
              filter: dropShadow(color, glowBlur, glowAlpha),
              transition: `filter ${isHovering ? GLOW_FADE_IN_MS : GLOW_FADE_OUT_MS}ms ease`,
            }} />
        </g>
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
      }}>
        <span style={{ fontSize: size <= 86 ? '0.88rem' : '1.05rem', fontWeight: 700, color: textColor, lineHeight: 1 }}>
          {clamped}%
        </span>
        <span style={{ fontSize: '0.52rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: subColor, marginTop: 3 }}>
          HEALTH
        </span>
        <span style={{ fontSize: '0.5rem', color: subColor, marginTop: 1 }}>
          {score}/100
        </span>
      </div>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────
// ─── RepaymentRing  (Ring 2 — repayment banner)
// ─────────────────────────────────────────────────────────────────────────────
const RepaymentRing = ({
  customer, formatCurrency, size = 100, strokeWidth = 7,
}: {
  customer: Customer; formatCurrency: (n: number) => string;
  size?: number; strokeWidth?: number;
}) => {
  const actual = customer.totalBorrowed > 0
    ? Math.round((customer.totalRepaid / customer.totalBorrowed) * 100) : 0;

  const radius        = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color         = actual >= 100 ? '#10B981' : '#818CF8';

  const [displayPct,  setDisplayPct]  = useState(actual);
  const frameRef      = useRef<number | null>(null);
  const holdRef       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animatingRef  = useRef(false);
  const hasAnimated   = useRef(false);

  const cancelAll = useCallback(() => {
    if (frameRef.current) { cancelAnimationFrame(frameRef.current); frameRef.current = null; }
    if (holdRef.current)  { clearTimeout(holdRef.current);          holdRef.current  = null; }
    animatingRef.current = false;
  }, []);

  const runFill = useCallback(() => {
    // 1. Snap to 0 — user SEES zero
    setDisplayPct(0);
    animatingRef.current = true;

    // 2. Hold at 0 for a beat
    holdRef.current = setTimeout(() => {
      const startTs = performance.now();
      const tick = (now: number) => {
        const t   = Math.min(1, (now - startTs) / REPAY_FILL_MS);
        const val = springEase(t) * actual;
        // Number counts as integers, capped at actual (overshoot is arc-only)
        setDisplayPct(Math.min(actual, Math.max(0, Math.round(val))));
        if (t < 1) {
          frameRef.current = requestAnimationFrame(tick);
        } else {
          setDisplayPct(actual);
          animatingRef.current = false;
          frameRef.current = null;
        }
      };
      frameRef.current = requestAnimationFrame(tick);
    }, REPAY_RESET_HOLD_MS);
  }, [actual]);

  const handleEnter = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    cancelAll();
    runFill();
  }, [cancelAll, runFill]);

  const handleLeave = useCallback(() => {
    hasAnimated.current = false;
    if (animatingRef.current) { cancelAll(); setDisplayPct(actual); }
  }, [cancelAll, actual]);

  // Arc allows slight overshoot; number is capped
  const arcProgress  = actual > 0 ? Math.min(1.06, displayPct / actual) * actual : 0;
  const dashOffset   = circumference - (circumference * arcProgress / 100);

  return (
    <div
      style={{ width: size, height: size, position: 'relative', cursor: 'pointer', minWidth: 44, minHeight: 44 }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchStart={handleEnter}
      onTouchEnd={handleLeave}
    >
      <svg width={size} height={size} style={{ display: 'block', transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="rgba(0,0,0,0.06)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{
            transition: animatingRef.current
              ? 'none'
              : `stroke-dashoffset ${REPAY_ABORT_MS}ms ease-out`,
          }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
      }}>
        <span className="dark:!text-white" style={{
          fontSize: size <= 86 ? '0.88rem' : '1.1rem',
          fontWeight: 700, color: '#111827', lineHeight: 1,
        }}>
          {displayPct}%
        </span>
        <span className="dark:!text-white/40" style={{
          fontSize: '0.52rem', fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'rgba(0,0,0,0.38)', marginTop: 3,
        }}>
          REPAID
        </span>
        <span className="dark:!text-white/30" style={{
          fontSize: '0.5rem', color: 'rgba(0,0,0,0.35)', marginTop: 1,
        }}>
          {formatCurrency(customer.totalRepaid)} paid
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ─── LoanProgressRing  (Ring 3 — loan cards, mini fill-from-zero)
// ─────────────────────────────────────────────────────────────────────────────
const LoanProgressRing = ({
  loan, size = 48, strokeWidth = 4,
}: {
  loan: Loan; formatCurrency?: (n: number) => string;
  size?: number; strokeWidth?: number;
}) => {
  const actual = loan.amount > 0
    ? Math.round(((loan.amountPaid || 0) / loan.amount) * 100) : 0;

  const getColor = (pct: number) => pct >= 100 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444';
  const color = getColor(actual);

  const radius        = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const [displayPct,  setDisplayPct]  = useState(actual);
  const frameRef      = useRef<number | null>(null);
  const holdRef       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animatingRef  = useRef(false);
  const hasAnimated   = useRef(false);

  const cancelAll = useCallback(() => {
    if (frameRef.current) { cancelAnimationFrame(frameRef.current); frameRef.current = null; }
    if (holdRef.current)  { clearTimeout(holdRef.current);          holdRef.current  = null; }
    animatingRef.current = false;
  }, []);

  const runFill = useCallback(() => {
    setDisplayPct(0);
    animatingRef.current = true;
    holdRef.current = setTimeout(() => {
      const startTs = performance.now();
      const tick = (now: number) => {
        const t   = Math.min(1, (now - startTs) / MINI_FILL_MS);
        const val = springEase(t) * actual;
        setDisplayPct(Math.min(actual, Math.max(0, Math.round(val))));
        if (t < 1) {
          frameRef.current = requestAnimationFrame(tick);
        } else {
          setDisplayPct(actual);
          animatingRef.current = false;
          frameRef.current = null;
        }
      };
      frameRef.current = requestAnimationFrame(tick);
    }, MINI_RESET_HOLD_MS);
  }, [actual]);

  const handleEnter = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    cancelAll();
    runFill();
  }, [cancelAll, runFill]);

  const handleLeave = useCallback(() => {
    hasAnimated.current = false;
    if (animatingRef.current) { cancelAll(); setDisplayPct(actual); }
  }, [cancelAll, actual]);

  const arcProgress = actual > 0 ? Math.min(1.06, displayPct / actual) * actual : 0;
  const dashOffset  = circumference - (circumference * arcProgress / 100);

  return (
    <div
      style={{ width: size, height: size, position: 'relative', cursor: 'pointer', minWidth: 44, minHeight: 44 }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchStart={handleEnter}
      onTouchEnd={handleLeave}
    >
      <svg width={size} height={size} style={{ display: 'block', transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="rgba(0,0,0,0.07)" strokeWidth={strokeWidth}
          className="dark:stroke-gray-700" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{
            transition: animatingRef.current
              ? 'none'
              : `stroke-dashoffset ${MINI_ABORT_MS}ms ease-out`,
          }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
      }}>
        <span className="text-[10px] font-bold text-gray-900 dark:text-white" style={{ lineHeight: 1 }}>
          {displayPct}%
        </span>
        <span style={{
          fontSize: '0.44rem', letterSpacing: '0.06em',
          textTransform: 'uppercase', color: 'rgba(0,0,0,0.38)', marginTop: 1,
        }} className="dark:!text-white/40">
          PAID
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ─── LoanCard
// ─────────────────────────────────────────────────────────────────────────────
const LoanCard = ({
  loan, formatCurrency, onRecordPayment
}: {
  loan: Loan; formatCurrency: (n: number) => string;
  onRecordPayment: (loan: Loan) => void;
}) => {
  // Calculate progress directly from amount and amountPaid
  const progress = loan.amount > 0 
    ? Math.round(((loan.amountPaid || 0) / loan.amount) * 100) 
    : 0;
  
  // Determine color based on progress and status
  const progressColor = 
    loan.status === 'completed' || progress >= 100 ? 'bg-emerald-500' :
    progress >= 50 ? 'bg-amber-500' : 'bg-red-500';
  
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/60 relative overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <LoanProgressRing loan={loan} size={48} strokeWidth={4} />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{loan.loanId}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{loan.purpose}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full ${
              loan.status === 'active'  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : loan.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : loan.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}>{loan.status}</span>
            {(loan.status === 'active' || loan.status === 'overdue') && (
              <button onClick={() => onRecordPayment(loan)}
                className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg transition-colors flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                Record Payment
              </button>
            )}
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Amount</p>
            <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(loan.amount)}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Paid</p>
            <p className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(loan.amountPaid || 0)}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Remaining</p>
            <p className="font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(loan.remainingBalance || loan.amount)}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Progress</p>
            <p className="font-semibold text-indigo-600 dark:text-indigo-400">{progress}%</p>
          </div>
        </div>
        
        {loan.dueDate && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            Due {new Date(loan.dueDate).toLocaleDateString()}
          </p>
        )}
      </div>
      
      {/* SUBTLE PROGRESS BAR - at the very bottom edge of the card */}
      <div className="h-1 w-full bg-gray-200 dark:bg-gray-700">
        <div 
          className={`h-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ─── DocumentCard
// ─────────────────────────────────────────────────────────────────────────────
const DocumentCard = ({
  doc, customerId, onDelete
}: {
  doc: Document; customerId: string; onDelete: (id: string) => void;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const fileName     = doc.fileName || doc.name || 'Untitled';
  const documentType = doc.documentType || doc.type || 'Document';
  const fileSize     = doc.fileSize || doc.size || 0;
  const fileUrl      = doc.fileUrl || '#';

  const documentTypeLabels: Record<string, string> = {
    national_id: 'National ID', passport_photo: 'Passport Photo',
    bank_statement: 'Bank Statement', salary_slip: 'Salary Slip',
    employment_letter: 'Employment Letter', business_license: 'Business License',
    tax_clearance: 'Tax Clearance', court_document: 'Court Document',
    contract: 'Contract', guarantor_letter: 'Guarantor Letter',
  };

  const handleDelete = async () => {
    if (!confirm('Delete this document?')) return;
    setIsDeleting(true);
    try {
      const res    = await fetch(`/api/admin/customers/${customerId}/documents/${doc.id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) onDelete(doc.id);
      else alert(result.error || 'Failed to delete document');
    } catch { alert('Failed to delete document'); }
    finally  { setIsDeleting(false); }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60 hover:shadow-sm transition-all">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{fileName}</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 whitespace-nowrap">
              {documentTypeLabels[documentType] || documentType}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(fileSize)}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 ml-2 shrink-0">
        {doc.verified
          ? <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs"><CheckCircle className="w-3 h-3" /></span>
          : <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-xs"><Clock className="w-3 h-3" /></span>}
        {fileUrl !== '#' && (
          <a href={fileUrl} target="_blank" rel="noopener noreferrer"
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </a>
        )}
        <a href={fileUrl} download className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </a>
        <button onClick={handleDelete} disabled={isDeleting}
          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors">
          {isDeleting
            ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            : <Trash2 className="w-4 h-4 text-red-500" />}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ─── Page
// ─────────────────────────────────────────────────────────────────────────────
export default function CustomerDetailsPage() {
  const params  = useParams();
  const router  = useRouter();

  const [customer,          setCustomer]          = useState<Customer | null>(null);
  const [loans,             setLoans]             = useState<Loan[]>([]);
  const [documents,         setDocuments]         = useState<Document[]>([]);
  const [activeTab,         setActiveTab]         = useState('details');
  const [loading,           setLoading]           = useState(true);
  const [showLoanModal,     setShowLoanModal]     = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showPaymentModal,  setShowPaymentModal]  = useState(false);
  const [selectedLoan,      setSelectedLoan]      = useState<Loan | null>(null);

  const customerId = params.id as string;

  const fetchData = async () => {
    try {
      const [cRes, lRes, dRes] = await Promise.all([
        fetch(`/api/admin/customers/${customerId}`),
        fetch(`/api/admin/customers/${customerId}/loans`),
        fetch(`/api/admin/customers/${customerId}/documents`),
      ]);
      const [cData, lData, dData] = await Promise.all([cRes.json(), lRes.json(), dRes.json()]);
      setCustomer(cData.data || cData);
      setLoans(lData.data || []);
      setDocuments(dData.data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (customerId) fetchData(); }, [customerId]);

  const formatCurrency = (n: number) => {
    if (!n) return 'TSh 0';
    if (n >= 1_000_000) return `TSh ${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `TSh ${(n / 1_000).toFixed(1)}K`;
    return `TSh ${n.toLocaleString()}`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
    </div>
  );

  if (!customer) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Customer Not Found</h2>
        <button onClick={() => router.push('/admin/customers')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">
          Back to Customers
        </button>
      </div>
    </div>
  );

  const repaidPercentage = customer.totalBorrowed > 0
    ? Math.round((customer.totalRepaid / customer.totalBorrowed) * 100) : 0;
  const hasOverdue = customer.overdueLoans > 0;

  const riskPill = {
    low:    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-400/15 dark:text-emerald-300 dark:border-emerald-400/20',
    medium: 'bg-amber-100   text-amber-700   border-amber-200   dark:bg-amber-400/15   dark:text-amber-300   dark:border-amber-400/20',
    high:   'bg-red-100     text-red-700     border-red-200     dark:bg-red-400/15     dark:text-red-300     dark:border-red-400/20',
  }[customer.riskLevel || 'medium'] ?? 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Header ── */}
      <header className="relative overflow-hidden
        bg-gradient-to-br from-indigo-50 via-white to-purple-50
        dark:from-gray-900 dark:via-[#0d0e12] dark:to-gray-900">
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.6) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
        <div className="absolute -top-12 left-[20%] w-80 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
        <div className="absolute -top-8 right-[15%] w-64 h-36 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.10) 0%, transparent 70%)' }} />

        <div className="relative max-w-7xl mx-auto px-6 pt-5 pb-8">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => router.push('/admin/customers')}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 dark:text-white/50 dark:hover:text-white/90 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              Customers
            </button>
            <Link href={`/admin/customers/${customerId}/edit`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 dark:text-white/60 dark:hover:text-white/90 transition-all text-sm border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-transparent">
              <Edit className="w-3.5 h-3.5" />
              Edit
            </Link>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-4 px-5 py-4 rounded-2xl flex-1 min-w-0" style={{
              background: 'linear-gradient(130deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 50%, rgba(59,130,246,0.07) 100%)',
              backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(99,102,241,0.15)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 12px rgba(99,102,241,0.08)',
            }}>
              <div className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center font-bold text-white text-sm" style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.85) 0%, rgba(168,85,247,0.75) 100%)',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
              }}>
                {customer.firstName?.[0]}{customer.surname?.[0]}
              </div>
              <div className="min-w-0">
                <h1 className="text-[1.05rem] font-semibold text-gray-900 dark:text-white leading-tight truncate">
                  {customer.firstName} {customer.surname}
                </h1>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-[10.5px] text-gray-400 dark:text-white/35 font-mono tracking-wide">
                    {customer.customerId}
                  </span>
                  <span className="text-gray-300 dark:text-white/15">·</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${riskPill}`}>
                    {(customer.riskLevel || 'N/A').toUpperCase()}
                  </span>
                  {hasOverdue && (
                    <>
                      <span className="text-gray-300 dark:text-white/15">·</span>
                      <span className="flex items-center gap-1 text-[11px] text-red-500 dark:text-red-400">
                        <AlertCircle className="w-3 h-3" />
                        {customer.overdueLoans} overdue
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 pr-1">
              <LoanHealthRing customer={customer} size={90} strokeWidth={6} onDark={false} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-6 pb-10 space-y-4">

        {/* Contact Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: <Phone  className="w-3.5 h-3.5 text-indigo-500" />, label: 'Phone',   value: customer.phoneNumber },
            { icon: <Mail   className="w-3.5 h-3.5 text-purple-500" />, label: 'Email',   value: customer.email || 'N/A' },
            { icon: <MapPin className="w-3.5 h-3.5 text-blue-500"   />, label: 'Address', value: customer.address || customer.city || customer.region || 'N/A' },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">{icon}</div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Repayment Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-white dark:bg-gray-900 shadow-sm">
          <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.05]" style={{
            background: 'linear-gradient(120deg, #6366f1 0%, #a855f7 100%)',
          }} />
          <div className="relative flex items-center gap-6 px-6 py-5">
            <div className="shrink-0">
              <RepaymentRing customer={customer} formatCurrency={formatCurrency} size={100} strokeWidth={7} />
            </div>
            <div className="w-px self-stretch bg-gray-100 dark:bg-gray-800 shrink-0" />
            <div className="flex-1 grid grid-cols-3 gap-4 min-w-0">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Total Borrowed</p>
                <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(customer.totalBorrowed)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Total Repaid</p>
                <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-1">{formatCurrency(customer.totalRepaid)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Outstanding</p>
                <p className="text-base font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(Math.max(0, customer.totalBorrowed - customer.totalRepaid))}
                </p>
              </div>
            </div>
            <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20">
              <TrendingUp className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            </div>
          </div>
          <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-r-full"
              style={{ width: `${repaidPercentage}%`, transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)' }} />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="flex gap-0 border-b border-gray-100 dark:border-gray-800 px-6">
            {[
              { key: 'details',   label: 'Personal Details' },
              { key: 'loans',     label: `Loans (${loans.length})` },
              { key: 'documents', label: `Documents (${documents.length})` },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`py-3.5 px-1 mr-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === key
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}>
                {label}
              </button>
            ))}
          </div>

          <div className="p-6">

            {/* Personal Details */}
            {activeTab === 'details' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Personal Information</h4>
                  </div>
                  <div className="space-y-2.5">
                    <Field label="Full Name" value={[customer.firstName, customer.middleName, customer.surname].filter(Boolean).join(' ')} />
                    <div className="grid grid-cols-2 gap-2.5">
                      <Field label="Gender"        value={customer.gender || 'N/A'} />
                      <Field label="Date of Birth" value={customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString() : 'N/A'} />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <Field label="Marital Status" value={customer.maritalStatus || 'N/A'} />
                      <Field label="Dependents"     value={String(customer.dependents ?? 0)} />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Employment & Income</h4>
                  </div>
                  <div className="space-y-2.5 mb-6">
                    <Field label="Occupation"     value={customer.occupation || 'N/A'} />
                    <Field label="Employer"       value={customer.employer || customer.businessName || 'N/A'} />
                    <Field label="Monthly Income" value={formatCurrency(customer.monthlyIncome || 0)} />
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                      <Building className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Banking Details</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field label="Bank"       value={customer.bankName || 'N/A'} />
                    <Field label="Account No" value={customer.accountNumber || 'N/A'} />
                  </div>
                </div>
              </div>
            )}

            {/* Loans */}
            {activeTab === 'loans' && (
              <div className="space-y-3">
                <div className="flex justify-end mb-1">
                  <button onClick={() => setShowLoanModal(true)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> New Loan
                  </button>
                </div>
                {loans.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 dark:text-gray-500">No loans yet</p>
                    <button onClick={() => setShowLoanModal(true)}
                      className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium inline-flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Create First Loan
                    </button>
                  </div>
                ) : (
                  <>
                    {loans.map(loan => (
                      <LoanCard key={loan.id} loan={loan} formatCurrency={formatCurrency}
                        onRecordPayment={(l) => { setSelectedLoan(l); setShowPaymentModal(true); }} />
                    ))}
                    <div className="flex justify-center mt-4">
                      <button onClick={() => setShowLoanModal(true)}
                        className="px-4 py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Another Loan
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            

            {/* Documents */}
            {activeTab === 'documents' && (
              <div className="space-y-3">
                <div className="flex justify-end mb-1">
                  <button onClick={() => setShowDocumentModal(true)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" /> Upload Document
                  </button>
                </div>
                {documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 dark:text-gray-500">No documents yet</p>
                    <button onClick={() => setShowDocumentModal(true)}
                      className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium inline-flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Upload First Document
                    </button>
                  </div>
                ) : (
                  <>
                    {documents.map(doc => (
                      <DocumentCard key={doc.id} doc={doc} customerId={customerId}
                        onDelete={(id) => setDocuments(prev => prev.filter(d => d.id !== id))} />
                    ))}
                    <div className="flex justify-center mt-4">
                      <button onClick={() => setShowDocumentModal(true)}
                        className="px-4 py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors inline-flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Upload Another Document
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Modals */}
      {showLoanModal && customer && (
        <LoanModal isOpen={showLoanModal}
          onClose={(refresh) => { setShowLoanModal(false); if (refresh) fetchData(); }}
          customerId={customer.id} />
      )}
      {showDocumentModal && customer && (
        <DocumentUploadModal isOpen={showDocumentModal}
          onClose={(refresh) => { setShowDocumentModal(false); if (refresh) fetchData(); }}
          customerId={customer.id} />
      )}
      {showPaymentModal && selectedLoan && customer && (
        <PaymentModal isOpen={showPaymentModal}
          onClose={(refresh) => { setShowPaymentModal(false); if (refresh) fetchData(); }}
          loanId={selectedLoan.id}
          loanAmount={selectedLoan.amount}
          remainingBalance={selectedLoan.remainingBalance || selectedLoan.amount}
          customerName={`${customer.firstName} ${customer.surname}`}
          loanIdNumber={selectedLoan.loanId} />
      )}
    </div>
  );
}

// ─── Field helper ───
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-3.5 py-3">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{value}</p>
    </div>
  );
}