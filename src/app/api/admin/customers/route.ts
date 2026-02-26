import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthCookie, verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    console.log('📋 GET /api/admin/customers called');
    
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

    // Get all customers (no deletedAt filter since field doesn't exist yet)
    const customers = await db.customer.findMany({
      select: {
        id: true,
        customerId: true,
        firstName: true,
        surname: true,
        phoneNumber: true,
        email: true,
        city: true,
        region: true,
        createdAt: true,
        _count: {
          select: {
            loans: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Found ${customers.length} customers`);

    return NextResponse.json({
      success: true,
      data: customers
    });

  } catch (error) {
    console.error('❌ Customers API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
