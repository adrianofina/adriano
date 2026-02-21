"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp,
  Brain,
  Target,
  Users,
  DollarSign,
  Calendar,
  Clock,
  ArrowRight,
  Download,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface RiskCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  creditScore: number;
  monthlyIncome: number;
  loanAmount: number;
  existingLoans: number;
  riskLevel: string;
  defaultProbability: number;
  recommendedAction: string;
}

export default function RiskAnalysisPage() {
  const [customers, setCustomers] = useState<RiskCustomer[]>([]);
  const [stats, setStats] = useState({
    low: 0, medium: 0, high: 0, critical: 0,
    avgDefault: 0, totalExposure: 0, predictedLoss: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/risk-analysis');
      const data = await res.json();
      setCustomers(data.customers || []);
      setStats(data.stats || {
        low: 0, medium: 0, high: 0, critical: 0,
        avgDefault: 0, totalExposure: 0, predictedLoss: 0
      });
    } catch (error) {
      console.error('Error:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('TZS', 'TSh');
  };

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.phone.includes(searchTerm) ||
                         c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = selectedRisk === 'all' || c.riskLevel === selectedRisk;
    return matchesSearch && matchesRisk;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Risk Analysis</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            AI-powered risk assessment based on real customer data
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link
            href="/admin/customers/overview"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            ← Back
          </Link>
        </div>
      </div>

      {/* Risk Overview Cards - REAL DATA */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Low Risk</p>
          <p className="text-2xl font-bold text-green-600">{stats.low}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Medium Risk</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">High Risk</p>
          <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Critical</p>
          <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
        </div>
      </div>

      {/* AI Prediction Card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-5 h-5 text-purple-600" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Risk Predictions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Average Default Probability</p>
            <p className="text-xl font-bold text-purple-600">{stats.avgDefault}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Exposure</p>
            <p className="text-base font-bold text-gray-900 dark:text-white break-all">{formatCurrency(stats.totalExposure)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Predicted Loss</p>
            <p className="text-base font-bold text-red-600 break-all">{formatCurrency(stats.predictedLoss)}</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedRisk('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            selectedRisk === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          All ({customers.length})
        </button>
        {['low', 'medium', 'high', 'critical'].map((level) => (
          <button
            key={level}
            onClick={() => setSelectedRisk(level)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              selectedRisk === level
                ? level === 'low' ? 'bg-green-600 text-white' :
                  level === 'medium' ? 'bg-yellow-600 text-white' :
                  level === 'high' ? 'bg-orange-600 text-white' :
                  'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {level} ({stats[level as keyof typeof stats]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg dark:bg-gray-800"
          />
        </div>
      </div>

      {/* Risk Cards - REAL DATA */}
      <div className="space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-800">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No customers found</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{customer.name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRiskColor(customer.riskLevel)}`}>
                      {customer.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{customer.email} • {customer.phone}</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Credit Score</p>
                      <p className={`text-sm font-semibold ${
                        customer.creditScore >= 700 ? 'text-green-600' :
                        customer.creditScore >= 600 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>{customer.creditScore}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Income</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{formatCurrency(customer.monthlyIncome)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Loan Amount</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{formatCurrency(customer.loanAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Default Prob.</p>
                      <p className="text-sm font-medium text-orange-600">{customer.defaultProbability}%</p>
                    </div>
                  </div>
                </div>
                <div className="flex sm:flex-col gap-2">
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-lg hover:bg-blue-100"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </Link>
                </div>
              </div>
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Action:</span> {customer.recommendedAction}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
