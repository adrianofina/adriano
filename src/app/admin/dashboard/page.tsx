import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { 
      title: "Total Customers", 
      value: "1,247", 
      change: "+12%", 
      trend: "up",
      icon: Users,
      color: "bg-blue-500"
    },
    { 
      title: "Active Loans", 
      value: "342", 
      change: "+8%", 
      trend: "up",
      icon: CreditCard,
      color: "bg-green-500"
    },
    { 
      title: "Total Disbursed", 
      value: "2.8B TZS", 
      change: "+15%", 
      trend: "up",
      icon: TrendingUp,
      color: "bg-purple-500"
    },
    { 
      title: "Overdue Loans", 
      value: "23", 
      change: "-5%", 
      trend: "down",
      icon: AlertCircle,
      color: "bg-red-500"
    },
  ];

  const recentLoans = [
    { id: "L-001", customer: "John Doe", amount: "5,000,000 TZS", status: "pending", date: "2024-03-15" },
    { id: "L-002", customer: "Jane Smith", amount: "3,500,000 TZS", status: "approved", date: "2024-03-14" },
    { id: "L-003", customer: "Robert Johnson", amount: "7,200,000 TZS", status: "in-progress", date: "2024-03-13" },
    { id: "L-004", customer: "Mary Williams", amount: "2,100,000 TZS", status: "pending", date: "2024-03-12" },
  ];

  const overdueLoans = [
    { customer: "Laurent Adriano", amount: "120,000 TZS", days: 15, loanId: "L-342" },
    { customer: "Sarah Williams", amount: "85,000 TZS", days: 8, loanId: "L-335" },
    { customer: "Michael Brown", amount: "200,000 TZS", days: 5, loanId: "L-328" },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, Admin. Here's your financial overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1">
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold mt-4">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Loans */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Loan Applications</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Loan ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentLoans.map((loan) => (
                  <tr key={loan.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium">{loan.id}</td>
                    <td className="py-3 px-4 text-sm">{loan.customer}</td>
                    <td className="py-3 px-4 text-sm">{loan.amount}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{loan.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Overdue Loans Alert */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Overdue Loans</h2>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-4">
            {overdueLoans.map((loan) => (
              <div key={loan.loanId} className="p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{loan.customer}</p>
                    <p className="text-sm text-gray-600">{loan.loanId}</p>
                  </div>
                  <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                    {loan.days} days
                  </span>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-lg font-bold text-red-600">{loan.amount}</p>
                  <button className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700">
                    Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
