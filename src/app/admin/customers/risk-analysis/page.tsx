'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Brain,
  Target,
  Users,
  DollarSign,
  Calendar,
  Clock,
  ArrowRight,
  Download,
  Filter,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Award,
  Zap
} from 'lucide-react';

// Mock data - will be replaced with real data from your ML model
const riskCustomers = [
  {
    id: 'CUST-004',
    name: 'Robert Johnson',
    phone: '+255734567890',
    email: 'robert.j@example.com',
    creditScore: 590,
    monthlyIncome: 1800000,
    loanAmount: 4500000,
    existingLoans: 2,
    paymentHistory: [
      { month: 'Jan', status: 'paid' },
      { month: 'Feb', status: 'late' },
      { month: 'Mar', status: 'missed' }
    ],
    riskLevel: 'high',
    riskFactors: [
      'Low credit score (590)',
      'Multiple late payments',
      'High debt-to-income ratio (42%)',
      'Recent missed payment'
    ],
    defaultProbability: 78,
    recommendedAction: 'Immediate collection',
    predictedRecovery: 65
  },
  {
    id: 'CUST-002',
    name: 'John Doe',
    phone: '+255712345678',
    email: 'john.doe@example.com',
    creditScore: 680,
    monthlyIncome: 2500000,
    loanAmount: 5000000,
    existingLoans: 1,
    paymentHistory: [
      { month: 'Jan', status: 'paid' },
      { month: 'Feb', status: 'paid' },
      { month: 'Mar', status: 'paid' }
    ],
    riskLevel: 'medium',
    riskFactors: [
      'Moderate credit score (680)',
      'Stable income',
      'Good payment history'
    ],
    defaultProbability: 32,
    recommendedAction: 'Standard monitoring',
    predictedRecovery: 95
  },
  {
    id: 'CUST-001',
    name: 'Laurent Adriano',
    phone: '+255784461743',
    email: 'adriandevelopment@gmail.com',
    creditScore: 750,
    monthlyIncome: 3500000,
    loanAmount: 3420000,
    existingLoans: 1,
    paymentHistory: [
      { month: 'Jan', status: 'paid' },
      { month: 'Feb', status: 'paid' },
      { month: 'Mar', status: 'paid' }
    ],
    riskLevel: 'low',
    riskFactors: [
      'Excellent credit score (750)',
      'High income',
      'Consistent payments',
      'Long credit history'
    ],
    defaultProbability: 12,
    recommendedAction: 'Offer premium terms',
    predictedRecovery: 98
  },
  {
    id: 'CUST-010',
    name: 'Sarah Johnson',
    phone: '+255790123456',
    email: 'sarah.j@example.com',
    creditScore: 580,
    monthlyIncome: 1200000,
    loanAmount: 2800000,
    existingLoans: 1,
    paymentHistory: [
      { month: 'Jan', status: 'missed' },
      { month: 'Feb', status: 'missed' },
      { month: 'Mar', status: 'missed' }
    ],
    riskLevel: 'critical',
    riskFactors: [
      'Very low credit score (580)',
      'Low income',
      'Multiple defaults',
      'No contact since 30 days'
    ],
    defaultProbability: 95,
    recommendedAction: 'Legal action pending',
    predictedRecovery: 25
  }
];

