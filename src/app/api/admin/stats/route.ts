import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // For backward compatibility, return same as counts API
    const totalCustomers = await db.customer.count();
    const activeCustomers = await db.customer.count({
      where: { activeLoans: { gt: 0 }, deletedAt: null }
    });
    const overdueCustomers = await db.customer.count({
      where: { overdueLoans: { gt: 0 }, deletedAt: null }
    });
    const completedCustomers = await db.customer.count({
      where: { 
        totalLoans: { gt: 0 },
        activeLoans: 0,
        overdueLoans: 0,
        deletedAt: null
      }
    });

    return NextResponse.json({
      success: true,
      totalCustomers,
      activeLoans: activeCustomers,
      overdueLoans: overdueCustomers,
      completedLoans: completedCustomers
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
