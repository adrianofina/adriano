"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  History,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  Home,
  CreditCard,
  Clock
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  description: string;
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: NavItem[] = [
    { href: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & stats' },
   // { href: '/customer/apply-loan', label: 'Apply Loan', icon: FileText, description: 'New loan application' },
    { href: '/customer/loans', label: 'Loans', icon: History, description: 'New, Past and active loans' },
    { href: '/customer/profile', label: 'Profile', icon: User, description: 'Personal information' },
  ];

  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'C';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar - EXACT MATCH TO ADMIN STYLE */}
      <aside className={`
        fixed top-0 left-0 bottom-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
        transition-all duration-300 ease-in-out z-50
        ${sidebarCollapsed ? 'w-16' : 'w-60'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className={`
            flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800
            ${sidebarCollapsed ? 'justify-center' : ''}
          `}>
            {sidebarCollapsed ? (
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">Adrian CIMS</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Customer Portal</p>
                </div>
              </div>
            )}

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

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* User Role Badge */}
          {!sidebarCollapsed && (
            <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Portal:</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                  Customer
                </span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {!sidebarCollapsed && (
              <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                MAIN MENU
              </div>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              if (sidebarCollapsed) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group relative"
                    title={item.label}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`} />
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-lg transition-all
                    ${isActive 
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Profile Section - EXACT MATCH TO ADMIN */}
          <div className={`
            border-t border-gray-200 dark:border-gray-800 p-4
            ${sidebarCollapsed ? 'text-center' : ''}
          `}>
            {sidebarCollapsed ? (
              <div className="relative group">
                <button
                  onClick={logout}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  Logout
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-indigo-50/30 dark:from-gray-800 dark:to-indigo-900/20 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user?.name || 'Customer User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email || 'customer@adriancims.com'}
                  </p>
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
        ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-60'}
      `}>
        {/* Header - Clean with only essential elements */}
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
                {navItems.find(i => i.href === pathname)?.label || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}




