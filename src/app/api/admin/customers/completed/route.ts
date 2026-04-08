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

    // Get customers with completed loans (no active/overdue, but have total loans)
    const customers = await db.customer.findMany({
      where: {
        activeLoans: 0,
        overdueLoans: 0,
        totalLoans: { gt: 0 },
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
          where: { status: { in: ['completed', 'paid'] } },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate stats
    let totalRepaid = 0;
    let totalCreditScore = 0;

    const formattedCustomers = customers.map(customer => {
      const completedLoan = customer.loans[0];
      totalRepaid += completedLoan?.amountPaid || 0;
      totalCreditScore += customer.creditScore || 0;

      return {
        id: customer.id,
        firstName: customer.firstName,
        surname: customer.surname,
        phoneNumber: customer.phoneNumber,
        email: customer.email,
        loanId: completedLoan?.loanId || 'N/A',
        amount: completedLoan?.amount || 0,
        amountPaid: completedLoan?.amountPaid || 0,
        remainingBalance: 0,
        progress: 100,
        status: 'completed',
        completionDate: completedLoan?.updatedAt || completedLoan?.paidAt || customer.updatedAt,
        creditScore: customer.creditScore,
        customerId: customer.customerId
      };
    });

    const stats = {
      total: customers.length,
      totalRepaid,
      avgCreditScore: customers.length > 0 ? totalCreditScore / customers.length : 0
    };

    return NextResponse.json({ 
      success: true, 
      customers: formattedCustomers,
      stats
    });
  } catch (error) {
    console.error('Error fetching completed customers:', error);
    return NextResponse.json({ error: 'Failed to fetch completed customers' }, { status: 500 });
  }
}
