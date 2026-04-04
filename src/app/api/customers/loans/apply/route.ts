import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthCookie, verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, purpose, term, description, interestRate } = body;

    if (!amount || !purpose || !term) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let customer = await db.customer.findFirst({
      where: { userId: user.id }
    });

    if (!customer && user.email) {
      customer = await db.customer.findFirst({
        where: { email: user.email }
      });
    }

    if (!customer) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 });
    }

    const year = new Date().getFullYear();
    const loanCount = await db.loan.count();
    const loanId = `LOAN-${year}-${(loanCount + 1).toString().padStart(4, '0')}`;

    // Create ONLY the loan - NO customer updates
    const loan = await db.loan.create({
      data: {
        loanId: loanId,
        customerId: customer.id,
        amount: amount,
        purpose: purpose,
        term: term,
        interestRate: interestRate || 3.5,
        amountPaid: 0,
        remainingBalance: amount,
        penalties: 0,
        status: 'pending',
        stage: 1,
        createdById: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    // IMPORTANT: Do NOT update customer.totalLoans here!
    // The customer's totalLoans should only count APPROVED loans (status = 'active' or 'completed')

    await db.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name || user.email || 'Customer',
        action: 'LOAN_APPLICATION_SUBMITTED',
        entityType: 'loan',
        entityId: loan.id,
        details: `Loan application submitted for ${amount} - ${purpose}. Status: Pending Approval`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      }
    });

    return NextResponse.json({ 
      success: true, 
      loan,
      message: 'Loan application submitted successfully'
    });

  } catch (error: any) {
    console.error('Error submitting loan application:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit loan application' },
      { status: 500 }
    );
  }
}
