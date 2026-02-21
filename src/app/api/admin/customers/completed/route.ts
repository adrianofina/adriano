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
      where: {
        activeLoans: 0,
        totalLoans: { gt: 0 }
      },
      include: {
        loans: {
          where: { status: 'paid' },
          orderBy: { paidAt: 'desc' }
        }
      }
    });

    const formatted = customers.map(c => {
      const lastLoan = c.loans[0];
      const totalRepaid = c.loans.reduce((sum, l) => sum + l.amountPaid, 0);
      
      return {
        id: c.id,
        customerId: c.customerId,
        name: `${c.firstName} ${c.surname}`,
        phone: c.phoneNumber,
        email: c.email,
        avatar: (c.firstName[0] + c.surname[0]).toUpperCase(),
        totalLoans: c.totalLoans,
        totalBorrowed: c.totalBorrowed,
        totalRepaid,
        lastLoanId: lastLoan?.loanId,
        lastLoanAmount: lastLoan?.amount || 0,
        completionDate: lastLoan?.paidAt ? new Date(lastLoan.paidAt).toLocaleDateString() : null,
        memberSince: new Date(c.createdAt).toLocaleDateString(),
        creditScore: c.creditScore || 650,
        rating: c.creditScore && c.creditScore >= 700 ? 'Excellent' 
                : c.creditScore && c.creditScore >= 600 ? 'Good' : 'Average',
        referrals: 0
      };
    });

    const totalRepaid = formatted.reduce((sum, c) => sum + c.totalRepaid, 0);
    const avgCreditScore = formatted.length > 0 
      ? Math.round(formatted.reduce((sum, c) => sum + c.creditScore, 0) / formatted.length) 
      : 0;

    return NextResponse.json({
      customers: formatted,
      stats: {
        total: formatted.length,
        totalRepaid,
        avgCreditScore,
        totalReferrals: formatted.reduce((sum, c) => sum + c.referrals, 0)
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
