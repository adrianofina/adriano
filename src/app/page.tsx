import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Shield,
  Menu,
  X
} from 'lucide-react';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans">
      {/* Floating Navigation - Appears on scroll */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 py-4' 
          : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          {/* Logo - Simple and clean */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 rounded-lg flex items-center justify-center">
              <span className="text-white dark:text-gray-900 font-semibold text-sm">A</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Adrian CIMS</span>
          </Link>

          {/* Desktop Navigation - Minimal */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#approach" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Approach</a>
            <a href="#work" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Work</a>
            <a href="#contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Contact</a>
          </div>

          {/* Sign In - Minimal dot */}
          <Link 
            href="/login" 
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Sign in"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-white"></div>
          </Link>

          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 py-4 px-6">
            <div className="flex flex-col space-y-4">
              <a href="#approach" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Approach</a>
              <a href="#work" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Work</a>
              <a href="#contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Contact</a>
            </div>
          </div>
        )}
      </div>

      {/* Hero - Simple, intentional */}
      <div className="pt-32 pb-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Content */}
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-light text-gray-900 dark:text-white leading-tight">
                Financial tools
                <br />
                <span className="font-medium">for the intentional.</span>
              </h1>
              
              <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
                We're building a different kind of financial system. 
                One that moves at your pace, on your terms.
              </p>

              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-3 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  <span>Get started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right - Simple visual */}
            <div className="relative h-96 lg:h-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-3xl"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-light text-gray-900 dark:text-white">0%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">hidden fees</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approach - Intentional spacing */}
      <section id="approach" className="py-24 px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-16">
            <div>
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500 tracking-wider">01</span>
              <h2 className="text-2xl font-medium text-gray-900 dark:text-white mt-4 mb-6">Clear terms</h2>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                No hidden clauses. No fine print. Just straightforward agreements you can actually understand.
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500 tracking-wider">02</span>
              <h2 className="text-2xl font-medium text-gray-900 dark:text-white mt-4 mb-6">Fair rates</h2>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                Rates that make sense for where you are right now, not where a formula thinks you should be.
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500 tracking-wider">03</span>
              <h2 className="text-2xl font-medium text-gray-900 dark:text-white mt-4 mb-6">Human support</h2>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                When you need help, you'll talk to a person who actually understands your situation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Work - Simple showcase */}
      <section id="work" className="py-24 px-6 lg:px-8 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 tracking-wider">How it works</span>
            <h2 className="text-3xl font-light text-gray-900 dark:text-white mt-4">
              Three steps,{' '}
              <span className="font-medium">no surprises.</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                number: '01',
                title: 'Apply',
                description: 'Share some basic information about yourself and what you need.'
              },
              {
                number: '02',
                title: 'Review',
                description: 'We will take a look and get back to you within hours, not weeks.'
              },
              {
                number: '03',
                title: 'Grow',
                description: 'Get the funds you need and build toward your next goal.'
              }
            ].map((item, i) => (
              <div key={i} className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <span className="text-sm text-gray-400 dark:text-gray-600">{item.number}</span>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mt-4 mb-3">{item.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-24 px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-light text-gray-900 dark:text-white mb-6">
            Ready to work with us?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            No pressure. No obligations. Just a conversation about what you need.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-3 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            <span>Start the conversation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Minimal footer */}
      <footer id="contact" className="py-12 px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 Adrian CIMS
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Twitter</a>
            <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">LinkedIn</a>
            <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
