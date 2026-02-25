import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthCookie, verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    console.log('👥 Fetching recent customers...')
    
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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    // Get recent customers
    const customers = await db.customer.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        customerId: true,
        firstName: true,
        surname: true,
        phoneNumber: true,
        email: true,
        city: true,
        region: true,
        creditScore: true,
        riskLevel: true,
        createdAt: true
      }
    })

    console.log(`✅ Found ${customers.length} recent customers`)

    // Get their latest loans
    const customersWithLoans = await Promise.all(
      customers.map(async (customer) => {
        const latestLoan = await db.loan.findFirst({
          where: { customerId: customer.id },
          orderBy: { createdAt: 'desc' },
          select: {
            amount: true,
            amountPaid: true,
            status: true,
            dueDate: true
          }
        })

        return {
          ...customer,
          loanAmount: latestLoan?.amount || 0,
          paidAmount: latestLoan?.amountPaid || 0,
          loanStatus: latestLoan?.status || 'pending',
          dueDate: latestLoan?.dueDate,
          progress: latestLoan?.amount 
            ? Math.round((latestLoan.amountPaid / latestLoan.amount) * 100) 
            : 0
        }
      })
    )

    return NextResponse.json({
      success: true,
      customers: customersWithLoans
    })

  } catch (error) {
    console.error('❌ Error fetching recent customers:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
