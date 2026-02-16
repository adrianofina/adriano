'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Upload,
  CheckCircle2,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  AlertTriangle,
  FileText,
  BarChart3,
  UserCog,
  Archive,
  Bell,
  DollarSign,
  Home,
  FileCheck,
  UserPlus,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

// Define the navigation item type with optional properties
interface NavItem {
  href: string;
  label: string;
  icon: any;
  description: string;
  roles: string[];
  badge?: number | string;
  badgeColor?: string;
  highlight?: boolean;
}

interface NavSection {
  id: string;
  title: string;
  icon?: any;
  items: NavItem[];
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState(5);
  const [expandedSections, setExpandedSections] = useState<string[]>(['customers']);
  const { logout } = useAuth();
  
  // Get permissions for current user
  const { 
    userRole, 
    getRoleBadgeColor 
  } = usePermissions();

  // Demo stats
  const [pendingApprovals] = useState(3);
  const [readyToDisburse] = useState(2);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle section expansion on mobile
  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Role-based navigation with sections - properly typed with optional properties
  const navSections: NavSection[] = [
    {
      id: 'main',
      title: 'Main',
      items: [
        {
          href: '/admin/dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          description: 'Overview & stats',
          roles: ['super_admin', 'admin', 'loan_officer', 'customer_service', 'viewer']
        },
      ]
    },
    {
      id: 'customers',
      title: 'Customer Management',
      icon: Users,
      items: [
        {
          href: '/admin/customers/overview',
          label: 'Overview',
          icon: LayoutDashboard,
          description: 'Customer dashboard',
          roles: ['super_admin', 'admin', 'loan_officer', 'customer_service', 'viewer'],
          badge: 1247
        },
        {
          href: '/admin/customers/active',
          label: 'Active',
          icon: CheckCircle2,
          description: 'With active loans',
          roles: ['super_admin', 'admin', 'loan_officer', 'customer_service', 'viewer'],
          badge: 342,
          badgeColor: 'green'
        },
        {
          href: '/admin/customers/overdue',
          label: 'Overdue',
          icon: AlertTriangle,
          description: 'Past due payments',
          roles: ['super_admin', 'admin', 'loan_officer', 'customer_service', 'viewer'],
          badge: 23,
          badgeColor: 'red',
          highlight: true
        },
        {
          href: '/admin/customers/completed',
          label: 'Completed',
          icon: CheckCircle2,
          description: 'Fully paid loans',
          roles: ['super_admin', 'admin', 'loan_officer', 'customer_service', 'viewer'],
          badge: 156,
          badgeColor: 'purple'
        },
        {
          href: '/admin/customers/risk-analysis',
          label: 'Risk Analysis',
          icon: Shield,
          description: 'Credit risk assessment',
          roles: ['super_admin', 'admin'],
          badge: 8,
          badgeColor: 'red',
          highlight: true
        },
        {
          href: '/admin/uploads',
          label: 'Manual Upload',
          icon: Upload,
          description: 'Register customers',
          roles: ['super_admin', 'admin', 'loan_officer', 'customer_service'],
        },
      ]
    },
    {
      id: 'loans',
      title: 'Loan Management',
      icon: CreditCard,
      items: [
        {
          href: '/admin/loans',
          label: 'All Loans',
          icon: CreditCard,
          description: 'All applications',
          roles: ['super_admin', 'admin', 'loan_officer', 'viewer'],
          badge: 342
        },
        {
          href: '/admin/approvals',
          label: 'Pending Approvals',
          icon: Clock,
          description: 'Need your review',
          roles: ['super_admin', 'admin'],
          badge: pendingApprovals,
          badgeColor: 'yellow',
          highlight: pendingApprovals > 0
        },
        {
          href: '/admin/disbursements',
          label: 'Ready to Disburse',
          icon: DollarSign,
          description: 'Awaiting release',
          roles: ['super_admin'],
          badge: readyToDisburse,
          badgeColor: 'green',
          highlight: readyToDisburse > 0
        },
      ]
    },
    {
      id: 'reports',
      title: 'Reports & Audit',
      icon: BarChart3,
      items: [
        {
          href: '/admin/reports',
          label: 'Reports',
          icon: BarChart3,
          description: 'Analytics',
          roles: ['super_admin', 'admin']
        },
        {
          href: '/admin/audit',
          label: 'Audit Logs',
          icon: Archive,
          description: 'System activities',
          roles: ['super_admin'],
        },
        {
          href: '/admin/settings',
          label: 'Settings',
          icon: Settings,
          description: 'Configuration',
          roles: ['super_admin', 'admin']
        },
      ]
    }
  ];

