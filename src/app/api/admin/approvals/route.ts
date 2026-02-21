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

    // Stage 1 - Pending first approval
    const stage1Loans = await prisma.loan.findMany({
      where: { 
        status: 'pending',
        approvedById1: null 
      },
      include: {
        customer: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Stage 2 - Approved by first, waiting for second
    const stage2Loans = await prisma.loan.findMany({
      where: { 
        status: 'pending',
        approvedById1: { not: null },
        approvedById2: null 
      },
      include: {
        customer: true,
        approvedBy1: true
      },
      orderBy: { approvedAt1: 'asc' }
    });

    const formatLoan = (loan: any, stage: number) => ({
      id: loan.id,
      loanId: loan.loanId,
      customer: `${loan.customer.firstName} ${loan.customer.surname}`,
      amount: loan.amount,
      purpose: loan.purpose,
      appliedDate: new Date(loan.createdAt).toLocaleDateString(),
      creditScore: loan.customer.creditScore || 650,
      risk: loan.customer.creditScore && loan.customer.creditScore >= 700 ? 'low' 
            : loan.customer.creditScore && loan.customer.creditScore >= 600 ? 'medium' : 'high',
      documents: 0,
      stage,
      approvedBy: stage === 2 ? loan.approvedBy1?.name : null,
      approvedAt: stage === 2 && loan.approvedAt1 ? new Date(loan.approvedAt1).toLocaleString() : null
    });

    return NextResponse.json({
      stage1: stage1Loans.map(l => formatLoan(l, 1)),
      stage2: stage2Loans.map(l => formatLoan(l, 2)),
      counts: {
        stage1: stage1Loans.length,
        stage2: stage2Loans.length
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
