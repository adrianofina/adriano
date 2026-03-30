import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthCookie, verifyToken } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ loanId: string }> }
) {
  try {
    const { loanId } = await params;

    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { disbursementMethod, reference } = body;

    // Get the loan with customer
    const loan = await db.loan.findUnique({
      where: { id: loanId },
      include: { customer: true }
    });

    if (!loan) {
      return NextResponse.json({ success: false, error: 'Loan not found' }, { status: 404 });
    }

    if (loan.status !== 'pending') {
      return NextResponse.json({ 
        success: false, 
        error: `Loan cannot be disbursed. Current status: ${loan.status}` 
      }, { status: 400 });
    }

    // Use transaction to ensure data consistency
    const result = await db.$transaction(async (tx) => {
      // Update loan status to active - only use fields that exist
      const updatedLoan = await tx.loan.update({
        where: { id: loanId },
        data: {
          status: 'active',
          disbursedAt: new Date(),
          disbursedById: user.id,
          remainingBalance: loan.amount
        }
      });

      // Update customer counters
      await tx.customer.update({
        where: { id: loan.customerId },
        data: {
          totalLoans: { increment: 1 },
          activeLoans: { increment: 1 },
          totalBorrowed: { increment: loan.amount }
        }
      });

      // Create audit log with the disbursement details
      await tx.auditLog.create({
        data: {
          userId: user.id,
          userName: user.email,
          userRole: user.role,
          action: 'DISBURSE',
          entityType: 'Loan',
          entityId: loan.id,
          details: {
            amount: loan.amount,
            method: disbursementMethod,
            reference: reference,
            customerName: `${loan.customer.firstName} ${loan.customer.surname}`
          }
        }
      });

      return updatedLoan;
    });

    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Loan disbursed successfully'
    });

  } catch (error: any) {
    console.error('[POST /api/admin/loans/[loanId]/disburse]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to disburse loan' },
      { status: 500 }
    );
  }
}