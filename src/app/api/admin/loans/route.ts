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

    const loans = await prisma.loan.findMany({
      include: {
        customer: {
          select: {
            firstName: true,
            surname: true,
            creditScore: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const stats = {
      total: loans.length,
      active: loans.filter(l => l.status === 'active').length,
      pending: loans.filter(l => ['pending', 'approved'].includes(l.status)).length,
      overdue: loans.filter(l => l.status === 'overdue').length,
      paid: loans.filter(l => l.status === 'paid').length
    };

    const formatted = loans.map(l => {
      const progress = l.amount > 0 ? Math.round((l.amountPaid / l.amount) * 100) : 0;
      
      return {
        id: l.id,
        loanId: l.loanId,
        customer: l.customer ? `${l.customer.firstName} ${l.customer.surname}` : 'Unknown',
        amount: l.amount,
        purpose: l.purpose,
        status: l.status,
        progress,
        appliedDate: new Date(l.createdAt).toLocaleDateString(),
        dueDate: l.nextPaymentDate ? new Date(l.nextPaymentDate).toLocaleDateString() : null,
        creditScore: l.customer?.creditScore || 650,
        risk: l.customer?.creditScore && l.customer.creditScore >= 700 ? 'low' 
              : l.customer?.creditScore && l.customer.creditScore >= 600 ? 'medium' : 'high'
      };
    });

    return NextResponse.json({ loans: formatted, stats });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
