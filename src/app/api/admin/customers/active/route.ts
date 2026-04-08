import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthCookie, verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // Get customers with active loans
    const customers = await db.customer.findMany({
      where: {
        activeLoans: { gt: 0 },
        deletedAt: null,
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { surname: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phoneNumber: { contains: search } },
            { customerId: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      include: {
        loans: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate stats
    const totalOutstanding = customers.reduce((sum, c) => {
      const activeLoan = c.loans[0];
      return sum + (activeLoan?.remainingBalance || 0);
    }, 0);

    const totalLoanAmount = customers.reduce((sum, c) => {
      const activeLoan = c.loans[0];
      return sum + (activeLoan?.amount || 0);
    }, 0);

    const stats = {
      total: customers.length,
      totalOutstanding,
      averageLoan: customers.length > 0 ? totalLoanAmount / customers.length : 0
    };

    // Format customers for frontend
    const formattedCustomers = customers.map(customer => {
      const activeLoan = customer.loans[0];
      return {
        id: customer.id,
        firstName: customer.firstName,
        surname: customer.surname,
        phoneNumber: customer.phoneNumber,
        email: customer.email,
        loanId: activeLoan?.loanId || 'N/A',
        amount: activeLoan?.amount || 0,
        amountPaid: activeLoan?.amountPaid || 0,
        remainingBalance: activeLoan?.remainingBalance || 0,
        progress: activeLoan?.amount ? ((activeLoan.amountPaid || 0) / activeLoan.amount) * 100 : 0,
        status: activeLoan?.status || 'active',
        dueDate: activeLoan?.dueDate,
        creditScore: customer.creditScore,
        customerId: customer.customerId
      };
    });

    return NextResponse.json({ 
      success: true, 
      customers: formattedCustomers,
      stats
    });
  } catch (error) {
    console.error('Error fetching active customers:', error);
    return NextResponse.json({ error: 'Failed to fetch active customers' }, { status: 500 });
  }
}
