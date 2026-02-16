'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  AlertTriangle, 
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
  PieChart
} from 'lucide-react';

export default function RiskAnalysisPage() {
  const [riskLevel, setRiskLevel] = useState('all');

  // Mock data - Risk analysis
  const riskCustomers = [
    {
      id: 'CUST-004',
      name: 'Robert Johnson',
      phone: '+255734567890',
      email: 'robert.j@example.com',
      creditScore: 590,
      riskLevel: 'high',
      riskFactors: [
        'Multiple late payments',
        'High debt-to-income ratio',
        'Recent missed payment'
      ],
      activeLoans: 2,
      totalDebt: 4500000,
      overdueAmount: 2500000,
      paymentHistory: 'Poor',
      daysOverdue: 15,
      predictedDefault: '78%',
      recommendedAction: 'Immediate collection'
    },
    {
      id: 'CUST-002',
      name: 'John Doe',
      phone: '+255712345678',
      email: 'john.doe@example.com',
      creditScore: 680,
      riskLevel: 'medium',
      riskFactors: [
        'Moderate credit score',
        'One late payment',
        'Stable income'
      ],
      activeLoans: 1,
      totalDebt: 5000000,
      overdueAmount: 0,
      paymentHistory: 'Fair',
      daysOverdue: 0,
      predictedDefault: '32%',
      recommendedAction: 'Monitor closely'
    },
    {
      id: 'CUST-007',
      name: 'Peter Mwangi',
      phone: '+255767890123',
      email: 'peter.m@example.com',
      creditScore: 590,
      riskLevel: 'high',
      riskFactors: [
        'Low credit score',
        'Multiple active loans',
        'Irregular income'
      ],
      activeLoans: 2,
      totalDebt: 8000000,
      overdueAmount: 0,
      paymentHistory: 'Fair',
      daysOverdue: 0,
      predictedDefault: '65%',
      recommendedAction: 'Reduce exposure'
    },
    {
      id: 'CUST-001',
      name: 'Laurent Adriano',
      phone: '+255784461743',
      email: 'adriandevelopment@gmail.com',
      creditScore: 750,
      riskLevel: 'low',
      riskFactors: [
        'Excellent credit score',
        'Consistent payments',
        'Long credit history'
      ],
      activeLoans: 1,
      totalDebt: 3420000,
      overdueAmount: 120000,
      paymentHistory: 'Excellent',
      daysOverdue: 0,
      predictedDefault: '12%',
      recommendedAction: 'Offer premium terms'
    },
    {
      id: 'CUST-010',
      name: 'Sarah Johnson',
      phone: '+255790123456',
      email: 'sarah.j@example.com',
      creditScore: 580,
      riskLevel: 'critical',
      riskFactors: [
        'Very low credit score',
        'Multiple defaults',
        'No contact since 30 days'
      ],
      activeLoans: 1,
      totalDebt: 2800000,
      overdueAmount: 1400000,
      paymentHistory: 'Very Poor',
      daysOverdue: 30,
      predictedDefault: '95%',
      recommendedAction: 'Legal action pending'
    }
  ];

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
          text: 'text-green-700 dark:text-green-300',
          icon: CheckCircle,
          border: 'border-green-200 dark:border-green-900/50'
        };
      case 'medium':
        return { 
          bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
          text: 'text-yellow-700 dark:text-yellow-300',
          icon: AlertCircle,
          border: 'border-yellow-200 dark:border-yellow-900/50'
        };
      case 'high':
        return { 
          bg: 'bg-orange-100 dark:bg-orange-900/30', 
          text: 'text-orange-700 dark:text-orange-300',
          icon: AlertTriangle,
          border: 'border-orange-200 dark:border-orange-900/50'
        };
      case 'critical':
        return { 
          bg: 'bg-red-100 dark:bg-red-900/30', 
          text: 'text-red-700 dark:text-red-300',
          icon: XCircle,
          border: 'border-red-200 dark:border-red-900/50'
        };
      default:
        return { 
          bg: 'bg-gray-100 dark:bg-gray-800', 
          text: 'text-gray-700 dark:text-gray-300',
          icon: Shield,
          border: 'border-gray-200 dark:border-gray-700'
        };
    }
  };

  const filteredCustomers = riskLevel === 'all' 
    ? riskCustomers 
    : riskCustomers.filter(c => c.riskLevel === riskLevel);

  const riskStats = {
    low: riskCustomers.filter(c => c.riskLevel === 'low').length,
    medium: riskCustomers.filter(c => c.riskLevel === 'medium').length,
    high: riskCustomers.filter(c => c.riskLevel === 'high').length,
    critical: riskCustomers.filter(c => c.riskLevel === 'critical').length,
    totalExposure: riskCustomers.reduce((sum, c) => sum + c.totalDebt, 0),
    predictedLoss: riskCustomers.reduce((sum, c) => sum + (c.totalDebt * parseInt(c.predictedDefault) / 100), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Risk Analysis</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            AI-powered credit risk assessment and portfolio health
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
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{riskStats.low}</span>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Low Risk</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Safe customers</p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{riskStats.medium}</span>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Medium Risk</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Monitor closely</p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{riskStats.high}</span>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">High Risk</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Intervention needed</p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{riskStats.critical}</span>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Critical Risk</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Immediate action</p>
        </div>
      </div>

      {/* Portfolio Risk Summary */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          Portfolio Risk Assessment
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Exposure</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(riskStats.totalExposure)}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Predicted Loss</span>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  {formatCurrency(riskStats.predictedLoss)}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500" 
                  style={{ width: `${(riskStats.predictedLoss / riskStats.totalExposure) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {Math.round((riskStats.predictedLoss / riskStats.totalExposure) * 100)}% of portfolio at risk
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Risk Distribution</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Low Risk</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white ml-auto">
                  {riskStats.low} customers
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Medium Risk</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white ml-auto">
                  {riskStats.medium} customers
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">High Risk</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white ml-auto">
                  {riskStats.high} customers
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Critical</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white ml-auto">
                  {riskStats.critical} customers
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setRiskLevel('all')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            riskLevel === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          All Risks
        </button>
        <button
          onClick={() => setRiskLevel('low')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            riskLevel === 'low'
              ? 'bg-green-600 text-white'
              : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30'
          }`}
        >
          Low
        </button>
        <button
          onClick={() => setRiskLevel('medium')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            riskLevel === 'medium'
              ? 'bg-yellow-600 text-white'
              : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
          }`}
        >
          Medium
        </button>
        <button
          onClick={() => setRiskLevel('high')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            riskLevel === 'high'
              ? 'bg-orange-600 text-white'
              : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30'
          }`}
        >
          High
        </button>
        <button
          onClick={() => setRiskLevel('critical')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            riskLevel === 'critical'
              ? 'bg-red-600 text-white'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30'
          }`}
        >
          Critical
        </button>
      </div>

      {/* Risk Analysis Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Credit Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Risk Factors
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Exposure
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Default Probability
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Recommended Action
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredCustomers.map((customer) => {
                const risk = getRiskLevelColor(customer.riskLevel);
                const RiskIcon = risk.icon;
                
                return (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{customer.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${risk.bg} ${risk.text}`}>
                        <RiskIcon className="w-3 h-3" />
                        {customer.riskLevel.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${
                        customer.creditScore >= 700 ? 'text-green-600' :
                        customer.creditScore >= 600 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {customer.creditScore}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc list-inside">
                        {customer.riskFactors.map((factor, idx) => (
                          <li key={idx}>{factor}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(customer.totalDebt)}
                      </p>
                      {customer.overdueAmount > 0 && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Overdue: {formatCurrency(customer.overdueAmount)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${
                          parseInt(customer.predictedDefault) >= 70 ? 'text-red-600' :
                          parseInt(customer.predictedDefault) >= 40 ? 'text-orange-600' :
                          'text-yellow-600'
                        }`}>
                          {customer.predictedDefault}
                        </span>
                        <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              parseInt(customer.predictedDefault) >= 70 ? 'bg-red-500' :
                              parseInt(customer.predictedDefault) >= 40 ? 'bg-orange-500' :
                              'bg-yellow-500'
                            }`}
                            style={{ width: customer.predictedDefault }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-gray-900 dark:text-white">
                        {customer.recommendedAction}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Mitigation Strategies */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Risk Mitigation Strategies
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">For High Risk</h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Require additional collateral</li>
              <li>• Shorter repayment terms</li>
              <li>• Weekly payment monitoring</li>
              <li>• Personal guarantor required</li>
            </ul>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">For Medium Risk</h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Standard monitoring</li>
              <li>• Monthly check-ins</li>
              <li>• Credit building incentives</li>
              <li>• Automatic payment setup</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">For Critical Risk</h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Immediate collection action</li>
              <li>• Legal department review</li>
              <li>• Asset recovery process</li>
              <li>• Credit bureau reporting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
