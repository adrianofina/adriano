'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';

interface MobileFilterProps {
  children: React.ReactNode;
  title?: string;
}

export function MobileFilter({ children, title = 'Filters' }: MobileFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="sm:hidden p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
      >
        <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl z-50 p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {children}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg"
            >
              Apply Filters
            </button>
          </div>
        </>
      )}
    </>
  );
}
