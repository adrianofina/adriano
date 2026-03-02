import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    console.log('📊 Counts API called');
    
    // Test database connection
    await db.$connect();
    console.log('✅ Database connected');
    
    // Get counts based on actual schema
    const totalCustomers = await db.customer.count();
    console.log('✅ Total customers:', totalCustomers);
    
    // Active customers = those with activeLoans > 0
    const activeCustomers = await db.customer.count({
      where: { 
        activeLoans: { gt: 0 },
        deletedAt: null
      }
    });
    console.log('✅ Active customers:', activeCustomers);
    
    // Overdue customers = those with overdueLoans > 0
    const overdueCustomers = await db.customer.count({
      where: { 
        overdueLoans: { gt: 0 },
        deletedAt: null
      }
    });
    console.log('✅ Overdue customers:', overdueCustomers);
    
    // Completed customers = those with totalLoans > 0 but activeLoans = 0 and not deleted
    const completedCustomers = await db.customer.count({
      where: { 
        totalLoans: { gt: 0 },
        activeLoans: 0,
        overdueLoans: 0,
        deletedAt: null
      }
    });
    console.log('✅ Completed customers:', completedCustomers);
    
    // Deleted customers = those with deletedAt not null
    const deletedCustomers = await db.customer.count({
      where: { 
        deletedAt: { not: null }
      }
    });
    console.log('✅ Deleted customers:', deletedCustomers);

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
    console.error('❌ Counts API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch counts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
