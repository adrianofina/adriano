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

export async function GET(request: Request) {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const where: any = {
      activeLoans: { gt: 0 }
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { surname: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } }
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        loans: {
          where: { status: { in: ['active', 'overdue'] } },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    const formatted = customers.map(c => {
      const loan = c.loans[0];
      const progress = loan ? Math.round((loan.amountPaid / loan.amount) * 100) : 0;
      
      return {
        id: c.id,
        customerId: c.customerId,
        firstName: c.firstName,
        surname: c.surname,
        email: c.email,
        phone: c.phoneNumber,
        avatar: (c.firstName[0] + c.surname[0]).toUpperCase(),
        loanId: loan?.loanId || null,
        loanAmount: loan?.amount || 0,
        paidAmount: loan?.amountPaid || 0,
        remaining: loan?.remainingBalance || 0,
        progress,
        dueDate: loan?.nextPaymentDate ? new Date(loan.nextPaymentDate).toLocaleDateString() : null,
        nextPayment: loan?.remainingBalance || 0,
        lastPayment: loan?.payments?.[0]?.receivedAt 
          ? new Date(loan.payments[0].receivedAt).toLocaleDateString() 
          : null,
        paymentStatus: loan?.status === 'overdue' ? 'late' : 'on-time',
        creditScore: c.creditScore || 650,
        risk: c.creditScore && c.creditScore >= 700 ? 'low' 
              : c.creditScore && c.creditScore >= 600 ? 'medium' : 'high'
      };
    });

    const totalOutstanding = formatted.reduce((sum, c) => sum + c.remaining, 0);
    const latePayments = formatted.filter(c => c.paymentStatus === 'late').length;

    return NextResponse.json({
      customers: formatted,
      stats: {
        total: formatted.length,
        totalOutstanding,
        averageLoan: formatted.length > 0 ? totalOutstanding / formatted.length : 0,
        latePayments
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
