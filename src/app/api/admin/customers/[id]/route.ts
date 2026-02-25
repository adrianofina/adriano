import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthCookie, verifyToken } from '@/lib/auth'

// GET /api/admin/customers/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 GET /api/admin/customers/[id] called')
    
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
    const id = resolvedParams?.id

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Get customer with createdBy info
    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true, email: true } }
      }
    })

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Get loans - make sure we're fetching them correctly
    const loans = await db.loan.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📊 Found ${loans.length} loans for customer ${id}`)

    // Calculate stats
    const activeLoans = loans.filter(l => l.status === 'active').length
    const overdueLoans = loans.filter(l => l.status === 'overdue').length
    const completedLoans = loans.filter(l => l.status === 'completed').length
    const totalBorrowed = loans.reduce((sum, l) => sum + l.amount, 0)
    const totalRepaid = loans.reduce((sum, l) => sum + l.amountPaid, 0)

    const stats = {
      activeLoans,
      overdueLoans,
      completedLoans,
      totalBorrowed,
      totalRepaid,
      loanCount: loans.length
    }

    // Return complete data
    return NextResponse.json({
      success: true,
      data: {
        ...customer,
        loans: loans, // Explicitly include loans
        stats
      }
    })

  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// PUT /api/admin/customers/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📝 PUT /api/admin/customers/[id] called')
    
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
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Check if customer exists
    const existing = await db.customer.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Update customer
    const customer = await db.customer.update({
      where: { id },
      data: {
        firstName: body.firstName,
        surname: body.surname,
        middleName: body.middleName,
        phoneNumber: body.phoneNumber,
        alternativePhone: body.alternativePhone,
        email: body.email,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        gender: body.gender,
        address: body.address,
        city: body.city,
        region: body.region,
        occupation: body.occupation,
        employer: body.employer,
        monthlyIncome: body.monthlyIncome ? parseFloat(body.monthlyIncome) : null,
        businessName: body.businessName,
        maritalStatus: body.maritalStatus,
        dependents: body.dependents ? parseInt(body.dependents) : 0,
        nationalId: body.nationalId,
        bankName: body.bankName,
        accountNumber: body.accountNumber,
        mobileMoneyProvider: body.mobileMoneyProvider,
        mobileMoneyNumber: body.mobileMoneyNumber
      }
    })

    return NextResponse.json({
      success: true,
      data: customer
    })

  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
