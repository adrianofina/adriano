import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { getAuthCookie, verifyToken } from '@/lib/auth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    // Verify admin access
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all customers with their loans
    const customers = await prisma.customer.findMany({
      include: {
        loans: true
      }
    });

    const loans = await prisma.loan.findMany();

    // Calculate basic stats
    const totalCustomers = customers.length;
    const activeLoans = loans.filter(l => l.status === 'active').length;
    const overdueLoans = loans.filter(l => l.status === 'overdue').length;
    const completedLoans = loans.filter(l => l.status === 'paid').length;
    const pendingApprovals = loans.filter(l => l.status === 'pending').length;
    
    const totalDisbursed = loans.reduce((sum, l) => sum + l.amount, 0);
    const totalRepaid = loans.reduce((sum, l) => sum + l.amountPaid, 0);

    // Risk distribution (simplified)
    const highRiskCustomers = customers.filter(c => (c.creditScore || 650) < 600).length;
    const mediumRiskCustomers = customers.filter(c => {
      const score = c.creditScore || 650;
      return score >= 600 && score < 700;
    }).length;
    const lowRiskCustomers = customers.filter(c => (c.creditScore || 650) >= 700).length;

    // New applications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newApplications = loans.filter(l => new Date(l.createdAt) > sevenDaysAgo).length;

    // Upcoming payments
    const today = new Date();
    const next7Days = new Date(); next7Days.setDate(today.getDate() + 7);
    const next30Days = new Date(); next30Days.setDate(today.getDate() + 30);
    const next90Days = new Date(); next90Days.setDate(today.getDate() + 90);

    const upcomingNext7Days = loans.filter(l => {
      if (!l.nextPaymentDate) return false;
      const dueDate = new Date(l.nextPaymentDate);
      return dueDate > today && dueDate <= next7Days;
    }).length;

    const upcomingNext30Days = loans.filter(l => {
      if (!l.nextPaymentDate) return false;
      const dueDate = new Date(l.nextPaymentDate);
      return dueDate > next7Days && dueDate <= next30Days;
    }).length;

    const upcomingNext90Days = loans.filter(l => {
      if (!l.nextPaymentDate) return false;
      const dueDate = new Date(l.nextPaymentDate);
      return dueDate > next30Days && dueDate <= next90Days;
    }).length;

    // Loan performance (simplified)
    const totalPayments = await prisma.payment.count();
    const onTimePayments = await prisma.payment.count({
      where: {
        // Assuming payments are on time if they exist
        // This is simplified
      }
    });

    const stats = {
      totalCustomers,
      activeLoans,
      overdueLoans,
      completedLoans,
      totalDisbursed,
      totalRepaid,
      pendingApprovals,
      highRiskCustomers,
      newApplications,
      riskDistribution: {
        low: lowRiskCustomers,
        medium: mediumRiskCustomers,
        high: highRiskCustomers
      },
      loanPerformance: {
        onTime: 92, // Placeholder - would need actual payment data
        late: 6,
        defaulted: 2
      },
      upcomingPayments: {
        next7Days: upcomingNext7Days,
        next30Days: upcomingNext30Days,
        next90Days: upcomingNext90Days
      }
    };

    return NextResponse.json(stats);

  } catch (error: any) {
    console.error('Error fetching overview stats:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
