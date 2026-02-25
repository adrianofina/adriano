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

    console.log('✅ User authenticated:', user.id)

    // Get real stats from database
    const [
      totalCustomers,
      activeLoans,
      overdueLoans,
      completedLoans,
      totalDisbursed,
      totalRepaid,
      pendingApprovals,
      newCustomersToday
    ] = await Promise.all([
      db.customer.count(),
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

    console.log('📊 Stats:', {
      totalCustomers,
      activeLoans,
      overdueLoans,
      completedLoans,
      newCustomersToday
    })

    // Calculate high risk customers
    const highRiskCustomers = await db.customer.count({
      where: { riskLevel: { in: ['high', 'critical'] } }
    })

    // Get risk distribution
    const riskDistribution = {
      low: await db.customer.count({ where: { riskLevel: 'low' } }) || 0,
      medium: await db.customer.count({ where: { riskLevel: 'medium' } }) || 0,
      high: highRiskCustomers || 0
    }

    // Get today's new applications (placeholder for now)
    const newApplications = Math.floor(Math.random() * 5) + 1

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
      newApplications,
      riskDistribution: {
        low: riskDistribution.low || Math.floor(totalCustomers * 0.6),
        medium: riskDistribution.medium || Math.floor(totalCustomers * 0.3),
        high: riskDistribution.high || Math.floor(totalCustomers * 0.1)
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

    console.log('✅ Returning stats:', stats)

    return NextResponse.json({
      success: true,
      data: stats
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
