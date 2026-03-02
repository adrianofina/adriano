import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get loans ready for disbursement
    const readyForDisbursement = await db.loan.count({
      where: { 
        status: 'approved',
        disbursedAt: null
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        count: readyForDisbursement,
        items: []
      }
    });
  } catch (error) {
    console.error('Ready for disbursement API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ready for disbursement' },
      { status: 500 }
    );
  }
}
