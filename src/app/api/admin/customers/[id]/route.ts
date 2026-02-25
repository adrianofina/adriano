import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // IMPORTANT: Await params if it's a Promise
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    console.log(`🔍 GET /api/admin/customers/${id}`);
    
    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Get customer with ID
    const customer = await db.customer.findUnique({
      where: { 
        id: id 
      }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get loans separately
    const loans = await db.loan.findMany({
      where: { customerId: id },
      select: {
        id: true,
        loanId: true,
        amount: true,
        status: true,
        amountPaid: true,
        remainingBalance: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get createdBy info
    let createdBy = null;
    if (customer.createdById) {
      createdBy = await db.user.findUnique({
        where: { id: customer.createdById },
        select: { name: true, email: true }
      });
    }

    // Calculate loan stats
    const activeLoans = loans.filter(l => l.status === 'active').length;
    const overdueLoans = loans.filter(l => l.status === 'overdue').length;
    const completedLoans = loans.filter(l => l.status === 'completed').length;
    const totalBorrowed = loans.reduce((sum, l) => sum + l.amount, 0);
    const totalRepaid = loans.reduce((sum, l) => sum + l.amountPaid, 0);

    // Return complete customer data
    return NextResponse.json({
      ...customer,
      createdBy,
      loans,
      stats: {
        activeLoans,
        overdueLoans,
        completedLoans,
        totalBorrowed,
        totalRepaid,
        loanCount: loans.length
      }
    });

  } catch (error: any) {
    console.error('❌ Error in customer API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}
