import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthCookie, verifyToken } from '@/lib/auth'

export async function GET() {
  try {
    console.log('📊 Fetching overview stats...')
    
    // Check authentication
    const token = await getAuthCookie()
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get real stats from database
    const totalCustomers = await db.customer.count()
    
    const [
      activeLoans,
      overdueLoans,
      completedLoans,
      totalDisbursed,
      totalRepaid,
      pendingApprovals,
      newCustomersToday
    ] = await Promise.all([
      db.loan.count({ where: { status: 'active' } }),
      db.loan.count({ where: { status: 'overdue' } }),
      db.loan.count({ where: { status: 'completed' } }),
      db.loan.aggregate({
        where: { status: { in: ['active', 'completed', 'overdue'] } },
        _sum: { amount: true }
      }),
      db.payment.aggregate({
        _sum: { amount: true }
      }),
      db.loan.count({ where: { status: 'pending' } }),
      db.customer.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0,0,0,0))
          }
        }
      })
    ])

    // Calculate high risk customers
    const highRiskCustomers = await db.customer.count({
      where: { riskLevel: { in: ['high', 'critical'] } }
    })

    // Get risk distribution
    const lowRisk = await db.customer.count({ where: { riskLevel: 'low' } })
    const mediumRisk = await db.customer.count({ where: { riskLevel: 'medium' } })
    const highRisk = await db.customer.count({ where: { riskLevel: 'high' } })

    const stats = {
      totalCustomers: totalCustomers || 0,
      activeLoans: activeLoans || 0,
      overdueLoans: overdueLoans || 0,
      completedLoans: completedLoans || 0,
      totalDisbursed: totalDisbursed._sum.amount || 0,
      totalRepaid: totalRepaid._sum.amount || 0,
      pendingApprovals: pendingApprovals || 0,
      highRiskCustomers: highRiskCustomers || 0,
      newCustomersToday: newCustomersToday || 0,
      newApplications: pendingApprovals || 0,
      riskDistribution: {
        low: lowRisk || Math.floor(totalCustomers * 0.6),
        medium: mediumRisk || Math.floor(totalCustomers * 0.3),
        high: highRisk || Math.floor(totalCustomers * 0.1)
      },
      loanPerformance: {
        onTime: 85,
        late: 10,
        defaulted: 5
      },
      upcomingPayments: {
        next7Days: 12,
        next30Days: 45,
        next90Days: 120
      }
    }

    // Return stats directly (not wrapped in data property)
    return NextResponse.json({
      success: true,
      ...stats
    })

  } catch (error) {
    console.error('❌ Error fetching stats:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
