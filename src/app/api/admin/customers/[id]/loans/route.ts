import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createApiHandler, successResponse, errorResponse } from '@/lib/api-base'

// GET /api/admin/customers/[id]/loans
export const GET = createApiHandler(async (req, { params }) => {
  const { id } = params

  const loans = await db.loan.findMany({
    where: { customerId: id },
    orderBy: { createdAt: 'desc' },
    include: {
      payments: {
        orderBy: { receivedAt: 'desc' },
        take: 5
      }
    }
  })

  return successResponse(loans)
}, { requireAuth: true, validateId: true })

// POST /api/admin/customers/[id]/loans
export const POST = createApiHandler(async (req, { params }) => {
  const { id, user } = params
  const body = await req.json()

  // Validate required fields
  if (!body.amount || !body.purpose || !body.term || !body.interestRate) {
    return errorResponse('Amount, purpose, term, and interest rate are required', 400)
  }

  // Validate amount
  const amount = parseFloat(body.amount)
  if (isNaN(amount) || amount <= 0) {
    return errorResponse('Amount must be a positive number', 400)
  }

  // Check if customer exists
  const customer = await db.customer.findUnique({
    where: { id }
  })

  if (!customer) {
    return errorResponse('Customer not found', 404)
  }

  // Generate loan ID
  const year = new Date().getFullYear()
  const count = await db.loan.count()
  const loanId = `LOAN-${year}-${(count + 1).toString().padStart(4, '0')}`

  // Calculate fields
  const amountPaid = parseFloat(body.amountPaid) || 0
  const remainingBalance = amount - amountPaid

  // Create loan
  const loan = await db.loan.create({
    data: {
      loanId,
      customerId: id,
      amount,
      purpose: body.purpose,
      term: parseInt(body.term),
      interestRate: parseFloat(body.interestRate),
      remainingBalance,
      amountPaid,
      status: body.status || 'active',
      stage: body.status === 'completed' ? 3 : body.status === 'pending' ? 1 : 2,
      createdById: user.id,
      ...(body.dueDate && { dueDate: new Date(body.dueDate) }),
      ...(body.notes && { notes: body.notes }),
      ...(body.disbursedAt && { disbursedAt: new Date(body.disbursedAt) }),
      ...(body.completedAt && { completedAt: new Date(body.completedAt) })
    }
  })

  // Create audit log
  await db.auditLog.create({
    data: {
      userId: user.id,
      userName: user.name || user.email,
      userRole: user.role,
      action: 'CREATE',
      entityType: 'LOAN',
      entityId: loan.id,
      details: {
        loanId: loan.loanId,
        amount: loan.amount,
        customerId: id
      }
    }
  })

  return successResponse(loan, 201)
}, { requireAuth: true, validateId: true })
