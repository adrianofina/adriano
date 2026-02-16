'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Download,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  UserPlus,
  FileText,
  TrendingUp
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

export default function CustomersPage() {
  const { userRole, canDeleteCustomer } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - In production, this would come from your API
  const customers = [
    {
      id: 'CUST-001',
      firstName: 'Laurent',
      surname: 'Adriano',
      email: 'adriandevelopment@gmail.com',
      phone: '+255784461743',
      address: 'Business Street, Mwanza',
      creditScore: 750,
      category: 'Premium',
      totalLoans: 3,
      activeLoans: 1,
      overdueLoans: 1,
      totalBorrowed: 15000000,
      totalRepaid: 13800000,
      registrationMethod: 'app',
      createdAt: '2024-01-15',
      status: 'active'
    },
    {
      id: 'CUST-002',
      firstName: 'John',
      surname: 'Doe',
      email: 'john.doe@example.com',
      phone: '+255712345678',
      address: 'Main Street, Dar es Salaam',
      creditScore: 680,
      category: 'Standard',
      totalLoans: 1,
      activeLoans: 1,
      overdueLoans: 0,
      totalBorrowed: 5000000,
      totalRepaid: 1000000,
      registrationMethod: 'manual_upload',
      createdAt: '2024-02-20',
      status: 'active'
    },
    {
      id: 'CUST-003',
      firstName: 'Jane',
      surname: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+255723456789',
      address: 'Market Road, Arusha',
      creditScore: 720,
      category: 'Premium',
      totalLoans: 2,
      activeLoans: 0,
      overdueLoans: 0,
      totalBorrowed: 8000000,
      totalRepaid: 8000000,
      registrationMethod: 'app',
      createdAt: '2023-11-10',
      status: 'active'
    },
    {
      id: 'CUST-004',
      firstName: 'Robert',
      surname: 'Johnson',
      email: 'robert.j@example.com',
      phone: '+255734567890',
      address: 'Industrial Area, Mwanza',
      creditScore: 590,
      category: 'Risky',
      totalLoans: 2,
      activeLoans: 1,
      overdueLoans: 1,
      totalBorrowed: 4500000,
      totalRepaid: 2000000,
      registrationMethod: 'manual_upload',
      createdAt: '2024-01-05',
      status: 'active'
    },
    {
      id: 'CUST-005',
      firstName: 'Sarah',
      surname: 'Williams',
      email: 'sarah.w@example.com',
      phone: '+255745678901',
      address: 'Beach Road, Dar es Salaam',
      creditScore: 710,
      category: 'Standard',
      totalLoans: 1,
      activeLoans: 0,
      overdueLoans: 0,
      totalBorrowed: 3000000,
      totalRepaid: 3000000,
      registrationMethod: 'app',
      createdAt: '2023-12-12',
      status: 'active'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount).replace('TZS', 'TSh');
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Premium': return 'bg-purple-100 text-purple-800';
      case 'Standard': return 'bg-blue-100 text-blue-800';
      case 'Risky': return 'bg-red-100 text-red-800';
      case 'Manual': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRegistrationBadge = (method: string) => {
    return method === 'app' 
      ? 'bg-green-100 text-green-800'
      : 'bg-blue-100 text-blue-800';
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage all customer accounts and information
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            href="/admin/uploads"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Manual Upload
          </Link>
          <Link
            href="/admin/customers/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
              Total
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">1,247</p>
          <p className="text-sm text-gray-600 mt-1">Registered customers</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-full">
              Active
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">342</p>
          <p className="text-sm text-gray-600 mt-1">With active loans</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-purple-50 text-purple-700 rounded-full">
              Premium
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">124</p>
          <p className="text-sm text-gray-600 mt-1">Top tier customers</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full">
              Manual
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">86</p>
          <p className="text-sm text-gray-600 mt-1">Manually registered</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Customers</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="overdue">Has Overdue</option>
            </select>
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loans
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {customer.firstName[0]}{customer.surname[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {customer.firstName} {customer.surname}
                        </p>
                        <p className="text-xs text-gray-500">{customer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="w-3.5 h-3.5" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="w-3.5 h-3.5" />
                        {customer.phone}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-3.5 h-3.5" />
                        {customer.address.split(',')[0]}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${
                        customer.creditScore >= 700 ? 'text-green-600' :
                        customer.creditScore >= 600 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {customer.creditScore}
                      </span>
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            customer.creditScore >= 700 ? 'bg-green-500' :
                            customer.creditScore >= 600 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${(customer.creditScore / 850) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(customer.category)}`}>
                      {customer.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">
                        {customer.activeLoans} active
                      </p>
                      <p className="text-xs text-gray-500">
                        Total: {formatCurrency(customer.totalBorrowed)}
                      </p>
                      {customer.overdueLoans > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600">
                          <AlertTriangle className="w-3 h-3" />
                          {customer.overdueLoans} overdue
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRegistrationBadge(customer.registrationMethod)}`}>
                        {customer.registrationMethod === 'app' ? 'App' : 'Manual'}
                      </span>
                      <p className="text-xs text-gray-500">
                        Since {customer.createdAt}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        View
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
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
              Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of{' '}
              <span className="font-medium">124</span> customers
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100">
                Previous
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100">
                2
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100">
                3
              </button>
              <span className="text-gray-500">...</span>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100">
                12
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
