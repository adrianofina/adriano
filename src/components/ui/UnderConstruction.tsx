'use client';

import Link from 'next/link';
import { Construction, ArrowLeft, Home } from 'lucide-react';

interface UnderConstructionProps {
  pageName: string;
}

export function UnderConstruction({ pageName }: UnderConstructionProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
          <Construction className="w-16 h-16 text-white animate-bounce" />
        </div>
      </div>
      
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {pageName}
      </h1>
      
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
        We're working hard to bring you something amazing. This page is currently under construction and will be available soon.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
        >
          <Home className="w-4 h-4" />
          Go Home
        </Link>
      </div>

      {/* Progress indicator */}
      <div className="mt-12 w-64">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span>75%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse" style={{ width: '75%' }}></div>
        </div>
      </div>
    </div>
  );
}
