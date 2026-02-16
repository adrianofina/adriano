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
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

// Navigation item type
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['customers']);
  const { logout } = useAuth();
  
  const { userRole, getRoleBadgeColor } = usePermissions();

  const [pendingApprovals] = useState(3);
  const [readyToDisburse] = useState(2);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

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
      title: 'Customers',
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
      title: 'Loans',
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
          label: 'Approvals',
          icon: Clock,
          description: 'Need review',
          roles: ['super_admin', 'admin'],
          badge: pendingApprovals,
          badgeColor: 'yellow',
          highlight: pendingApprovals > 0
        },
        {
          href: '/admin/disbursements',
          label: 'Disburse',
          icon: DollarSign,
          description: 'Ready to release',
          roles: ['super_admin'],
          badge: readyToDisburse,
          badgeColor: 'green',
          highlight: readyToDisburse > 0
        },
      ]
    },
    {
      id: 'reports',
      title: 'Reports',
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
          label: 'Audit',
          icon: Archive,
          description: 'Activity logs',
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

  const filteredSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item => item.roles.includes(userRole as any))
  })).filter(section => section.items.length > 0);

  const NotificationCenter = () => (
    <div className="relative group">
      <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>
      
      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 hidden group-hover:block z-50">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">3 new</span>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Loan #L-342 fully paid</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute requireStaff allowedRoles={['super_admin', 'admin', 'loan_officer', 'customer_service', 'viewer']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Mobile Menu Overlay */}
        <div 
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${
            mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Sidebar */}
        <aside className={`
          fixed top-0 left-0 bottom-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          transition-all duration-300 ease-in-out z-50
          ${sidebarCollapsed ? 'w-20' : 'w-72'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex flex-col h-full">
            {/* Logo Area */}
            <div className={`
              flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800
              ${sidebarCollapsed ? 'justify-center' : ''}
            `}>
              {sidebarCollapsed ? (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white">Adrian CIMS</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Microfinance</p>
                  </div>
                </div>
              )}
              
              {/* Collapse button - desktop only */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:block p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4 text-gray-500" />
                ) : (
                  <PanelLeftClose className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {/* Close button - mobile only */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* User Role Badge */}
            {!sidebarCollapsed && (
              <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Role:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(userRole)}`}>
                    {userRole?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
              {filteredSections.map((section) => (
                <div key={section.id} className="space-y-1">
                  {/* Section Header */}
                  {!sidebarCollapsed && (
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        {section.icon && <section.icon className="w-4 h-4" />}
                        <span>{section.title}</span>
                      </div>
                      {expandedSections.includes(section.id) ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </button>
                  )}

                  {/* Section Items */}
                  {(!sidebarCollapsed && expandedSections.includes(section.id)) && (
                    <div className="pl-2 space-y-0.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`
                              flex items-center justify-between px-3 py-2 rounded-lg transition-all
                              ${isActive 
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                              }
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                              <span className="text-sm font-medium">{item.label}</span>
                            </div>
                            {item.badge && (
                              <span className={`
                                px-1.5 py-0.5 text-xs rounded-full
                                ${item.highlight 
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 animate-pulse' 
                                  : `bg-${item.badgeColor || 'blue'}-100 dark:bg-${item.badgeColor || 'blue'}-900/30 text-${item.badgeColor || 'blue'}-700 dark:text-${item.badgeColor || 'blue'}-300`
                                }
                              `}>
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Collapsed view - only icons */}
                  {sidebarCollapsed && (
                    <Link
                      href={section.items[0]?.href || '#'}
                      className="flex items-center justify-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group relative"
                      title={section.title}
                    >
                      {section.icon && <section.icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />}
                      {/* Tooltip */}
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                        {section.title}
                      </div>
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* User Profile */}
            <div className={`
              border-t border-gray-200 dark:border-gray-800 p-4
              ${sidebarCollapsed ? 'text-center' : ''}
            `}>
              {sidebarCollapsed ? (
                <button
                  onClick={logout}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative group"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
                    Logout
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-sm">AD</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Admin User</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">admin@adriancims.com</p>
                  </div>
                  <button onClick={logout} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                    <LogOut className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`
          transition-all duration-300
          ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}
        `}>
          {/* Header */}
          <header className={`sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-all duration-300 ${
            scrolled ? 'shadow-sm' : ''
          }`}>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {filteredSections.flatMap(s => s.items).find(i => i.href === pathname)?.label || 'Dashboard'}
                </h2>
              </div>
              
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <NotificationCenter />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
