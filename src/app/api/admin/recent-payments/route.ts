import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    
    const payments = await db.payment.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        loan: {
          include: {
            customer: {
              select: {
                firstName: true,
                surname: true
              }
            }
          }
        }
      }
    });
    
    const data = payments.map(payment => ({
      id: payment.id,
      loanId: payment.loan?.loanId || 'N/A',
      customerName: payment.loan?.customer ? `${payment.loan.customer.firstName} ${payment.loan.customer.surname}` : 'Unknown',
      amount: payment.amount,
      date: payment.createdAt,
      method: payment.method || 'Cash'
    }));
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching recent payments:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}
