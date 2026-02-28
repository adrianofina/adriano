import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get REAL counts from database using your existing db instance
    const [
      totalCustomers,
      activeCustomers,
      overdueCustomers,
      completedCustomers,
      deletedCustomers
    ] = await Promise.all([
      db.customer.count(),
      db.customer.count({ where: { status: 'active' } }),
      db.customer.count({ where: { status: 'overdue' } }),
      db.customer.count({ where: { status: 'completed' } }),
      db.customer.count({ where: { isDeleted: true } })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total: totalCustomers,
        active: activeCustomers,
        overdue: overdueCustomers,
        completed: completedCustomers,
        deleted: deletedCustomers
      }
    });
  } catch (error) {
    console.error('Error fetching counts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch counts' },
      { status: 500 }
    );
  }
}
