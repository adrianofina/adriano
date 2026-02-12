"use client";

import { useState } from "react";
import { Search, Filter, Download, CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react";

export default function LoanHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loans = [
    { 
      id: "L-001", 
      amount: 5000000, 
      paid: 5000000, 
      status: "paid", 
      appliedDate: "2024-01-15", 
      approvedDate: "2024-01-17",
      dueDate: "2024-04-15",
      purpose: "Business Expansion",
      remaining: 0,
      overdue: false
    },
    { 
      id: "L-002", 
      amount: 3420000, 
      paid: 3380000, 
      status: "overdue", 
      appliedDate: "2024-02-10", 
      approvedDate: "2024-02-12",
      dueDate: "2024-03-12",
      purpose: "Education",
      remaining: 120000,
      overdue: true,
      penalty: 80000
    },
    { 
      id: "L-003", 
      amount: 2000000, 
      paid: 500000, 
      status: "in-progress", 
      appliedDate: "2024-03-01", 
      approvedDate: "2024-03-03",
      dueDate: "2024-06-03",
      purpose: "Personal Use",
      remaining: 1500000,
      overdue: false
    },
    { 
      id: "L-004", 
      amount: 1500000, 
      paid: 1500000, 
      status: "paid", 
      appliedDate: "2023-11-20", 
      approvedDate: "2023-11-22",
      dueDate: "2024-02-20",
      purpose: "Medical",
      remaining: 0,
      overdue: false
    },
    { 
      id: "L-005", 
      amount: 3500000, 
      paid: 3500000, 
      status: "pending", 
      appliedDate: "2024-03-14", 
      approvedDate: null,
      dueDate: null,
      purpose: "Agriculture",
      remaining: 3500000,
      overdue: false
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "paid":
        return { color: "bg-green-100 text-green-800", icon: CheckCircle, text: "Paid" };
      case "pending":
        return { color: "bg-yellow-100 text-yellow-800", icon: Clock, text: "Pending" };
      case "overdue":
        return { color: "bg-red-100 text-red-800", icon: AlertTriangle, text: "Overdue" };
      case "in-progress":
        return { color: "bg-blue-100 text-blue-800", icon: Clock, text: "In Progress" };
      default:
        return { color: "bg-gray-100 text-gray-800", icon: XCircle, text: status };
    }
  };

  const filteredLoans = loans.filter(loan => {
    // Search filter
    const matchesSearch = 
      loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === "all" || loan.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Loan History</h1>
        <p className="text-gray-600 mt-2">View and track all your loan applications and payments.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600">Total Loans</p>
          <p className="text-3xl font-bold mt-1">5</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600">Total Borrowed</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(15420000)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600">Total Repaid</p>
          <p className="text-3xl font-bold mt-1 text-green-600">{formatCurrency(10380000)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600">Outstanding</p>
          <p className="text-3xl font-bold mt-1 text-red-600">{formatCurrency(5120000)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by loan ID or purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="overdue">Overdue</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Loan ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Paid</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Remaining</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Applied Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Due Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLoans.map((loan) => {
                const status = getStatusBadge(loan.status);
                const StatusIcon = status.icon;
                
                return (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{loan.id}</td>
                    <td className="px-6 py-4">{formatCurrency(loan.amount)}</td>
                    <td className="px-6 py-4">{formatCurrency(loan.paid)}</td>
                    <td className="px-6 py-4 font-semibold">
                      {loan.remaining > 0 ? (
                        <span className={loan.overdue ? 'text-red-600' : 'text-gray-900'}>
                          {formatCurrency(loan.remaining)}
                          {loan.penalty > 0 && (
                            <span className="block text-xs text-red-500">
                              +{formatCurrency(loan.penalty)} penalty
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-green-600">Fully Paid</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{loan.appliedDate}</td>
                    <td className="px-6 py-4 text-gray-600">{loan.dueDate || '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{loan.purpose}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredLoans.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No loans found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
