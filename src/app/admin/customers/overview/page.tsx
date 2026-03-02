"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, DollarSign, Calendar, AlertCircle } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  loanId: string;
  amount: number;
  progress: number;
  left: number;
  paymentStatus: 'On Time' | 'Late' | 'Overdue';
  nextPayment: number | null;
  dueDate: string | null;
}

interface Stats {
  totalCustomers: number;
  totalOutstanding: number;
  averagePerCustomer: number;
  latePayments: number;
  activeLoans: number;
}

export default function CustomersOverviewPage() {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'Seiko Adriano',
      loanId: 'LOAN-2026-0003',
      amount: 570000,
      progress: 0,
      left: 570000,
      paymentStatus: 'On Time',
      nextPayment: 570000,
      dueDate: null
    },
    {
      id: '2',
      name: 'Sarafina Adriano',
      loanId: 'LOAN-2026-0001',
      amount: 500000,
      progress: 0,
      left: 500000,
      paymentStatus: 'On Time',
      nextPayment: 500000,
      dueDate: null
    },
    {
      id: '3',
      name: 'Laurent Adriano',
      loanId: 'LOAN-2026-0005',
      amount: 350000,
      progress: 0,
      left: 350000,
      paymentStatus: 'On Time',
      nextPayment: 350000,
      dueDate: null
    }
  ]);

  // Calculate real stats from customer data
  const stats: Stats = {
    totalCustomers: customers.length,
    totalOutstanding: customers.reduce((sum, c) => sum + c.left, 0),
    averagePerCustomer: customers.length > 0 
      ? Math.round(customers.reduce((sum, c) => sum + c.left, 0) / customers.length) 
      : 0,
    latePayments: customers.filter(c => c.paymentStatus === 'Late' || c.paymentStatus === 'Overdue').length,
    activeLoans: customers.length
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('TZS', 'TSh');
  };

  const StatCard = ({ title, value, icon: Icon, trend }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className="text-xs text-green-600 mt-1">{trend}</p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Active Customers</h1>
            <div className="flex gap-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Export
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                + New Customer
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid - Responsive and always inside cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total Customers" 
            value={stats.totalCustomers}
            icon={Users}
            trend="+2 this month"
          />
          <StatCard 
            title="Total Outstanding" 
            value={formatCurrency(stats.totalOutstanding)}
            icon={DollarSign}
          />
          <StatCard 
            title="Average per Customer" 
            value={formatCurrency(stats.averagePerCustomer)}
            icon={Calendar}
          />
          <StatCard 
            title="Late Payments" 
            value={stats.latePayments}
            icon={AlertCircle}
            trend={stats.latePayments === 0 ? "All payments on time" : "Needs attention"}
          />
        </div>

        {/* Summary Banner - Alternative design for large screens */}
        <div className="lg:hidden mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Portfolio</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalOutstanding)}</p>
              </div>
              <div className="h-10 w-px bg-blue-200"></div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Active Loans</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeLoans}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {stats.latePayments} Late
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Avg {formatCurrency(stats.averagePerCustomer)}
              </span>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Active Loans</h2>
              <div className="flex gap-2">
                <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5">
                  <option>All Status</option>
                  <option>On Time</option>
                  <option>Late</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Search customers..." 
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 w-64"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {customer.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{customer.loanId}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(customer.amount)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-24">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">0%</span>
                          <span className="text-gray-400">Left: {formatCurrency(customer.left)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${customer.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        {customer.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {customer.nextPayment ? formatCurrency(customer.nextPayment) : '-'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Due: {customer.dueDate || 'N/A'}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{customers.length}</span> of <span className="font-medium">{customers.length}</span> results
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
