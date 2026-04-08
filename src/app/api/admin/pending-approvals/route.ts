import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get all pending loans (stage 1)
    const pendingLoans = await db.loan.findMany({
      where: { 
        status: 'pending',
        stage: 1
      },
      include: {
        customer: {
          select: {
            firstName: true,
            surname: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    const data = pendingLoans.map(loan => ({
      id: loan.id,
      loanId: loan.loanId,
      customerName: `${loan.customer.firstName} ${loan.customer.surname}`,
      amount: loan.amount,
      purpose: loan.purpose,
      appliedDate: loan.createdAt
    }));
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}
