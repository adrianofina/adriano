import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthCookie, verifyToken } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📝 Creating loan for customer:', params?.id)
    
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

    const resolvedParams = await params
    const customerId = resolvedParams?.id
    const body = await request.json()

    // Validate required fields
    if (!body.amount || !body.purpose || !body.term || !body.interestRate) {
      return NextResponse.json(
        { success: false, error: 'Amount, purpose, term, and interest rate are required' },
        { status: 400 }
      )
    }

    const amount = parseFloat(body.amount)
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }

    // Check if customer exists
    const customer = await db.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Generate loan ID
    const year = new Date().getFullYear()
    const count = await db.loan.count()
    const loanId = `LOAN-${year}-${(count + 1).toString().padStart(4, '0')}`

    // Create loan
    const loan = await db.loan.create({
      data: {
        loanId,
        customerId,
        amount,
        purpose: body.purpose,
        term: parseInt(body.term),
        interestRate: parseFloat(body.interestRate),
        remainingBalance: amount,
        amountPaid: 0,
        status: body.status || 'active',
        stage: body.status === 'completed' ? 3 : body.status === 'pending' ? 1 : 2,
        createdById: user.id,
        ...(body.dueDate && { dueDate: new Date(body.dueDate) })
      }
    })

    // Update customer stats
    await db.customer.update({
      where: { id: customerId },
      data: {
        totalLoans: { increment: 1 },
        ...(loan.status === 'active' && { activeLoans: { increment: 1 } }),
        totalBorrowed: { increment: amount }
      }
    })

    return NextResponse.json({
      success: true,
      data: loan
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error creating loan:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const resolvedParams = await params
    const id = resolvedParams?.id

    const loans = await db.loan.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: loans
    })

  } catch (error) {
    console.error('Error fetching loans:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
