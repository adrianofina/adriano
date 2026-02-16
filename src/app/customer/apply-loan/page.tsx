'use client';

export default function ApplyLoanPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Apply for a Loan</h1>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Loan application form will be here.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Quick Information</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            <li>• Minimum loan amount: 100,000 TZS</li>
            <li>• Maximum loan amount: 10,000,000 TZS</li>
            <li>• Interest rate: 12% per annum</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
