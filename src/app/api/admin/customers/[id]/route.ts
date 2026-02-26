import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthCookie, verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    console.log('🔍 GET /api/admin/customers/[id] called');
    
    // Get ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    
    console.log('Looking for customer ID:', id);

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

    // Simple query first - just get the customer without includes
    const customer = await db.customer.findUnique({
      where: { id }
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Then get related data separately
    const [createdBy, loans, documents] = await Promise.all([
      customer.createdById ? db.user.findUnique({
        where: { id: customer.createdById },
        select: { name: true, email: true }
      }) : null,
      
      db.loan.findMany({
        where: { customerId: id },
        orderBy: { createdAt: 'desc' }
      }),
      
      db.customerDocument.findMany({
        where: { customerId: id },
        orderBy: { uploadedAt: 'desc' }
      })
    ]);

    // Calculate stats
    const stats = {
      activeLoans: loans.filter(l => l.status === 'active').length,
      overdueLoans: loans.filter(l => l.status === 'overdue').length,
      completedLoans: loans.filter(l => l.status === 'completed').length,
      totalBorrowed: loans.reduce((sum, l) => sum + l.amount, 0),
      totalRepaid: loans.reduce((sum, l) => sum + l.amountPaid, 0),
      loanCount: loans.length,
      documentCount: documents.length
    };

    // Return combined data
    return NextResponse.json({
      success: true,
      data: {
        ...customer,
        createdBy,
        loans,
        documents,
        stats
      }
    });

  } catch (error: any) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error'
      },
      { status: 500 }
    );
  }
}
