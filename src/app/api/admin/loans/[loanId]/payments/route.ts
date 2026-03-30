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
    const { amount, method, reference, notes } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid payment amount' }, { status: 400 });
    }

    // Get the loan with customer
    const loan = await db.loan.findUnique({
      where: { id: loanId },
      include: { customer: true }
    });

    if (!loan) {
      return NextResponse.json({ success: false, error: 'Loan not found' }, { status: 404 });
    }

    if (loan.status !== 'active') {
      return NextResponse.json({ success: false, error: 'Loan is not active' }, { status: 400 });
    }

    if (amount > loan.remainingBalance) {
      return NextResponse.json({ 
        success: false, 
        error: `Payment amount exceeds remaining balance` 
      }, { status: 400 });
    }

    // Calculate new values
    const newAmountPaid = (loan.amountPaid || 0) + amount;
    const newRemainingBalance = loan.remainingBalance - amount;
    const newProgress = Math.round((newAmountPaid / loan.amount) * 100);
    const newStatus = newRemainingBalance <= 0 ? 'completed' : 'active';

    // Generate payment ID
    const paymentCount = await db.payment.count();
    const paymentId = `PAY-${new Date().getFullYear()}-${(paymentCount + 1).toString().padStart(4, '0')}`;

    // Use transaction to ensure data consistency
    const result = await db.$transaction(async (tx) => {
      // Create payment record
      const payment = await tx.payment.create({
        data: {
          paymentId,
          loanId: loan.id,
          amount,
          method,
          reference: reference || null,
          notes: notes || null,
          receivedById: user.id,
          receivedAt: new Date()
        }
      });

      // Update loan
      const updatedLoan = await tx.loan.update({
        where: { id: loan.id },
        data: {
          amountPaid: newAmountPaid,
          remainingBalance: newRemainingBalance,
          status: newStatus,
          paidAt: newRemainingBalance <= 0 ? new Date() : null,
          paidById: newRemainingBalance <= 0 ? user.id : null
        }
      });

      // Update customer totals (remove completedLoans - not in schema)
      await tx.customer.update({
        where: { id: loan.customerId },
        data: {
          totalRepaid: { increment: amount }
        }
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          userName: user.email,
          userRole: user.role,
          action: 'PAYMENT',
          entityType: 'Loan',
          entityId: loan.id,
          details: {
            amount,
            method,
            reference,
            notes,
            remainingBalance: newRemainingBalance,
            progress: newProgress
          }
        }
      });

      return { payment, updatedLoan };
    });

    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Payment recorded successfully'
    });

  } catch (error: any) {
    console.error('[POST /api/admin/loans/[loanId]/payments]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record payment' },
      { status: 500 }
    );
  }
}