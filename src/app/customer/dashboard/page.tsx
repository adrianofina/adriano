"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  CreditCard, 
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
  Calendar,
  Menu,
  X,
  Home,
  LogOut,
  RefreshCw,
  Clock
} from "lucide-react";

export default function CustomerDashboard() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [hoveredRing, setHoveredRing] = useState<string | null>(null);
  const [clickedCard, setClickedCard] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mainRingProgress, setMainRingProgress] = useState(98.8);
  const [isAnimating, setIsAnimating] = useState(false);
  const [overdueRingRotation, setOverdueRingRotation] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Main ring animation - SLOWER, MORE DRAMATIC, ALWAYS SHOWS GAP
  useEffect(() => {
    if (hoveredRing === 'main' || clickedCard === 'ring-main') {
      setIsAnimating(true);
      setAnimationKey(prev => prev + 1); // Force re-animation
      
      // Start from 0%
      setMainRingProgress(0);
      
      // Animate to 98.8% over 2.5 seconds - SLOWER, MORE VISIBLE
      const timer = setTimeout(() => {
        setMainRingProgress(98.8);
      }, 100);
      
      // Reset animation flag after completion
      const resetTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 2600);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(resetTimer);
      };
    } else {
      // When not hovering, show 98.8% (but NEVER 100% - gap is visible)
      setMainRingProgress(98.8);
      setIsAnimating(false);
    }
  }, [hoveredRing, clickedCard, animationKey]);

  // Overdue ring rotation - only on hover/click
  useEffect(() => {
    if (hoveredRing === 'overdue' || clickedCard === 'ring-overdue') {
      const interval = setInterval(() => {
        setOverdueRingRotation(prev => (prev + 2) % 360);
      }, 50);
      return () => clearInterval(interval);
    } else {
      setOverdueRingRotation(0);
    }
  }, [hoveredRing, clickedCard]);

  const customer = {
    name: "Laurent Adriano",
    initials: "LA",
    memberSince: "Jan 2024",
    nextPayment: "Apr 15",
    loanProgress: 68
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
    purpose: "Current Progress",
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

  // Main loan ring - 98.8% progress (NEVER fully filled - gap is visible)
  const mainSize = 140;
  const mainStroke = 10;
  const mainRadius = (mainSize - mainStroke) / 2;
  const mainCircumference = mainRadius * 2 * Math.PI;
  // This ensures the ring NEVER shows 100% - there's ALWAYS a visible gap
  const mainOffset = mainCircumference - (mainRingProgress / 100) * mainCircumference;

  // Overdue ring - 100% filled (complete circle)
  const overdueSize = 200;
  const overdueStroke = 12;
  const overdueRadius = (overdueSize - overdueStroke) / 2;
  const overdueCircumference = overdueRadius * 2 * Math.PI;
  // 100% filled = stroke-dashoffset = 0
  const overdueOffset = 0; // COMPLETE CIRCLE

  const stats = [
    { 
      id: 'active',
      title: "Active Loan", 
      value: formatCurrency(currentLoan.total), 
      badge: "In Progress",
      badgeColor: "blue",
      icon: RefreshCw,
      gradient: "from-blue-400 to-indigo-500",
      progress: currentLoan.paidPercentage,
      detail: `${currentLoan.paidPercentage}% repaid`
    },
    { 
      id: 'borrowed',
      title: "Total Borrowed", 
      value: formatCurrency(15000000), 
      badge: "Lifetime",
      badgeColor: "purple",
      icon: DollarSign,
      gradient: "from-purple-400 to-pink-500",
      detail: "3 loans"
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
      detail: "TSh 13.8M"
    },
    { 
      id: 'next',
      title: "Next Payment", 
      value: formatCurrency(currentLoan.remaining), 
      badge: currentLoan.dueDate,
      badgeColor: "amber",
      icon: Calendar,
      gradient: "from-amber-400 to-orange-500",
      detail: `Due ${currentLoan.dueDate}`
    }
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

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/customer/dashboard", active: true },
    { icon: FileText, label: "Apply", href: "/customer/apply-loan" },
    { icon: History, label: "History", href: "/customer/loan-history" },
    { icon: User, label: "Profile", href: "/customer/profile" },
    { icon: Settings, label: "Settings", href: "/customer/settings" }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
      {/* Mobile Hamburger Menu */}
      <div 
        className={`fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />
      
      <div className={`fixed top-0 left-0 bottom-0 w-72 bg-white/90 backdrop-blur-xl shadow-2xl z-50 transform transition-transform duration-500 ease-out lg:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-base">A</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900 text-sm">Adrian CIMS</span>
                <p className="text-[10px] text-gray-500">Microfinance</p>
              </div>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    item.active 
                      ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className={`w-4 h-4 ${item.active ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="font-medium text-xs">{item.label}</span>
                  {item.active && (
                    <span className="ml-auto w-1 h-1 bg-blue-600 rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">{customer.initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{customer.name}</p>
                <p className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                  <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                  Premium
                </p>
              </div>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <LogOut className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - TIGHT LAYOUT */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5">
        {/* Desktop Header - Compact */}
        <div className={`hidden lg:flex sticky top-0 z-40 bg-white/80 backdrop-blur-md -mx-6 px-6 py-3 mb-4 transition-all duration-300 border-b border-gray-100/80 ${
          scrolled ? 'shadow-sm' : ''
        }`}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-semibold text-gray-900 text-sm">Adrian CIMS</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-medium text-gray-700">Active</span>
              </div>
              
              <button className="relative p-1.5 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <Bell className="w-3.5 h-3.5 text-gray-600" />
                <span className="absolute top-1 right-1 w-1 h-1 bg-red-500 rounded-full ring-1 ring-white"></span>
              </button>
              
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[10px] font-medium text-gray-700">Next: {customer.nextPayment}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Header - Only Hamburger */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <Menu className="w-4 h-4 text-gray-700" />
          </button>
          
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <span className="font-semibold text-gray-900 text-xs">Adrian CIMS</span>
          </div>
          
          <button className="p-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <Bell className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Welcome - Compact */}
        <div className="mb-5">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Hello, {customer.name.split(' ')[0]}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-medium">
                  🎯 {customer.loanProgress}% of goal
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-[10px] font-medium">
                  Since {customer.memberSince}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout - Current Progress + Overdue Ring */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
          {/* Current Progress Card - Takes 2 columns on desktop */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100/80 p-4 h-full hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                {/* Main Ring - SLOW, VISIBLE animation, NEVER fully filled */}
                <div 
                  className="relative flex-shrink-0 cursor-pointer"
                  onMouseEnter={() => handleRingHover('main')}
                  onMouseLeave={handleRingLeave}
                  onClick={() => handleCardClick('ring-main')}
                >
                  {/* Glow effect on hover/click */}
                  {(hoveredRing === 'main' || clickedCard === 'ring-main' || isAnimating) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
                  )}
                  
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                    {/* Background Circle - Light gray */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="42%"
                        stroke="#f1f5f9"
                        strokeWidth="8"
                        fill="none"
                      />
                      {/* Progress Circle - NEVER fully filled, gap is VISIBLE */}
                      <circle
                        cx="50%"
                        cy="50%"
                        r="42%"
                        stroke="url(#mainGradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={mainCircumference}
                        strokeDashoffset={mainOffset}
                        strokeLinecap="round"
                        style={{
                          transition: hoveredRing === 'main' || clickedCard === 'ring-main' || isAnimating
                            ? 'stroke-dashoffset 2500ms cubic-bezier(0.2, 0.8, 0.4, 1)' 
                            : 'stroke-dashoffset 300ms ease-out'
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
                    
                    {/* Center Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {Math.round(mainRingProgress)}%
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-gray-500 -mt-0.5">repaid</span>
                      {/* Small indicator showing the gap */}
                      <span className="text-[7px] text-gray-400 mt-0.5">{currentLoan.remainingPercentage}% left</span>
                    </div>
                  </div>
                </div>

                {/* Loan Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">
                      {currentLoan.purpose}
                    </h2>
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-lg text-[9px] sm:text-[10px] font-medium">
                      {currentLoan.progress}% overdue
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 mb-3 flex items-center gap-2">
                    <span>#{currentLoan.id}</span>
                    <span className="w-0.5 h-0.5 bg-gray-300 rounded-full"></span>
                    <span>{currentLoan.interestRate}% APR</span>
                  </p>

                  {/* Two columns - Total and Paid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-2.5 border border-gray-100">
                      <p className="text-[9px] text-gray-500 mb-0.5">Total</p>
                      <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(currentLoan.total)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-white rounded-lg p-2.5 border border-green-100">
                      <p className="text-[9px] text-gray-500 mb-0.5">Paid</p>
                      <p className="text-sm font-bold text-green-600">
                        {formatCurrency(currentLoan.paid)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overdue Ring Card - 100% FILLED, ALL CONTENT INSIDE */}
          {currentLoan.isOverdue && (
            <div className="lg:col-span-1">
              <div 
                className="relative bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-sm border border-red-100 p-3 h-full flex items-center justify-center hover:shadow-md transition-all cursor-pointer"
                onMouseEnter={() => handleRingHover('overdue')}
                onMouseLeave={handleRingLeave}
                onClick={() => handleCardClick('ring-overdue')}
              >
                {/* Danger pulse effect - stronger red when hovered */}
                {(hoveredRing === 'overdue' || clickedCard === 'ring-overdue') && (
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl blur-md animate-pulse"></div>
                )}
                
                {/* Overdue Ring - 100% FILLED (complete circle) */}
                <div className="relative w-44 h-44 sm:w-48 sm:h-48">
                  {/* Background Circle - Light red */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="44%"
                      stroke="#fee2e2"
                      strokeWidth="10"
                      fill="none"
                    />
                    {/* Progress Circle - 100% filled (stroke-dashoffset = 0) */}
                    <circle
                      cx="50%"
                      cy="50%"
                      r="44%"
                      stroke="url(#overdueGradient)"
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={overdueCircumference}
                      strokeDashoffset={overdueOffset} // 0 = COMPLETE CIRCLE
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
                  
                  {/* ALL DETAILS INSIDE THE RING - COMPACT, NO PROTRUSION */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
                    {/* Days Overdue - Large */}
                    <div className="flex items-center justify-center gap-0.5 mb-0.5">
                      <AlertTriangle className={`w-5 h-5 text-red-500 transition-all duration-300 ${
                        hoveredRing === 'overdue' || clickedCard === 'ring-overdue' ? 'scale-110 rotate-12' : ''
                      }`} />
                      <span className="text-3xl sm:text-4xl font-bold text-red-600">15</span>
                    </div>
                    <span className="text-[10px] font-semibold text-red-700 mb-2">days overdue</span>
                    
                    {/* Amount Due - Inside ring */}
                    <div className="bg-white/90 backdrop-blur rounded-lg px-2 py-1 mb-1.5 border border-red-200 w-full max-w-[120px] mx-auto">
                      <p className="text-[8px] text-gray-600">Due</p>
                      <p className="text-xs font-bold text-gray-900 truncate">{formatCurrency(currentLoan.remaining)}</p>
                    </div>
                    
                    {/* Penalty - Inside ring */}
                    <div className="bg-orange-50/90 backdrop-blur rounded px-2 py-0.5 mb-2 w-full max-w-[100px] mx-auto">
                      <p className="text-[7px] text-gray-600">Penalty</p>
                      <p className="text-[10px] font-bold text-orange-600 truncate">{formatCurrency(currentLoan.penalty)}</p>
                    </div>
                    
                    {/* Pay Now Button - Slightly below ring */}
                    <Link
                      href="/customer/pay-overdue"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-medium rounded-lg hover:from-red-600 hover:to-orange-600 transition-all hover:scale-105 shadow-sm mt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Pay Now
                      <ArrowRight className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid - 4 columns, compact */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const isHovered = hoveredCard === stat.id;
            
            return (
              <div
                key={stat.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                onMouseEnter={() => setHoveredCard(stat.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 bg-gradient-to-br ${stat.gradient} rounded-lg shadow-sm`}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className={`text-[8px] font-medium px-1.5 py-0.5 bg-${stat.badgeColor}-50 text-${stat.badgeColor}-700 rounded-full`}>
                    {stat.badge}
                  </span>
                </div>
                <p className="text-[9px] text-gray-500 mb-0.5">{stat.title}</p>
                <p className="text-sm font-bold text-gray-900">
                  {stat.value}
                </p>
                {stat.progress ? (
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
                        style={{ width: `${stat.progress}%` }}
                      />
                    </div>
                    <span className="text-[8px] text-gray-500">{stat.detail}</span>
                  </div>
                ) : (
                  <p className="text-[8px] text-gray-400 mt-2">{stat.detail}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Actions - Compact */}
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
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className={`p-2 bg-gradient-to-br ${action.gradient} rounded-lg transition-all duration-200 ${
                      isHovered ? 'scale-110 rotate-3 shadow-md' : ''
                    }`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">{action.title}</p>
                      <p className="text-[8px] text-gray-500 mt-0.5">{action.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer - Compact */}
        <div className="mt-6 text-center">
          <p className="text-[9px] text-gray-400">
            Need help? <span className="text-blue-600 font-medium">support@adriancims.com</span>
          </p>
        </div>
      </div>

      <style jsx>{`
        .drop-shadow-glow-red {
          filter: drop-shadow(0 0 8px rgba(239,68,68,0.5));
        }
      `}</style>
    </div>
  );
}
