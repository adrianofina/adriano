import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthCookie, verifyToken } from '@/lib/auth'

export async function GET() {
  try {
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

    // Get all loans with customer info
    const loans = await db.loan.findMany({
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            surname: true,
            customerId: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get count of loans
    const count = await db.loan.count()

    return NextResponse.json({
      success: true,
      data: {
        totalLoans: count,
        loans: loans
      }
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
