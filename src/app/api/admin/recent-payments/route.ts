import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get recent payments - adjust this query based on your schema
    const recentPayments = await db.payment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            firstName: true,
            surname: true,
            phoneNumber: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: recentPayments
    });
  } catch (error) {
    console.error('Recent payments API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recent payments' },
      { status: 500 }
    );
  }
}
