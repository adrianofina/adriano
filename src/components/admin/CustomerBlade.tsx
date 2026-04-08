"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Phone,
  Mail,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Clock,
  User
} from "lucide-react";
import ProgressRing from '@/components/ui/ProgressRing';
import SungJinwooShadow from '@/components/ui/infamousshadow';

interface CustomerBladeProps {
  id: string;
  name: string;
  phone: string;
  email?: string;
  loanId: string;
  loanAmount: number;
  amountPaid: number;
  remaining: number;
  progress: number;
  status: "active" | "overdue" | "completed";
  dueDate?: string;
  daysOverdue?: number;
  penalty?: number;
  creditScore?: number;
  completionDate?: string;
}

export default function CustomerBlade({
  id,
  name,
  phone,
  email,
  loanId,
  loanAmount,
  amountPaid,
  remaining,
  progress,
  status,
  dueDate,
  daysOverdue = 0,
  penalty = 0,
  creditScore,
  completionDate
}: CustomerBladeProps) {
  const [expanded, setExpanded] = useState(false);

  const isOverdue = status === "overdue";
  const isCompleted = status === "completed";
  const isActive = status === "active";

  const getStatusColor = () => {
    if (isOverdue) return "bg-red-500";
    if (isCompleted) return "bg-emerald-500";
    return "bg-indigo-500";
  };

  const getRingStatus = () => {
    if (isOverdue) return "overdue";
    if (isCompleted) return "completed";
    return "active";
  };

  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return "TSh 0";
    if (amount >= 1_000_000) return `TSh ${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `TSh ${(amount / 1_000).toFixed(1)}K`;
    return `TSh ${amount.toLocaleString()}`;
  };

  return (
    <div
      className={`group rounded-xl border transition-all duration-300 overflow-hidden relative ${
        expanded
          ? "bg-gray-50 dark:bg-gray-800 border-indigo-300 dark:border-indigo-500/50"
          : isOverdue
          ? "bg-white dark:bg-gray-900 border-red-200 dark:border-red-800 hover:border-red-300"
          : isCompleted
          ? "bg-white dark:bg-gray-900 border-emerald-200 dark:border-emerald-800 hover:border-emerald-300"
          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300"
      }`}
    >
      {/* Full height status spine */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColor()} ${
          isOverdue ? "animate-pulse" : ""
        }`}
        style={{ borderTopLeftRadius: "0.75rem", borderBottomLeftRadius: "0.75rem" }}
      />

      {/* Blade Header */}
      <div
        className="p-4 pl-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 flex-wrap">
          {/* Mini Progress Ring */}
          <div className="flex-shrink-0">
            <ProgressRing
              progress={progress}
              size={52}
              strokeWidth={5}
              status={getRingStatus()}
              interactive={true}
              animateOnHover={true}
              pulseOnOverdue={isOverdue}
              rotationEffect={true}
              onDark={false}
            />
          </div>

          {/* Customer Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                {loanId}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isOverdue
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse"
                    : isCompleted
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                }`}
              >
                {status.toUpperCase()}
              </span>
              {isOverdue && daysOverdue > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-mono">
                  {daysOverdue} days overdue
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs flex-wrap">
              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <User className="w-3 h-3" />
                {name}
              </span>
              <span className="text-gray-400">•</span>
              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Phone className="w-3 h-3" />
                {phone}
              </span>
              {email && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Mail className="w-3 h-3" />
                    {email}
                  </span>
                </>
              )}
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 dark:text-gray-400 font-mono">
                {formatCurrency(loanAmount)}
              </span>
            </div>
          </div>

          <ChevronRight
            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
              expanded ? "rotate-90" : ""
            }`}
          />
        </div>
      </div>

      {/* Expanded Blueprint Section */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50"
          style={{
            transform: expanded ? "translateX(0)" : "translateX(-20px)",
            transition: "transform 0.3s ease-out"
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Payment Details */}
            <div>
              <p className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 tracking-widest font-bold mb-3">
                LOAN DETAILS
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500">Total Amount</span>
                  <span className="font-mono font-bold text-xs text-gray-900 dark:text-white">
                    {formatCurrency(loanAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500">Amount Paid</span>
                  <span className="font-mono font-bold text-xs text-emerald-600">
                    {formatCurrency(amountPaid)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-gray-500">Remaining</span>
                  <span className="font-mono font-bold text-xs text-amber-600">
                    {formatCurrency(remaining)}
                  </span>
                </div>
                {dueDate && (
                  <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500">Due Date</span>
                    <span className="font-mono font-bold text-xs text-gray-900 dark:text-white">
                      {new Date(dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {isOverdue && penalty > 0 && (
                  <div className="mt-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                    <p className="text-[10px] text-red-600 dark:text-red-400 font-mono flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      Penalty accrued: {formatCurrency(penalty)}
                    </p>
                  </div>
                )}
                {isCompleted && completionDate && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      Completed on {new Date(completionDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Details */}
            <div>
              <p className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 tracking-widest font-bold mb-3">
                CONTACT
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 py-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-700 dark:text-gray-300">{phone}</span>
                </div>
                {email && (
                  <div className="flex items-center gap-2 py-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">{email}</span>
                  </div>
                )}
                {creditScore && (
                  <div className="flex items-center gap-2 py-2">
                    <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      Credit Score: {creditScore}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <p className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 tracking-widest font-bold mb-3">
                ACTIONS
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href={`/admin/customers/${id}`}
                  className="w-full py-2.5 px-4 rounded-xl text-center bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all hover:scale-105"
                >
                  View Customer
                </Link>
                {(isActive || isOverdue) && (
                  <Link
                    href={`/admin/loans/${loanId}`}
                    className="w-full py-2.5 px-4 rounded-xl text-center bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all"
                  >
                    Record Payment
                  </Link>
                )}
                {isOverdue && (
                  <button className="w-full py-2.5 px-4 rounded-xl text-center bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all">
                    Send Reminder
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sung Jinwoo Shadow */}
      <SungJinwooShadow
        progress={progress}
        status={getRingStatus()}
        height="h-0.5"
      />
    </div>
  );
}
