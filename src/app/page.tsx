"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Shield,
  Zap,
  BarChart3,
  Users,
  CreditCard,
  Clock,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  FileText,
  Landmark
} from 'lucide-react';

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">Adrian CIMS</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
              Microfinance
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">Features</a>
            <a href="#why-us" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">Why Us</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition">
              Sign In
            </Link>
            <Link href="/signup" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/20 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900" />
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
              Microfinance Management
              <span className="block text-indigo-600 dark:text-indigo-400">for Modern Africa</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Streamline your microfinance operations with our comprehensive management system.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                Sign In
              </Link>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <p className="text-2xl font-black text-gray-900 dark:text-white">500+</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Active Clients</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-gray-900 dark:text-white">TSh 2.5B+</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Loans Disbursed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-gray-900 dark:text-white">98%</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Repayment Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-gray-900 dark:text-white">24/7</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Features</h2>
            <p className="text-gray-600 dark:text-gray-400">Complete microfinance management solution</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-5 h-5" />,
                title: 'Customer Management',
                description: 'Comprehensive customer profiles with document management'
              },
              {
                icon: <CreditCard className="w-5 h-5" />,
                title: 'Loan Origination',
                description: 'Streamlined application and approval workflow'
              },
              {
                icon: <BarChart3 className="w-5 h-5" />,
                title: 'Portfolio Analytics',
                description: 'Real-time tracking and performance metrics'
              },
              {
                icon: <Clock className="w-5 h-5" />,
                title: 'Automated Collections',
                description: 'Scheduled payments and overdue tracking'
              },
              {
                icon: <FileText className="w-5 h-5" />,
                title: 'Document Management',
                description: 'Secure document storage and verification'
              },
              {
                icon: <Shield className="w-5 h-5" />,
                title: 'Audit Trail',
                description: 'Complete logs for compliance'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-3">
                  <div className="text-indigo-600 dark:text-indigo-400">{feature.icon}</div>
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Why Adrian CIMS?</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Built for African microfinance institutions.
              </p>
              <div className="space-y-3">
                {[
                  'Designed for Tanzanian regulatory compliance',
                  'Mobile money integration (M-Pesa, Tigo Pesa, Airtel Money)',
                  'Cloud-based with secure data protection',
                  'Dedicated support team'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <Landmark className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-gray-900 dark:text-white">Trusted by MFIs</span>
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>✓ Streamlined operations for 500+ clients</p>
                <p>✓ Reduced loan processing time by 60%</p>
                <p>✓ Real-time portfolio tracking</p>
                <p>✓ Customer self-service portal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-16 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ready to get started?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Join institutions already using Adrian CIMS</p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-12 bg-gray-50 dark:bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">Adrian CIMS</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Modern microfinance management.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#features" className="hover:text-gray-900 dark:hover:text-white">Features</a></li>
                <li><a href="#why-us" className="hover:text-gray-900 dark:hover:text-white">Why Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +255 123 456 789</p>
                <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@adriancims.com</p>
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Dar es Salaam, Tanzania</p>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Adrian CIMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
