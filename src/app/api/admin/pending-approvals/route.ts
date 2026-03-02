import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get pending approvals - adjust based on your approval system
    const pendingApprovals = await db.loan.count({
      where: { status: 'pending' }
    });

    return NextResponse.json({
      success: true,
      data: {
        count: pendingApprovals,
        items: []
      }
    });
  } catch (error) {
    console.error('Pending approvals API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pending approvals' },
      { status: 500 }
    );
  }
}
