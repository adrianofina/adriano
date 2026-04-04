import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get all loans
    const allLoans = await db.loan.findMany();
    
    // Get all customers
    const totalCustomers = await db.customer.count({ where: { deletedAt: null } });
    
    // Calculate loan stats
    const totalLoans = allLoans.length;
    const activeLoans = allLoans.filter(l => l.status === 'active').length;
    const overdueLoans = allLoans.filter(l => l.status === 'overdue').length;
    const pendingLoans = allLoans.filter(l => l.status === 'pending').length;
    const completedLoans = allLoans.filter(l => l.status === 'completed' || l.status === 'paid').length;
    
    // Calculate financial stats
    const approvedLoans = allLoans.filter(l => ['active', 'overdue', 'completed'].includes(l.status));
    const totalDisbursed = approvedLoans.reduce((sum, l) => sum + (l.amount || 0), 0);
    const totalRepaid = approvedLoans.reduce((sum, l) => sum + (l.amountPaid || 0), 0);
    const outstanding = totalDisbursed - totalRepaid;
    
    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const loansToday = await db.loan.count({ where: { createdAt: { gte: today } } });
    const newCustomersToday = await db.customer.count({ where: { createdAt: { gte: today }, deletedAt: null } });
    const paymentsToday = await db.payment.count({ where: { createdAt: { gte: today } } });
    
    return NextResponse.json({
      success: true,
      data: {
        totalCustomers,
        activeLoans,
        overdueLoans,
        completedLoans,
        pendingLoans,
        totalLoans,
        totalDisbursed,
        totalRepaid,
        outstanding,
        loansToday,
        newCustomersToday,
        paymentsToday,
        portfolioAtRisk: overdueLoans
      }
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
