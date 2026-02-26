import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthCookie, verifyToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    console.log('📝 Creating loan for customer');
    
    // Get customer ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    // URL pattern: /api/admin/customers/[id]/loans
    const customerId = pathParts[pathParts.length - 2]; // Get the second last part which is the ID
    console.log('Customer ID from URL:', customerId);
    console.log('URL path:', url.pathname);
    console.log('Path parts:', pathParts);

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

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log('Loan data:', body);

    // Validate
    if (!body.amount || !body.purpose || !body.term || !body.interestRate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if customer exists
    const customer = await db.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Generate loan ID
    const year = new Date().getFullYear();
    const count = await db.loan.count();
    const loanId = `LOAN-${year}-${(count + 1).toString().padStart(4, '0')}`;

    // Create loan
    const loan = await db.loan.create({
      data: {
        loanId,
        customerId: customerId,
        amount: parseFloat(body.amount),
        purpose: body.purpose,
        term: parseInt(body.term),
        interestRate: parseFloat(body.interestRate),
        remainingBalance: parseFloat(body.amount),
        status: body.status || 'active',
        stage: 2,
        createdById: user.id,
        ...(body.dueDate && { dueDate: new Date(body.dueDate) })
      }
    });

    console.log('✅ Loan created:', loan);

    // Update customer stats
    await db.customer.update({
      where: { id: customerId },
      data: {
        totalLoans: { increment: 1 },
        activeLoans: { increment: 1 },
        totalBorrowed: { increment: loan.amount }
      }
    });

    return NextResponse.json({
      success: true,
      data: loan
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating loan:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Get customer ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const customerId = pathParts[pathParts.length - 2];
    
    const loans = await db.loan.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: loans
    });

  } catch (error) {
    console.error('Error fetching loans:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
