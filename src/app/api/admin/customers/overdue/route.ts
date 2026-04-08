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

    // Get customers with overdue loans
    const customers = await db.customer.findMany({
      where: {
        overdueLoans: { gt: 0 },
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
          where: { status: 'overdue' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate stats
    let totalOverdue = 0;
    let totalDays = 0;
    let totalPenalty = 0;

    const formattedCustomers = customers.map(customer => {
      const overdueLoan = customer.loans[0];
      const daysOverdue = overdueLoan?.dueDate 
        ? Math.max(0, Math.floor((new Date().getTime() - new Date(overdueLoan.dueDate).getTime()) / (1000 * 60 * 60 * 24)))
        : 0;
      const penalty = overdueLoan?.penalties || (daysOverdue * (overdueLoan?.amount || 0) * 0.01);
      
      totalOverdue += overdueLoan?.remainingBalance || 0;
      totalDays += daysOverdue;
      totalPenalty += penalty;

      return {
        id: customer.id,
        firstName: customer.firstName,
        surname: customer.surname,
        phoneNumber: customer.phoneNumber,
        email: customer.email,
        loanId: overdueLoan?.loanId || 'N/A',
        amount: overdueLoan?.amount || 0,
        amountPaid: overdueLoan?.amountPaid || 0,
        remainingBalance: overdueLoan?.remainingBalance || 0,
        progress: overdueLoan?.amount ? ((overdueLoan.amountPaid || 0) / overdueLoan.amount) * 100 : 0,
        status: 'overdue',
        dueDate: overdueLoan?.dueDate,
        daysOverdue,
        penalty,
        creditScore: customer.creditScore,
        customerId: customer.customerId
      };
    });

    const stats = {
      total: customers.length,
      totalOverdue,
      avgDays: customers.length > 0 ? totalDays / customers.length : 0,
      totalPenalty
    };

    return NextResponse.json({ 
      success: true, 
      customers: formattedCustomers,
      stats
    });
  } catch (error) {
    console.error('Error fetching overdue customers:', error);
    return NextResponse.json({ error: 'Failed to fetch overdue customers' }, { status: 500 });
  }
}
