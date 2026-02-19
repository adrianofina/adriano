'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Shield, 
  Users, 
  BarChart3,
  Menu,
  X,
  Moon,
  Sun,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Github
} from 'lucide-react';
import { useTheme } from 'next-themes';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans overflow-hidden">
      
      {/* Gradient Background Mesh */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-3xl" />
      </div>

      {/* Glass Navigation */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 py-3 shadow-sm' 
          : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">AC</span>
            </div>
            <span className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">
              Adrian CIMS
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            <a href="#features" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">Features</a>
            <a href="#workflow" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">Workflow</a>
            <a href="#security" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">Security</a>
            <a href="#contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">Contact</a>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Desktop Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hidden sm:flex w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4 text-gray-700" />
              )}
            </button>

            {/* Login Button */}
            <Link 
              href="/login" 
              className="hidden md:inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-sm font-medium hover:opacity-90 transition shadow"
            >
              Login
            </Link>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown - WITH THEME TOGGLE */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 px-6 py-6 space-y-4 shadow-xl">
            {/* Mobile Theme Toggle - Now visible! */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
            
            <a href="#features" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition py-2">Features</a>
            <a href="#workflow" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition py-2">Workflow</a>
            <a href="#security" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition py-2">Security</a>
            <a href="#contact" className="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition py-2">Contact</a>
            
            <Link 
              href="/login" 
              className="block w-full text-center mt-4 px-5 py-3 rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-sm font-medium transition hover:opacity-90"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        )}
      </div>

      {/* HERO - Enhanced */}
      <section className="pt-36 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column */}
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium mx-auto lg:mx-0">
              <Shield className="w-4 h-4" />
              Trusted by 50+ Microfinance Institutions
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900 dark:text-white leading-tight">
              Intelligent Credit
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Management System
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl leading-relaxed mx-auto lg:mx-0">
              A complete digital platform for managing customers, loans, approvals,
              and risk analysis — designed specifically for modern microfinance
              institutions in Tanzania.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-sm font-medium hover:scale-[1.02] transition shadow-lg w-full sm:w-auto justify-center"
              >
                Sign In
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="#features"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition w-full sm:w-auto justify-center"
              >
                Learn More
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 pt-4">
              <span className="flex items-center gap-1">✓ Role-based access</span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 hidden sm:block"></span>
              <span className="flex items-center gap-1">✓ Secure audit logs</span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 hidden sm:block"></span>
              <span className="flex items-center gap-1">✓ Real-time insights</span>
            </div>
          </div>

          {/* Right Visual Panel - Enhanced */}
          <div className="relative">
            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl p-8 sm:p-10">
              <div className="grid grid-cols-2 gap-6 sm:gap-8 text-center">
                <div className="space-y-2">
                  <div className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">10k+</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Customers Managed</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">99.9%</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Data Integrity</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">2-Step</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Loan Approval</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">AI</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Risk Predictions</div>
                </div>
              </div>

              {/* Decorative element */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full opacity-20 blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-12 sm:mb-16 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
              Everything needed to run a modern microfinance institution
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              Designed for operational efficiency, regulatory compliance, and scalable growth.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Users,
                title: 'Customer Lifecycle Management',
                desc: 'Centralized profiles, document verification, and complete borrower history tracking.'
              },
              {
                icon: BarChart3,
                title: 'Loan & Portfolio Analytics',
                desc: 'Monitor loan performance, payment trends, and default risk distribution in real time.'
              },
              {
                icon: Shield,
                title: 'Audit & Compliance Ready',
                desc: 'Every action is logged for full transparency and regulatory compliance.'
              }
            ].map((f, i) => (
              <div key={i} className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition hover:-translate-y-1">
                <f.icon className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section id="workflow" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-6">
            Structured loan lifecycle — from application to repayment
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-12 sm:mb-16">
            Transparent, auditable, and optimized for faster financial decisions.
          </p>

          <div className="grid sm:grid-cols-3 gap-8 sm:gap-10">
            {[
              { step: '01', title: 'Customer Registration' },
              { step: '02', title: 'Two-Stage Approval' },
              { step: '03', title: 'Repayment Tracking' }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-4xl sm:text-5xl font-bold text-gray-200 dark:text-gray-800 mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                {i < 2 && (
                  <div className="hidden sm:block absolute top-6 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 transform -translate-x-8"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY CTA */}
      <section id="security" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
            Secure. Transparent. Built for financial institutions.
          </h2>
          <p className="text-gray-300 mb-8 text-sm sm:text-base">
            Adrian CIMS enforces role-based access, secure audit trails, and controlled approvals 
            to protect institutional and customer data at every stage.
          </p>

          <Link
            href="/login"
            className="inline-flex items-center gap-3 px-6 py-3 bg-white text-gray-900 rounded-xl text-sm font-medium hover:scale-[1.02] transition shadow-lg"
          >
            Sign In to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* CONTACT & FOOTER */}
      <footer id="contact" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12">
            
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">AC</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">Adrian CIMS</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Intelligent credit management for Tanzanian microfinance institutions.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a href="#" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                  <Facebook className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                  <Twitter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                  <Linkedin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                  <Github className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Features</a></li>
                <li><a href="#workflow" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Workflow</a></li>
                <li><a href="#security" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Security</a></li>
                <li><Link href="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">Sign In</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Business Street, Mwanza<br />Tanzania
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">+255 784 461 743</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">info@adriancims.co.tz</span>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Stay Updated</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Subscribe to our newsletter for updates and insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Adrian Microfinance CIMS. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
