import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthCookie, verifyToken } from '@/lib/auth'

// GET /api/admin/customers/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Log what we receive
    console.log('🔍 API Received - params:', params)
    console.log('🔍 API Received - id:', params?.id)
    
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

    // IMPORTANT: In Next.js App Router, params is a Promise that resolves to an object
    // We need to await it if it's a Promise
    const resolvedParams = await params
    const id = resolvedParams?.id
    
    console.log('🔍 Resolved ID:', id)

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      )
    }

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

    // Get loans
    const loans = await db.loan.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate stats
    const stats = {
      activeLoans: loans.filter(l => l.status === 'active').length,
      overdueLoans: loans.filter(l => l.status === 'overdue').length,
      completedLoans: loans.filter(l => l.status === 'completed').length,
      totalBorrowed: loans.reduce((sum, l) => sum + l.amount, 0),
      totalRepaid: loans.reduce((sum, l) => sum + l.amountPaid, 0),
      loanCount: loans.length
    }

    return NextResponse.json({
      success: true,
      data: {
        ...customer,
        loans,
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
    // IMPORTANT: Await params
    const resolvedParams = await params
    const id = resolvedParams?.id
    
    console.log('📝 PUT ID:', id)

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      )
    }

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

    const body = await request.json()
    console.log('📝 Body:', body)

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

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name || user.email,
        userRole: user.role,
        action: 'UPDATE',
        entityType: 'CUSTOMER',
        entityId: customer.id,
        details: { changes: body }
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
