import { createHandler } from '@/lib/api-handler'
import { db } from '@/lib/db'

// GET /api/admin/customers/[id]
export const GET = createHandler(async (req, context) => {
  // context.params contains the route parameters
  const { params } = context
  const id = params?.id
  
  console.log('🔍 Fetching customer:', id)

  if (!id) {
    throw new Error('Customer ID is required')
  }

  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true, email: true } }
    }
  })

  if (!customer) {
    throw new Error('Customer not found')
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

  return {
    ...customer,
    loans,
    stats
  }
}, { requireAuth: true })

// PUT /api/admin/customers/[id]
export const PUT = createHandler(async (req, context) => {
  const { params, user } = context
  const id = params?.id
  const body = await req.json()

  if (!id) {
    throw new Error('Customer ID is required')
  }

  // Check if customer exists
  const existing = await db.customer.findUnique({ where: { id } })
  if (!existing) {
    throw new Error('Customer not found')
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

  return customer
}, { requireAuth: true })

// DELETE /api/admin/customers/[id]
export const DELETE = createHandler(async (req, context) => {
  const { params, user } = context
  const id = params?.id

  if (!id) {
    throw new Error('Customer ID is required')
  }

  // Check if customer exists
  const customer = await db.customer.findUnique({ 
    where: { id },
    include: { loans: true }
  })

  if (!customer) {
    throw new Error('Customer not found')
  }

  // Check for active loans
  if (customer.activeLoans > 0) {
    throw new Error('Cannot delete customer with active loans')
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

  return { message: 'Customer deleted successfully' }
}, { requireAuth: true, requireRoles: ['super_admin'] })
