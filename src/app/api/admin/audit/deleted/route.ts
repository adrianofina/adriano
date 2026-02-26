import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthCookie, verifyToken } from '@/lib/auth';

export async function GET() {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all soft-deleted customers
    const deletedCustomers = await db.customer.findMany({
      where: {
        deletedAt: { not: null }
      },
      include: {
        deletedBy: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        deletedAt: 'desc'
      }
    });

    // Get deletion audit logs
    const deletionLogs = await db.auditLog.findMany({
      where: {
        action: 'SOFT_DELETE'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Combine and format
    const items = [
      ...deletedCustomers.map(c => ({
        id: c.id,
        entityType: 'Customer',
        entityName: `${c.firstName} ${c.surname}`,
        deletedBy: c.deletedBy?.name || 'Unknown',
        deletedByRole: c.deletedBy?.role || 'unknown',
        deletedAt: c.deletedAt,
        reason: c.deletionReason,
        details: {
          customerId: c.customerId,
          phone: c.phoneNumber,
          email: c.email,
          totalLoans: c.totalLoans,
          activeLoans: c.activeLoans
        }
      })),
      ...deletionLogs.map(log => ({
        id: log.id,
        entityType: log.details?.entityType || 'Unknown',
        entityName: log.details?.customerName || 'Unknown',
        deletedBy: log.user?.name || log.userName,
        deletedByRole: log.userRole,
        deletedAt: log.timestamp,
        reason: log.details?.reason,
        details: log.details
      }))
    ];

    // Sort by deletedAt
    items.sort((a, b) => 
      new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()
    );

    // Calculate stats
    const now = new Date();
    const today = new Date(now.setHours(0,0,0,0));
    const weekAgo = new Date(now.setDate(now.getDate() - 7));
    const monthAgo = new Date(now.setMonth(now.getMonth() - 1));

    const stats = {
      totalDeleted: items.length,
      deletedToday: items.filter(i => new Date(i.deletedAt) >= today).length,
      deletedThisWeek: items.filter(i => new Date(i.deletedAt) >= weekAgo).length,
      deletedThisMonth: items.filter(i => new Date(i.deletedAt) >= monthAgo).length
    };

    return NextResponse.json({
      success: true,
      items,
      stats
    });

  } catch (error) {
    console.error('Error fetching deleted items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deleted items' },
      { status: 500 }
    );
  }
}
