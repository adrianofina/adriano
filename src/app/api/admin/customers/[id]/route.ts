import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthCookie, verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    // Extract ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    
    // Check authentication
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Get customer
    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true, email: true } }
      }
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get loans
    const loans = await db.loan.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' }
    });

    const stats = {
      activeLoans: loans.filter(l => l.status === 'active').length,
      overdueLoans: loans.filter(l => l.status === 'overdue').length,
      completedLoans: loans.filter(l => l.status === 'completed').length,
      totalBorrowed: loans.reduce((sum, l) => sum + l.amount, 0),
      totalRepaid: loans.reduce((sum, l) => sum + l.amountPaid, 0),
      loanCount: loans.length
    };

    return NextResponse.json({
      success: true,
      data: {
        ...customer,
        loans,
        stats
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
