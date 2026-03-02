import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get counts for dashboard
    const [
      totalCustomers,
      activeCustomers,
      overdueCustomers,
      pendingApprovals
    ] = await Promise.all([
      db.customer.count(),
      db.customer.count({ where: { activeLoans: { gt: 0 }, deletedAt: null } }),
      db.customer.count({ where: { overdueLoans: { gt: 0 }, deletedAt: null } }),
      // Add your approvals count logic here
      Promise.resolve(0) // Placeholder for now
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        overdueCustomers,
        pendingApprovals,
        recentPayments: []
      }
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
