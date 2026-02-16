'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  CreditCard, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  FileText,
  History,
  User,
  Settings,
  Bell,
  Shield,
  DollarSign,
  Award,
  Target,
  Sparkles,
  Zap,
  BarChart3,
  Calendar,
  Home,
  LogOut
} from "lucide-react";
import { useTheme } from "next-themes";

export default function CustomerDashboard() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [hoveredRing, setHoveredRing] = useState<string | null>(null);
  const [clickedCard, setClickedCard] = useState<string | null>(null);
  const [mainRingProgress, setMainRingProgress] = useState(98.8);
  const [displayPercentage, setDisplayPercentage] = useState(98.8);
  const [isAnimating, setIsAnimating] = useState(false);
  const [overdueRingRotation, setOverdueRingRotation] = useState(0);
  const [overduePulseScale, setOverduePulseScale] = useState(1);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Main ring animation - SLOW, DRAMATIC fill from 0 → 98.8%
  useEffect(() => {
    let animationTimer: NodeJS.Timeout;
    let progressTimer: NodeJS.Timeout;
    
    if (hoveredRing === 'main' || clickedCard === 'ring-main') {
      setIsAnimating(true);
      
      setMainRingProgress(0);
      setDisplayPercentage(0);
      
      animationTimer = setTimeout(() => {
        let currentProgress = 0;
        const targetProgress = 98.8;
        const increment = 0.4;
        const intervalTime = 20;
        
        progressTimer = setInterval(() => {
          currentProgress += increment;
          if (currentProgress >= targetProgress) {
            setMainRingProgress(targetProgress);
            setDisplayPercentage(targetProgress);
            clearInterval(progressTimer);
            setIsAnimating(false);
          } else {
            setMainRingProgress(currentProgress);
            setDisplayPercentage(Math.round(currentProgress * 10) / 10);
          }
        }, intervalTime);
      }, 50);
      
    } else {
      setMainRingProgress(98.8);
      setDisplayPercentage(98.8);
      setIsAnimating(false);
    }
    
    return () => {
      clearTimeout(animationTimer);
      clearInterval(progressTimer);
    };
  }, [hoveredRing, clickedCard]);

  // Overdue ring animation
  useEffect(() => {
    let rotationInterval: NodeJS.Timeout;
    let pulseInterval: NodeJS.Timeout;
    
    if (hoveredRing === 'overdue' || clickedCard === 'ring-overdue') {
      rotationInterval = setInterval(() => {
        setOverdueRingRotation(prev => (prev + 3) % 360);
      }, 50);
      
      pulseInterval = setInterval(() => {
        setOverduePulseScale(prev => prev === 1 ? 1.04 : 1);
      }, 300);
      
    } else {
      setOverdueRingRotation(0);
      setOverduePulseScale(1);
    }
    
    return () => {
      if (rotationInterval) clearInterval(rotationInterval);
      if (pulseInterval) clearInterval(pulseInterval);
    };
  }, [hoveredRing, clickedCard]);

  const customer = {
    name: "Laurent Adriano",
    initials: "LA",
    memberSince: "Jan 2024",
    nextPayment: "Apr 15",
    loanProgress: 68,
    creditScore: 750
  };

  const currentLoan = {
    id: "L-342",
    total: 3420000,
    paid: 3380000,
    remaining: 120000,
    dueDate: "Apr 15",
    penalty: 80000,
    isOverdue: true,
    progress: 40,
    purpose: "Business Expansion",
    interestRate: 12,
    paidPercentage: 98.8,
    remainingPercentage: 1.2
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      currencyDisplay: 'code'
    }).format(amount).replace('TZS', 'TSh');
  };

  // Ring calculations
  const mainSize = 160;
  const mainStroke = 10;
  const mainRadius = (mainSize - mainStroke) / 2;
  const mainCircumference = mainRadius * 2 * Math.PI;
  const mainOffset = mainCircumference - (Math.min(mainRingProgress, 98.8) / 100) * mainCircumference;

  const overdueSize = 180;
  const overdueStroke = 12;
  const overdueRadius = (overdueSize - overdueStroke) / 2;
  const overdueCircumference = overdueRadius * 2 * Math.PI;
  const overdueOffset = 0; // 100% filled

  const stats = [
    { 
      id: 'credit',
      title: "Credit Score", 
      value: "750", 
      badge: "Excellent",
      badgeColor: "green",
      icon: Award,
      gradient: "from-emerald-400 to-teal-500",
      progress: 88,
      detail: "Top 15%",
    },
    { 
      id: 'active',
      title: "Active Loans", 
      value: "1", 
      badge: "In Progress",
      badgeColor: "blue",
      icon: CreditCard,
      gradient: "from-blue-400 to-indigo-500",
      detail: "View details",
    },
    { 
      id: 'borrowed',
      title: "Total Borrowed", 
      value: formatCurrency(15000000), 
      badge: "Lifetime",
      badgeColor: "purple",
      icon: DollarSign,
      gradient: "from-purple-400 to-pink-500",
      detail: "3 loans",
    },
    { 
      id: 'repaid',
      title: "Repaid", 
      value: formatCurrency(13800000), 
      badge: "92%",
      badgeColor: "green",
      icon: CheckCircle,
      gradient: "from-green-400 to-emerald-500",
      progress: 92,
      detail: "TSh 13.8M",
    },
  ];

  const quickActions = [
    {
      id: 'apply',
      title: "Apply",
      description: "New loan",
      href: "/customer/apply-loan",
      icon: FileText,
      gradient: "from-blue-500 to-indigo-600",
      color: "blue"
    },
    {
      id: 'pay',
      title: "Pay",
      description: "Current loan",
      href: "/customer/pay-now",
      icon: CreditCard,
      gradient: "from-emerald-500 to-teal-600",
      color: "emerald"
    },
    {
      id: 'history',
      title: "History",
      description: "Transactions",
      href: "/customer/loan-history",
      icon: History,
      gradient: "from-purple-500 to-pink-600",
      color: "purple"
    },
    {
      id: 'profile',
      title: "Profile",
      description: "Settings",
      href: "/customer/profile",
      icon: User,
      gradient: "from-amber-500 to-orange-600",
      color: "amber"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      title: "Loan Payment",
      date: "Mar 15, 2024",
      amount: formatCurrency(500000),
      icon: CheckCircle,
      color: "green",
    },
    {
      id: 2,
      title: "Application Submitted",
      date: "Mar 1, 2024",
      amount: formatCurrency(2000000),
      icon: FileText,
      color: "blue",
    },
    {
      id: 3,
      title: "Loan Approved",
      date: "Feb 28, 2024",
      amount: "Completed",
      icon: CheckCircle,
      color: "purple",
    }
  ];

  const handleCardClick = (id: string) => {
    setClickedCard(id);
    setTimeout(() => setClickedCard(null), 300);
  };

  const handleRingHover = (ringId: string) => {
    setHoveredRing(ringId);
  };

  const handleRingLeave = () => {
    setHoveredRing(null);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-5">
      {/* Welcome Section - Original tight layout */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Welcome back, {customer.name.split(' ')[0]}</h1>
            <p className="text-sm text-blue-100 mt-1">Your trusted financial partner</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-white/20 rounded-lg text-xs font-medium backdrop-blur">
              🎯 {customer.loanProgress}% of goal
            </span>
            <span className="px-3 py-1.5 bg-white/20 rounded-lg text-xs font-medium backdrop-blur">
              Since {customer.memberSince}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout - Original beautiful arrangement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Current Progress Card - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-start gap-4">
              {/* Main Ring */}
              <div 
                className="relative flex-shrink-0 cursor-pointer"
                onMouseEnter={() => handleRingHover('main')}
                onMouseLeave={handleRingLeave}
                onClick={() => handleCardClick('ring-main')}
              >
                {(hoveredRing === 'main' || clickedCard === 'ring-main' || isAnimating) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
                )}
                
                <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="44%"
                      stroke="#f1f5f9"
                      strokeWidth="8"
                      fill="none"
                      className="dark:stroke-gray-800"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="44%"
                      stroke="url(#mainGradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={mainCircumference}
                      strokeDashoffset={mainOffset}
                      strokeLinecap="round"
                      style={{
                        transition: isAnimating 
                          ? 'stroke-dashoffset 0.02s linear' 
                          : 'stroke-dashoffset 0.3s ease-out'
                      }}
                      className={`drop-shadow-sm ${
                        hoveredRing === 'main' || clickedCard === 'ring-main' ? 'stroke-[9]' : ''
                      }`}
                    />
                    <defs>
                      <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {isAnimating ? displayPercentage.toFixed(1) : Math.round(mainRingProgress)}%
                    </span>
                    <span className="text-[9px] text-gray-500 dark:text-gray-400 -mt-0.5">repaid</span>
                  </div>
                </div>
              </div>

              {/* Loan Details */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">{currentLoan.purpose}</h2>
                  <span className="px-2 py-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-[10px] font-medium">
                    {currentLoan.progress}% overdue
                  </span>
                </div>
                
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-3">
                  #{currentLoan.id} • {currentLoan.interestRate}% APR
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                    <p className="text-[8px] text-gray-500 dark:text-gray-400">Total</p>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{formatCurrency(currentLoan.total)}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                    <p className="text-[8px] text-gray-500 dark:text-gray-400">Paid</p>
                    <p className="text-xs font-bold text-green-600 dark:text-green-400">{formatCurrency(currentLoan.paid)}</p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2">
                    <p className="text-[8px] text-gray-500 dark:text-gray-400">Left</p>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400">{formatCurrency(currentLoan.remaining)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overdue Ring Card - Takes 1 column */}
        {currentLoan.isOverdue && (
          <div className="lg:col-span-1">
            <div 
              className="relative bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 rounded-2xl border border-red-200 dark:border-red-800 p-4 h-full flex items-center justify-center cursor-pointer"
              onMouseEnter={() => handleRingHover('overdue')}
              onMouseLeave={handleRingLeave}
              onClick={() => handleCardClick('ring-overdue')}
            >
              {(hoveredRing === 'overdue' || clickedCard === 'ring-overdue') && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur-md animate-pulse"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl blur-lg animate-ping opacity-75"></div>
                </>
              )}
              
              <div 
                className="relative w-36 h-36"
                style={{
                  transform: `scale(${overduePulseScale})`,
                  transition: 'transform 0.2s ease'
                }}
              >
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="44%"
                    stroke="#fee2e2"
                    strokeWidth="10"
                    fill="none"
                    className="dark:stroke-red-900/50"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="44%"
                    stroke="url(#overdueGradient)"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={overdueCircumference}
                    strokeDashoffset={overdueOffset}
                    strokeLinecap="round"
                    style={{
                      transform: hoveredRing === 'overdue' || clickedCard === 'ring-overdue' 
                        ? `rotate(${overdueRingRotation}deg)` 
                        : 'rotate(0deg)',
                      transformOrigin: 'center',
                    }}
                    className={hoveredRing === 'overdue' || clickedCard === 'ring-overdue' 
                      ? 'stroke-[11] drop-shadow-glow-red' 
                      : ''
                    }
                  />
                  <defs>
                    <linearGradient id="overdueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-0.5">
                    <AlertTriangle className={`w-4 h-4 text-red-500 transition-all duration-300 ${
                      hoveredRing === 'overdue' || clickedCard === 'ring-overdue' ? 'scale-110 rotate-12' : ''
                    }`} />
                    <span className="text-xl font-bold text-red-600 dark:text-red-400">15</span>
                  </div>
                  <span className="text-[8px] font-medium text-red-700 dark:text-red-300 -mt-1">days overdue</span>
                  <div className="mt-2 space-y-1">
                    <p className="text-[10px] font-bold text-gray-900 dark:text-white">{formatCurrency(currentLoan.remaining)}</p>
                    <p className="text-[7px] text-orange-600 dark:text-orange-400">+{formatCurrency(currentLoan.penalty)} penalty</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid - Original tight grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isHovered = hoveredCard === stat.id;
          
          return (
            <div
              key={stat.id}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              onMouseEnter={() => setHoveredCard(stat.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleCardClick(stat.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 bg-gradient-to-br ${stat.gradient} rounded-lg shadow-sm`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className={`text-[8px] font-medium px-1.5 py-0.5 bg-${stat.badgeColor}-50 dark:bg-${stat.badgeColor}-900/30 text-${stat.badgeColor}-700 dark:text-${stat.badgeColor}-300 rounded-full`}>
                  {stat.badge}
                </span>
              </div>
              <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-0.5">{stat.title}</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{stat.value}</p>
              {stat.progress ? (
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="flex-1 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
                      style={{ width: `${stat.progress}%` }}
                    />
                  </div>
                  <span className="text-[7px] text-gray-500 dark:text-gray-400">{stat.detail}</span>
                </div>
              ) : (
                <p className="text-[7px] text-gray-400 dark:text-gray-500 mt-2">{stat.detail}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions - Original layout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const isHovered = hoveredCard === action.id;
          
          return (
            <Link
              key={action.id}
              href={action.href}
              className="group"
              onMouseEnter={() => setHoveredCard(action.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleCardClick(action.id)}
            >
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`p-2 bg-gradient-to-br ${action.gradient} rounded-lg transition-all duration-200 ${
                    isHovered ? 'scale-110 rotate-3 shadow-md' : ''
                  }`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{action.title}</p>
                    <p className="text-[7px] text-gray-500 dark:text-gray-400 mt-0.5">{action.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity - Original */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {recentActivities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 bg-${activity.color}-100 dark:bg-${activity.color}-900/30 rounded-lg`}>
                    <Icon className={`w-3 h-3 text-${activity.color}-600 dark:text-${activity.color}-400`} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{activity.title}</p>
                    <p className="text-[8px] text-gray-500 dark:text-gray-400">{activity.date}</p>
                  </div>
                </div>
                <p className={`text-xs font-semibold ${
                  activity.color === 'green' ? 'text-green-600 dark:text-green-400' :
                  activity.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                  'text-purple-600 dark:text-purple-400'
                }`}>
                  {activity.amount}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .drop-shadow-glow-red {
          filter: drop-shadow(0 0 10px rgba(239,68,68,0.5));
        }
      `}</style>
    </div>
  );
}
