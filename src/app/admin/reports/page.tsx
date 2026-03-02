"use client";

import { useState } from 'react';
import DeletedCustomersOverview from '@/components/reports/DeletedCustomersOverview';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('audit');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Reports & Analytics</h1>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 mb-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'audit' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Audit Log
          </button>
          <button
            onClick={() => setActiveTab('deleted')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'deleted' 
                ? 'border-red-600 text-red-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Deleted Records
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'financial' 
                ? 'border-green-600 text-green-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Financial
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'loans' 
                ? 'border-purple-600 text-purple-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Loan Performance
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Audit Log</h2>
          <p className="text-gray-600">Full audit trail coming soon...</p>
        </div>
      )}

      {activeTab === 'deleted' && <DeletedCustomersOverview />}

      {activeTab === 'financial' && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Financial Reports</h2>
          <p className="text-gray-600">Financial reports coming soon...</p>
        </div>
      )}

      {activeTab === 'loans' && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Loan Performance</h2>
          <p className="text-gray-600">Loan analytics coming soon...</p>
        </div>
      )}
    </div>
  );
}
