import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthCookie, verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    console.log('📋 GET /api/admin/customers/deleted called');
    
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

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'all';

    // Calculate date filters
    const now = new Date();
    const today = new Date(now.setHours(0,0,0,0));
    const weekAgo = new Date(now.setDate(now.getDate() - 7));
    const monthAgo = new Date(now.setMonth(now.getMonth() - 1));

    // Build where clause
    let where: any = {
      deletedAt: { not: null }
    };

    if (timeframe === 'today') {
      where.deletedAt = { gte: today };
    } else if (timeframe === 'week') {
      where.deletedAt = { gte: weekAgo };
    } else if (timeframe === 'month') {
      where.deletedAt = { gte: monthAgo };
    }

    // Get deleted customers
    const customers = await db.customer.findMany({
      where,
      include: {
        deletedBy: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            loans: true,
            documents: true
          }
        }
      },
      orderBy: {
        deletedAt: 'desc'
      }
    });

    // Calculate stats
    const stats = {
      totalDeleted: customers.length,
      deletedToday: customers.filter(c => c.deletedAt && new Date(c.deletedAt) >= today).length,
      deletedThisWeek: customers.filter(c => c.deletedAt && new Date(c.deletedAt) >= weekAgo).length,
      deletedThisMonth: customers.filter(c => c.deletedAt && new Date(c.deletedAt) >= monthAgo).length
    };

    // Format the response
    const formattedCustomers = customers.map(c => ({
      id: c.id,
      firstName: c.firstName,
      surname: c.surname,
      customerId: c.customerId,
      phoneNumber: c.phoneNumber,
      email: c.email,
      deletedAt: c.deletedAt,
      deletedBy: c.deletedBy,
      deletionReason: c.deletionReason,
      stats: {
        totalLoans: c._count.loans,
        documents: c._count.documents
      }
    }));

    return NextResponse.json({
      success: true,
      customers: formattedCustomers,
      stats
    });

  } catch (error) {
    console.error('Error fetching deleted customers:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
