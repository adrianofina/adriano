"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

interface PageStats {
  totalCustomers: number;
  activeLoans: number;
  totalLoans: number;
}

export default function Page() {
  const [stats, setStats] = useState<PageStats>({
    totalCustomers: 0,
    activeLoans: 0,
    totalLoans: 0
  });

  useEffect(() => {
    // Fetch basic stats to show it's working
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        setStats({
          totalCustomers: data.totalCustomers || 0,
          activeLoans: data.activeLoans || 0,
          totalLoans: (data.activeLoans || 0) + (data.completedLoans || 0) + (data.overdueLoans || 0)
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
          <span className="text-5xl text-white">⚙️</span>
        </div>
      </div>
      
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {Settings}
      </h1>
      
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
        This page is under construction and will be available soon.
      </p>

      {/* Show that database is connected */}
      <div className="grid grid-cols-3 gap-6 mb-8 max-w-md mx-auto">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCustomers}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Customers</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeLoans}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Active Loans</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLoans}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Loans</p>
        </div>
      </div>
      
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
    </div>
  );
}
