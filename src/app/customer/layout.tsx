'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  History,
  User,
  Bell,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/customer/dashboard',   label: 'Dashboard',      icon: LayoutDashboard },
    { href: '/customer/apply-loan',  label: 'Apply for Loan', icon: FileText },
    { href: '/customer/loan-history',label: 'Loan History',   icon: History },
    { href: '/customer/profile',     label: 'Profile',        icon: User },
  ];

  // User initials helper — same logic as before
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'C';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">

        {/* ══════════════════════════════════════════════════════════════
            DESKTOP HEADER
            ═══════════════════════════════════════════════════════════ */}
        <header className="hidden lg:block sticky top-0 z-40">
          {/* Glass backing */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.82) 0%, rgba(238,242,255,0.80) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(99,102,241,0.10)',
              boxShadow: '0 1px 0 rgba(99,102,241,0.06), 0 4px 24px rgba(99,102,241,0.04)',
            }}
          />
          {/* Dark mode glass backing */}
          <div
            className="absolute inset-0 dark:block hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(15,16,20,0.90) 0%, rgba(20,18,30,0.88) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(99,102,241,0.12)',
            }}
          />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">

              {/* Brand */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    boxShadow: '0 2px 10px rgba(99,102,241,0.35)',
                  }}
                >
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">Adrian CIMS</span>
                  <span
                    className="ml-2 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.10), rgba(168,85,247,0.10))',
                      color: '#6366f1',
                      border: '1px solid rgba(99,102,241,0.15)',
                    }}
                  >
                    Customer
                  </span>
                </div>
              </div>

              {/* Nav links */}
              <nav className="flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                      style={isActive ? {
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 100%)',
                        color: '#6366f1',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
                        border: '1px solid rgba(99,102,241,0.15)',
                      } : {
                        color: undefined,
                        border: '1px solid transparent',
                      }}
                    >
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-indigo-500'
                            : 'text-gray-400 dark:text-gray-500 group-hover:text-indigo-400'
                        }`}
                      />
                      <span className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}>
                        {item.label}
                      </span>
                      {/* Active dot indicator */}
                      {isActive && (
                        <span
                          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                          style={{ background: '#6366f1' }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Right controls */}
              <div className="flex items-center gap-2">
                <ThemeToggle />

                {/* Bell */}
                <button
                  className="relative p-2 rounded-xl transition-all"
                  style={{ border: '1px solid transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
                >
                  <Bell className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>

                {/* Avatar chip */}
                <div
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.06))',
                    border: '1px solid rgba(99,102,241,0.12)',
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-[11px]"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                  >
                    {initials}
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 max-w-[80px] truncate">
                    {user?.name?.split(' ')[0] || 'Customer'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/*             MOBILE HEADER
           ══════════════════════════════════════ */}
        <div className="lg:hidden sticky top-0 z-40">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(238,242,255,0.85) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(99,102,241,0.10)',
            }}
          />
          <div
            className="absolute inset-0 dark:block hidden"
            style={{
              background: 'rgba(13,14,18,0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(99,102,241,0.12)',
            }}
          />

          <div className="relative flex items-center justify-between h-14 px-4">
            {/* Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl transition-all"
              style={{
                background: 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.10)',
              }}
            >
              <Menu className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            </button>

            {/* Brand centre */}
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}
              >
                <span className="text-white font-bold text-xs">A</span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">Adrian CIMS</span>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button className="p-2 rounded-xl">
                <Bell className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE BOTTOM TAB BAR — feels like a native app
        ══════════════════════════════════════════════════════ */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,248,255,0.96) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(99,102,241,0.10)',
            }}
          />
          <div
            className="absolute inset-0 dark:block hidden"
            style={{
              background: 'rgba(13,14,18,0.94)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(99,102,241,0.12)',
            }}
          />
          <nav className="relative flex items-center justify-around px-2 py-2 pb-safe">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px]"
                  style={isActive ? {
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.08))',
                  } : {}}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-indigo-500' : 'text-gray-400 dark:text-gray-500'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-medium transition-colors ${
                      isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {item.label.split(' ')[0]}
                  </span>
                  {isActive && (
                    <span
                      className="absolute top-1.5 w-1 h-1 rounded-full"
                      style={{ background: '#6366f1' }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* MOBILE SLIDE-IN MENU (hamburger — profile + settings)
        ══════════════════════════════════════════════════════════ */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0"
              style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <div
              className="fixed top-0 left-0 bottom-0 w-72 flex flex-col"
              style={{
                background: 'linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(240,242,255,0.98) 100%)',
                boxShadow: '4px 0 40px rgba(99,102,241,0.12)',
              }}
            >
              {/* Dark mode drawer */}
              <div
                className="absolute inset-0 dark:block hidden rounded-none"
                style={{
                  background: 'linear-gradient(160deg, rgba(17,17,26,0.98) 0%, rgba(20,18,32,0.99) 100%)',
                }}
              />

              <div className="relative flex flex-col h-full">

                {/* Drawer header — user profile hero */}
                <div
                  className="px-6 pt-8 pb-6"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.05) 100%)',
                    borderBottom: '1px solid rgba(99,102,241,0.08)',
                  }}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                      }}
                    >
                      {initials}
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1.5 rounded-lg"
                      style={{
                        background: 'rgba(99,102,241,0.06)',
                        border: '1px solid rgba(99,102,241,0.10)',
                      }}
                    >
                      <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                      {user?.name || 'Customer'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                      {user?.email || ''}
                    </p>
                    <span
                      className="inline-block mt-2 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.10))',
                        color: '#6366f1',
                        border: '1px solid rgba(99,102,241,0.15)',
                      }}
                    >
                      Customer Portal
                    </span>
                  </div>
                </div>

                {/* Nav items */}
                <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 px-3 mb-3">
                    Navigation
                  </p>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150"
                        style={isActive ? {
                          background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 100%)',
                          border: '1px solid rgba(99,102,241,0.14)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
                        } : {
                          border: '1px solid transparent',
                        }}
                      >
                        {/* Icon bubble */}
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={isActive ? {
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.20), rgba(168,85,247,0.15))',
                          } : {
                            background: 'rgba(0,0,0,0.04)',
                          }}
                        >
                          <Icon
                            className={`w-4 h-4 ${isActive ? 'text-indigo-500' : 'text-gray-400 dark:text-gray-500'}`}
                          />
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            isActive
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {item.label}
                        </span>
                        {isActive && (
                          <div
                            className="ml-auto w-1.5 h-1.5 rounded-full"
                            style={{ background: '#6366f1' }}
                          />
                        )}
                      </Link>
                    );
                  })}
                </nav>

                {/* Bottom — logout */}
                <div
                  className="px-4 py-5"
                  style={{ borderTop: '1px solid rgba(99,102,241,0.08)' }}
                >
                  <button
                    onClick={() => { setMobileMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                    style={{
                      background: 'rgba(239,68,68,0.05)',
                      border: '1px solid rgba(239,68,68,0.10)',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(239,68,68,0.08)' }}
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                    </div>
                    <span className="text-sm font-medium text-red-500">Sign Out</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/*  MAIN CONTENT
          */}
        <main className="py-6 lg:py-8 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

      </div>
    </ProtectedRoute>
  );
}