import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [
      totalCustomers,
      activeLoans,
      overdueLoans,
      completedLoans,
      totalDisbursed,
      totalRepaid
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.loan.count({ where: { status: 'active' } }),
      prisma.loan.count({ where: { status: 'overdue' } }),
      prisma.loan.count({ where: { status: 'paid' } }),
      prisma.loan.aggregate({
        where: { status: { in: ['active', 'paid', 'overdue'] } },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({
      totalCustomers,
      activeLoans,
      overdueLoans,
      completedLoans,
      totalDisbursed: totalDisbursed._sum.amount || 0,
      totalRepaid: totalRepaid._sum.amount || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
