"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  ArrowRight, 
  Shield, 
  Users, 
  CreditCard, 
  TrendingUp,
  Menu,
  X
} from "lucide-react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Subtle background gradient - like the internal pages */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 -z-10" />
      
      {/* Navigation - Clean and professional like internal pages */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 py-3' 
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo - matches internal branding */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">
              Adrian Microfinance
            </span>
          </Link>

          {/* Desktop Navigation - Clean, spaced right */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">Services</a>
            <a href="#approach" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">Approach</a>
            <a href="#branches" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">Branches</a>
          </div>

          {/* Sign In Button - Matches internal CTA style */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition"
            >
              Sign in
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-6 space-y-4">
            <a href="#services" className="block text-gray-600 dark:text-gray-400 py-2">Services</a>
            <a href="#approach" className="block text-gray-600 dark:text-gray-400 py-2">Approach</a>
            <a href="#branches" className="block text-gray-600 dark:text-gray-400 py-2">Branches</a>
            <Link href="/login" className="block w-full text-center mt-4 px-4 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-lg font-medium">
              Sign in
            </Link>
          </div>
        )}
      </div>

      {/* Hero Section - Tight, balanced like internal pages */}
      <section className="pt-36 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Column */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium">
                <Shield className="w-4 h-4" />
                Trusted since 2015
              </div>

              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white leading-tight">
                Financial services
                <br />
                <span className="text-blue-600 dark:text-blue-400">with a human touch</span>
              </h1>

              <p className="text-base text-gray-600 dark:text-gray-400 max-w-xl leading-relaxed">
                Adrian Microfinance provides accessible, transparent financing 
                to individuals and small businesses across Tanzania. 
                No complexity. Just clarity.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition w-full sm:w-auto justify-center"
                >
                  Access portal
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#services"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:border-gray-400 dark:hover:border-gray-600 transition w-full sm:w-auto justify-center"
                >
                  Our services
                </a>
              </div>

              {/* Stats - Clean like internal dashboard */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200 dark:border-gray-800">
                <div>
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">5,000+</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Clients served</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">8</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Branches</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">12%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg. rate</div>
                </div>
              </div>
            </div>

            {/* Right Column - Cards that match internal UI */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-4" />
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Personal loans</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">For individuals</p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition">
                  <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400 mb-4" />
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Business financing</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">For entrepreneurs</p>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-4" />
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Group lending</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">For communities</p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition">
                  <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-4" />
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Savings groups</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">For growth</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Clean, tight grid like customers page */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Our services</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Simple, transparent financial solutions designed for real needs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: 'Personal loans',
                description: 'For education, health, or home improvements.',
                amount: 'Up to 5M TZS'
              },
              {
                title: 'Business financing',
                description: 'Working capital, equipment, or expansion.',
                amount: 'Up to 20M TZS'
              },
              {
                title: 'Group lending',
                description: 'For community groups and VICOBA.',
                amount: 'Flexible terms'
              }
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{item.description}</p>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">{item.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approach Section - Matches internal page styling */}
      <section id="approach" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Our approach</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                We believe financial services should be straightforward. 
                No hidden fees. No confusing terms. Just clear, fair agreements 
                that help our clients move forward.
              </p>
              <div className="space-y-3">
                {[
                  'Face-to-face relationships',
                  'Transparent terms',
                  'Fast decisions'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 border border-gray-200 dark:border-gray-800">
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-4">"Banking should feel human again."</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">— Adrian, Founder</p>
            </div>
          </div>
        </div>
      </section>

      {/* Branches Section */}
      <section id="branches" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Our branches</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Growing with you across Tanzania.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {['Mwanza', 'Dar es Salaam', 'Arusha', 'Mbeya'].map((city, i) => (
              <div key={i} className="bg-white dark:bg-gray-950 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                <p className="font-medium text-gray-900 dark:text-white">{city}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Branch</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Ready to work with us?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 max-w-md mx-auto">
            No pressure. Just a conversation about what you need.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition"
          >
            Access portal
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer - Clean, minimal */}
      <footer className="py-10 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Adrian Microfinance
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400">
            <span>Mwanza · Dar · Arusha · Mbeya</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
