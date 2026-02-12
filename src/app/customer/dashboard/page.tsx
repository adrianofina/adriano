import { 
  CreditCard, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  ArrowRight
} from "lucide-react";

export default function CustomerDashboard() {
  const customer = {
    name: "Laurent Adriano",
    creditScore: 750,
    memberSince: "Jan 2024"
  };

  const currentLoan = {
    total: 3420000,
    paid: 3380000,
    remaining: 120000,
    dueDate: "2024-04-15",
    penalty: 80000,
    isOverdue: true
  };

  const recentTransactions = [
    { id: 1, date: "2024-03-15", amount: 500000, type: "payment", status: "completed" },
    { id: 2, date: "2024-03-01", amount: 500000, type: "payment", status: "completed" },
    { id: 3, date: "2024-02-15", amount: 500000, type: "payment", status: "completed" },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 rounded-2xl p-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {customer.name}!</h1>
            <p className="text-blue-100 max-w-2xl">
              Your trusted partner for financial solutions. We're here to help you achieve your financial goals.
            </p>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-lg">
            <p className="text-sm text-blue-100">Member since</p>
            <p className="font-semibold">{customer.memberSince}</p>
          </div>
        </div>
      </div>

      {/* Overdue Alert */}
      {currentLoan.isOverdue && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800 text-lg">Loan Overdue!</h3>
                <p className="text-red-600 mt-1">
                  Your loan payment of {formatCurrency(currentLoan.remaining)} is overdue.
                </p>
                <p className="text-sm text-red-500 mt-2">
                  Penalty interest rate activated. Penalty amount: {formatCurrency(currentLoan.penalty)}
                </p>
              </div>
            </div>
            <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-medium transition-colors">
              Pay Now
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Credit Score</p>
              <p className="text-3xl font-bold mt-1">{customer.creditScore}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">↑ Excellent</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Loans</p>
              <p className="text-3xl font-bold mt-1">1</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">In progress</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Borrowed</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(15000000)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-2">Lifetime</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Repaid</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(13800000)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">92% repaid</p>
        </div>
      </div>

      {/* Current Loan Progress */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Current Loan Progress</h2>
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            Overdue
          </span>
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Amount Paid</span>
              <span className="font-semibold">
                {formatCurrency(currentLoan.paid)} / {formatCurrency(currentLoan.total)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full" 
                style={{ width: `${(currentLoan.paid / currentLoan.total) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Remaining Balance</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentLoan.remaining)}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600">Penalty Amount</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(currentLoan.penalty)}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600">Due Date</p>
              <p className="text-2xl font-bold text-blue-600">{currentLoan.dueDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Loan Payment</p>
                    <p className="text-sm text-gray-600">{transaction.date}</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">{formatCurrency(transaction.amount)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Apply for Loan</p>
                <p className="text-xs text-gray-600">Get funds for your needs</p>
              </div>
            </button>
            <button className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">View History</p>
                <p className="text-xs text-gray-600">Check your loan history</p>
              </div>
            </button>
            <button className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Update Profile</p>
                <p className="text-xs text-gray-600">Manage your information</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