export default function RiskAnalysisPage() {
  const [riskLevel, setRiskLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [customers] = useState(riskCustomers);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount).replace('TZS', 'TSh');
  };

  const getRiskLevelColor = (level: string) => {
    switch(level) {
      case 'low':
        return { 
          bg: 'bg-green-100 dark:bg-green-900/30', 
          text: 'text-green-700 dark:text-green-400',
          icon: CheckCircle,
          light: 'green'
        };
      case 'medium':
        return { 
          bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
          text: 'text-yellow-700 dark:text-yellow-400',
          icon: AlertCircle,
          light: 'yellow'
        };
      case 'high':
        return { 
          bg: 'bg-orange-100 dark:bg-orange-900/30', 
          text: 'text-orange-700 dark:text-orange-400',
          icon: AlertTriangle,
          light: 'orange'
        };
      case 'critical':
        return { 
          bg: 'bg-red-100 dark:bg-red-900/30', 
          text: 'text-red-700 dark:text-red-400',
          icon: XCircle,
          light: 'red'
        };
      default:
        return { 
          bg: 'bg-gray-100 dark:bg-gray-800', 
          text: 'text-gray-700 dark:text-gray-400',
          icon: Shield,
          light: 'gray'
        };
    }
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.phone.includes(searchTerm) ||
                         c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskLevel === 'all' || c.riskLevel === riskLevel;
    return matchesSearch && matchesRisk;
  });

  const riskStats = {
    low: customers.filter(c => c.riskLevel === 'low').length,
    medium: customers.filter(c => c.riskLevel === 'medium').length,
    high: customers.filter(c => c.riskLevel === 'high').length,
    critical: customers.filter(c => c.riskLevel === 'critical').length,
    avgDefault: Math.round(customers.reduce((sum, c) => sum + c.defaultProbability, 0) / customers.length),
    totalExposure: customers.reduce((sum, c) => sum + c.loanAmount, 0),
    predictedLoss: customers.reduce((sum, c) => sum + (c.loanAmount * c.defaultProbability / 100), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Risk Analysis</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            AI-powered risk assessment and default predictions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/customers/overview"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            ← Back to Overview
          </Link>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="w-8 h-8 text-green-100" />
            <span className="text-3xl font-bold">{riskStats.low}</span>
          </div>
          <p className="text-green-100 text-sm">Low Risk Customers</p>
          <p className="text-xs text-green-200 mt-2">Safe portfolio</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <AlertCircle className="w-8 h-8 text-yellow-100" />
            <span className="text-3xl font-bold">{riskStats.medium}</span>
          </div>
          <p className="text-yellow-100 text-sm">Medium Risk</p>
          <p className="text-xs text-yellow-200 mt-2">Monitor closely</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle className="w-8 h-8 text-orange-100" />
            <span className="text-3xl font-bold">{riskStats.high}</span>
          </div>
          <p className="text-orange-100 text-sm">High Risk</p>
          <p className="text-xs text-orange-200 mt-2">Intervention needed</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <XCircle className="w-8 h-8 text-red-100" />
            <span className="text-3xl font-bold">{riskStats.critical}</span>
          </div>
          <p className="text-red-100 text-sm">Critical Risk</p>
          <p className="text-xs text-red-200 mt-2">Immediate action</p>
        </div>
      </div>

      {/* Portfolio Risk Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Prediction Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Risk Prediction</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Machine learning analysis</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Average Default Probability</span>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{riskStats.avgDefault}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${riskStats.avgDefault}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Exposure</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(riskStats.totalExposure)}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <p className="text-xs text-red-600 dark:text-red-400 mb-1">Predicted Loss</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(riskStats.predictedLoss)}</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">AI Recommendation</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                    Focus on {riskStats.high + riskStats.critical} high-risk customers immediately. 
                    Estimated recovery rate: {Math.round((riskStats.totalExposure - riskStats.predictedLoss) / riskStats.totalExposure * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Risk Distribution</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Low Risk</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{riskStats.low}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${(riskStats.low / customers.length) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Medium Risk</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{riskStats.medium}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${(riskStats.medium / customers.length) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">High Risk</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{riskStats.high}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(riskStats.high / customers.length) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Critical Risk</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{riskStats.critical}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${(riskStats.critical / customers.length) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setRiskLevel('all')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            riskLevel === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          All Risks ({customers.length})
        </button>
        {['low', 'medium', 'high', 'critical'].map((level) => {
          const colors = getRiskLevelColor(level);
          const count = customers.filter(c => c.riskLevel === level).length;
          return (
            <button
              key={level}
              onClick={() => setRiskLevel(level)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                riskLevel === level
                  ? level === 'low' ? 'bg-green-600 text-white' :
                    level === 'medium' ? 'bg-yellow-600 text-white' :
                    level === 'high' ? 'bg-orange-600 text-white' :
                    'bg-red-600 text-white'
                  : `${colors.bg} ${colors.text} hover:opacity-80`
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Risk Analysis Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCustomers.map((customer) => {
          const risk = getRiskLevelColor(customer.riskLevel);
          const RiskIcon = risk.icon;
          
          return (
            <div key={customer.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-all">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {/* Left Section - Customer Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${risk.bg}`}>
                      <RiskIcon className={`w-6 h-6 ${risk.text}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{customer.name}</h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${risk.bg} ${risk.text}`}>
                          {customer.riskLevel.toUpperCase()} RISK
                        </span>
                        <span className="text-sm text-gray-500">#{customer.id}</span>
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Credit Score</p>
                          <p className={`text-lg font-bold ${
                            customer.creditScore >= 700 ? 'text-green-600' :
                            customer.creditScore >= 600 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {customer.creditScore}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Monthly Income</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(customer.monthlyIncome)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Loan Amount</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(customer.loanAmount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Existing Loans</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{customer.existingLoans}</p>
                        </div>
                      </div>

                      {/* Risk Factors */}
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Risk Factors:</p>
                        <div className="flex flex-wrap gap-2">
                          {customer.riskFactors.map((factor, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 rounded-full">
                              {factor}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Payment History Preview */}
                      <div className="flex items-center gap-2">
                        {customer.paymentHistory.map((payment, idx) => (
                          <div
                            key={idx}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                              payment.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              payment.status === 'late' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {payment.month.slice(0, 1)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section - Predictions */}
                <div className="lg:w-72 space-y-4">
                  {/* Default Probability */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Default Probability</span>
                      <span className={`text-lg font-bold ${
                        customer.defaultProbability >= 70 ? 'text-red-600' :
                        customer.defaultProbability >= 40 ? 'text-orange-600' :
                        'text-yellow-600'
                      }`}>
                        {customer.defaultProbability}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          customer.defaultProbability >= 70 ? 'bg-red-500' :
                          customer.defaultProbability >= 40 ? 'bg-orange-500' :
                          'bg-yellow-500'
                        }`}
                        style={{ width: `${customer.defaultProbability}%` }}
                      />
                    </div>
                  </div>

                  {/* Recovery Prediction */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Predicted Recovery</span>
                      <span className={`text-lg font-bold ${
                        customer.predictedRecovery >= 70 ? 'text-green-600' :
                        customer.predictedRecovery >= 40 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {customer.predictedRecovery}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          customer.predictedRecovery >= 70 ? 'bg-green-500' :
                          customer.predictedRecovery >= 40 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${customer.predictedRecovery}%` }}
                      />
                    </div>
                  </div>

                  {/* Recommended Action */}
                  <div className={`p-3 rounded-lg ${
                    customer.riskLevel === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
                    customer.riskLevel === 'high' ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' :
                    'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  }`}>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Recommended Action</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{customer.recommendedAction}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      View Profile
                    </Link>
                    <button className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      <Shield className="w-3 h-3" />
                      Actions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk Mitigation Tips */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Risk Mitigation Strategies
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h4 className="font-medium mb-2">For High Risk</h4>
            <ul className="text-sm text-blue-100 space-y-1">
              <li>• Require additional collateral</li>
              <li>• Shorter repayment terms</li>
              <li>• Weekly payment monitoring</li>
            </ul>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h4 className="font-medium mb-2">For Medium Risk</h4>
            <ul className="text-sm text-blue-100 space-y-1">
              <li>• Standard monitoring</li>
              <li>• Monthly check-ins</li>
              <li>• Auto-payment setup</li>
            </ul>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h4 className="font-medium mb-2">For Critical Risk</h4>
            <ul className="text-sm text-blue-100 space-y-1">
              <li>• Immediate collection action</li>
              <li>• Legal department review</li>
              <li>• Credit bureau reporting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
