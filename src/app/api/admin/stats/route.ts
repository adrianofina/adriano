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
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all stats in parallel
    const [
      totalCustomers,
      totalLoans,
      activeLoans,
      overdueLoans,
      completedLoans,
      pendingApprovals,
      totalDisbursed,
      totalRepaid
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.loan.count(),
      prisma.loan.count({ where: { status: 'active' } }),
      prisma.loan.count({ where: { status: 'overdue' } }),
      prisma.loan.count({ where: { status: 'paid' } }),
      prisma.loan.count({ where: { status: 'pending' } }),
      prisma.loan.aggregate({ _sum: { amount: true } }),
      prisma.payment.aggregate({ _sum: { amount: true } })
    ]);

    // Risk distribution
    const customers = await prisma.customer.findMany({
      select: { creditScore: true }
    });

    const riskDistribution = {
      low: customers.filter(c => (c.creditScore || 650) >= 700).length,
      medium: customers.filter(c => {
        const score = c.creditScore || 650;
        return score >= 600 && score < 700;
      }).length,
      high: customers.filter(c => (c.creditScore || 650) < 600).length
    };

    // Upcoming payments
    const today = new Date();
    const next7Days = new Date(today); next7Days.setDate(today.getDate() + 7);
    const next30Days = new Date(today); next30Days.setDate(today.getDate() + 30);
    const next90Days = new Date(today); next90Days.setDate(today.getDate() + 90);

    const loans = await prisma.loan.findMany({
      where: { nextPaymentDate: { not: null } },
      select: { nextPaymentDate: true }
    });

    const upcomingPayments = {
      next7Days: loans.filter(l => {
        const date = new Date(l.nextPaymentDate!);
        return date >= today && date <= next7Days;
      }).length,
      next30Days: loans.filter(l => {
        const date = new Date(l.nextPaymentDate!);
        return date > next7Days && date <= next30Days;
      }).length,
      next90Days: loans.filter(l => {
        const date = new Date(l.nextPaymentDate!);
        return date > next30Days && date <= next90Days;
      }).length
    };

    return NextResponse.json({
      totalCustomers,
      totalLoans,
      activeLoans,
      overdueLoans,
      completedLoans,
      pendingApprovals,
      totalDisbursed: totalDisbursed._sum.amount || 0,
      totalRepaid: totalRepaid._sum.amount || 0,
      riskDistribution,
      upcomingPayments
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
