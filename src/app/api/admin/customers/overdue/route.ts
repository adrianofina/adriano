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

    const customers = await prisma.customer.findMany({
      where: { overdueLoans: { gt: 0 } },
      include: {
        loans: {
          where: { status: 'overdue' },
          include: { payments: { take: 1, orderBy: { receivedAt: 'desc' } } }
        }
      }
    });

    const formatted = customers.map(c => {
      const loan = c.loans[0];
      const daysOverdue = loan?.nextPaymentDate 
        ? Math.floor((new Date().getTime() - new Date(loan.nextPaymentDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const totalDue = (loan?.remainingBalance || 0) + (loan?.penalties || 0);

      return {
        id: c.id,
        customerId: c.customerId,
        name: `${c.firstName} ${c.surname}`,
        phone: c.phoneNumber,
        email: c.email,
        avatar: (c.firstName[0] + c.surname[0]).toUpperCase(),
        loanId: loan?.loanId,
        loanAmount: loan?.amount || 0,
        paidAmount: loan?.amountPaid || 0,
        remaining: loan?.remainingBalance || 0,
        dueDate: loan?.nextPaymentDate ? new Date(loan.nextPaymentDate).toLocaleDateString() : null,
        daysOverdue,
        penalty: loan?.penalties || 0,
        totalDue,
        lastContact: loan?.payments?.[0]?.receivedAt 
          ? new Date(loan.payments[0].receivedAt).toLocaleDateString() 
          : null,
        risk: c.creditScore && c.creditScore >= 700 ? 'low' 
              : c.creditScore && c.creditScore >= 600 ? 'medium' : 'high',
        notes: loan?.status === 'overdue' ? 'Overdue payment' : null
      };
    });

    const totalOverdue = formatted.reduce((sum, c) => sum + c.totalDue, 0);
    const avgDays = formatted.length > 0 
      ? Math.round(formatted.reduce((sum, c) => sum + c.daysOverdue, 0) / formatted.length) 
      : 0;
    const highRisk = formatted.filter(c => c.risk === 'high').length;

    return NextResponse.json({
      customers: formatted,
      stats: {
        total: formatted.length,
        totalOverdue,
        avgDays,
        highRisk
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
