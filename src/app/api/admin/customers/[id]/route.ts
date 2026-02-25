import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthCookie, verifyToken } from '@/lib/auth'
import { handleApiError, successResponse, AppError } from '@/lib/error-handler'

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
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
    }

    const user = verifyToken(token)
    if (!user) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
    }

    // IMPORTANT: Await params if it's a Promise
    const resolvedParams = await params
    const id = resolvedParams?.id
    
    console.log('🔍 Resolved ID:', id)

    if (!id) {
      throw new AppError('Customer ID is required', 400, 'MISSING_ID')
    }

    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true, email: true } }
      }
    })

    if (!customer) {
      throw new AppError('Customer not found', 404, 'NOT_FOUND')
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

    return successResponse({
      ...customer,
      loans,
      stats
    })

  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/admin/customers/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📝 PUT /api/admin/customers/[id] called')
    
    // Check authentication
    const token = await getAuthCookie()
    if (!token) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
    }

    const user = verifyToken(token)
    if (!user) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
    }

    const resolvedParams = await params
    const id = resolvedParams?.id
    
    if (!id) {
      throw new AppError('Customer ID is required', 400, 'MISSING_ID')
    }

    const body = await request.json()

    // Check if customer exists
    const existing = await db.customer.findUnique({ where: { id } })
    if (!existing) {
      throw new AppError('Customer not found', 404, 'NOT_FOUND')
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

    return successResponse(customer)

  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/admin/customers/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🗑️ DELETE /api/admin/customers/[id] called')
    
    // Check authentication
    const token = await getAuthCookie()
    if (!token) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
    }

    const user = verifyToken(token)
    if (!user) {
      throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')
    }

    // Only super_admin can delete
    if (user.role !== 'super_admin') {
      throw new AppError('Only super administrators can delete customers', 403, 'FORBIDDEN')
    }

    const resolvedParams = await params
    const id = resolvedParams?.id
    
    if (!id) {
      throw new AppError('Customer ID is required', 400, 'MISSING_ID')
    }

    // Check if customer exists
    const customer = await db.customer.findUnique({ 
      where: { id },
      include: { loans: true }
    })

    if (!customer) {
      throw new AppError('Customer not found', 404, 'NOT_FOUND')
    }

    // Check for active loans
    if (customer.activeLoans > 0) {
      throw new AppError('Cannot delete customer with active loans', 400, 'ACTIVE_LOANS')
    }

    // Delete customer
    await db.customer.delete({ where: { id } })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name || user.email,
        userRole: user.role,
        action: 'DELETE',
        entityType: 'CUSTOMER',
        entityId: id,
        details: { 
          deletedCustomer: `${customer.firstName} ${customer.surname}`,
          deletedBy: user.name
        }
      }
    })

    return successResponse({ message: 'Customer deleted successfully' })

  } catch (error) {
    return handleApiError(error)
  }
}