  // Filter sections by role
  const filteredSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item => item.roles.includes(userRole as any))
  })).filter(section => section.items.length > 0);

  const NotificationCenter = () => (
    <div className="relative group">
      <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        {notifications > 0 && (
          <>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </>
        )}
      </button>
      
      <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 hidden group-hover:block z-50">
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Notifications</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">{notifications} new</span>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          <div className="p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-b border-emerald-100 dark:border-emerald-900/30">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">Loan #L-342 fully paid</p>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">Customer: Laurent Adriano</p>
                <div className="flex items-center justify-between mt-1 sm:mt-2">
                  <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500">2 min ago</span>
                  <span className="px-1.5 sm:px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-[9px] sm:text-[10px] font-medium">
                    TSh 120k
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const BranchSelector = () => {
    if (userRole !== 'super_admin') return null;
    
    return (
      <select className="hidden sm:block px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white">
        <option>Mwanza Branch</option>
        <option>Dar es Salaam</option>
        <option>Arusha</option>
      </select>
    );
  };

  return (
    <ProtectedRoute requireStaff allowedRoles={['super_admin', 'admin', 'loan_officer', 'customer_service', 'viewer']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Mobile Menu Overlay */}
        <div 
          className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Mobile Sidebar */}
        <div className={`fixed top-0 left-0 bottom-0 w-72 sm:w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-base sm:text-lg">A</span>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Adrian CIMS</h2>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Microfinance</p>
                </div>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="px-4 sm:px-5 py-2 sm:py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Logged in as:</span>
                <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-medium ${getRoleBadgeColor(userRole)}`}>
                  {userRole?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            <nav className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto">
              {filteredSections.map((section) => (
                <div key={section.id} className="space-y-1 sm:space-y-2">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex items-center justify-between w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {section.icon && <section.icon className="w-4 h-4" />}
                      <span>{section.title}</span>
                    </div>
                    {expandedSections.includes(section.id) ? (
                      <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </button>
                  
                  {expandedSections.includes(section.id) && (
                    <div className="pl-2 sm:pl-3 space-y-0.5 sm:space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all ${
                              isActive 
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                              <div>
                                <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                                <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-500 hidden sm:block">{item.description}</p>
                              </div>
                            </div>
                            {item.badge && (
                              <span className={`px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-xs rounded-full ${
                                item.highlight 
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 animate-pulse' 
                                  : `bg-${item.badgeColor || 'blue'}-100 dark:bg-${item.badgeColor || 'blue'}-900/30 text-${item.badgeColor || 'blue'}-700 dark:text-${item.badgeColor || 'blue'}-300`
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20 rounded-xl">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm sm:text-base">AD</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">Admin User</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">admin@adriancims.com</p>
                  </div>
                </div>
                <button onClick={logout} className="p-1.5 sm:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex">
          <aside className="w-80 fixed inset-y-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">A</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Adrian CIMS
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Microfinance Management</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Your Role</p>
                    <p className={`text-sm font-semibold mt-0.5 ${userRole === 'super_admin' ? 'text-purple-700 dark:text-purple-400' : 'text-blue-700 dark:text-blue-400'}`}>
                      {userRole?.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Branch</p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5">Mwanza</p>
                  </div>
                </div>
              </div>

              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {filteredSections.map((section) => (
                  <div key={section.id} className="mb-4">
                    <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {section.title}
                    </h3>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                            isActive 
                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isActive ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                            }`}>
                              <Icon className={`w-4 h-4 ${
                                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                              }`} />
                            </div>
                            <div>
                              <span className="font-medium text-sm">{item.label}</span>
                              <p className="text-[10px] text-gray-500 dark:text-gray-500">{item.description}</p>
                            </div>
                          </div>
                          {item.badge && (
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              item.highlight 
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 animate-pulse' 
                                : `bg-${item.badgeColor || 'blue'}-100 dark:bg-${item.badgeColor || 'blue'}-900/30 text-${item.badgeColor || 'blue'}-700 dark:text-${item.badgeColor || 'blue'}-300`
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>

              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-lg">AD</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Admin User</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">admin@adriancims.com</p>
                    </div>
                  </div>
                  <button onClick={logout} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <LogOut className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <main className="ml-80 flex-1">
            <header className={`sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md transition-all duration-300 ${
              scrolled ? 'shadow-sm border-b border-gray-200 dark:border-gray-800' : ''
            }`}>
              <div className="flex items-center justify-between px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {filteredSections.flatMap(s => s.items).find(i => i.href === pathname)?.label || 'Dashboard'}
                </h2>
                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  <NotificationCenter />
                  <BranchSelector />
                </div>
              </div>
            </header>
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Main Content */}
        <div className="lg:hidden">
          <header className={`sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md transition-all duration-300 ${
            scrolled ? 'shadow-sm border-b border-gray-200 dark:border-gray-800' : ''
          }`}>
            <div className="flex items-center justify-between px-4 py-3">
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white text-sm">Adrian CIMS</span>
              </div>
              
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <NotificationCenter />
              </div>
            </div>
            
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-800 overflow-x-auto">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                <Home className="w-3 h-3" />
                <span>/</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {filteredSections.flatMap(s => s.items).find(i => i.href === pathname)?.label || 'Dashboard'}
                </span>
              </div>
            </div>
          </header>

          <div className="p-3 sm:p-4">
            {children}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
