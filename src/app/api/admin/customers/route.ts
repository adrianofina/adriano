import { createHandler } from '@/lib/api-handler'
import { db } from '@/lib/db'

// GET /api/admin/customers - List all customers
export const GET = createHandler(async (req, context) => {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const skip = (page - 1) * limit

  // Build where clause
  const where: any = {}
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { surname: { contains: search, mode: 'insensitive' } },
      { phoneNumber: { contains: search } },
      { email: { contains: search, mode: 'insensitive' } },
      { customerId: { contains: search, mode: 'insensitive' } }
    ]
  }

  // Get customers with counts
  const [customers, total] = await Promise.all([
    db.customer.findMany({
      where,
      select: {
        id: true,
        customerId: true,
        firstName: true,
        surname: true,
        phoneNumber: true,
        email: true,
        city: true,
        region: true,
        createdAt: true,
        createdBy: { select: { name: true } },
        _count: { select: { loans: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    db.customer.count({ where })
  ])

  return {
    customers,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  }
}, { requireAuth: true })

// POST /api/admin/customers - Create new customer
export const POST = createHandler(async (req, context) => {
  const { user } = context
  const body = await req.json()

  console.log('Creating customer with data:', body)

  // Validate required fields
  if (!body.firstName || !body.surname || !body.phoneNumber) {
    throw new Error('First name, surname, and phone number are required')
  }

  // Check for duplicate phone number
  const existing = await db.customer.findUnique({
    where: { phoneNumber: body.phoneNumber }
  })
  
  if (existing) {
    throw new Error('Phone number already exists')
  }

  // Generate customer ID
  const year = new Date().getFullYear()
  const count = await db.customer.count()
  const customerId = `CUST-${year}-${(count + 1).toString().padStart(4, '0')}`

  // Create customer
  const customer = await db.customer.create({
    data: {
      customerId,
      firstName: body.firstName,
      surname: body.surname,
      middleName: body.middleName || null,
      phoneNumber: body.phoneNumber,
      alternativePhone: body.alternativePhone || null,
      email: body.email || null,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      gender: body.gender || null,
      address: body.address || null,
      city: body.city || null,
      region: body.region || null,
      occupation: body.occupation || null,
      employer: body.employer || null,
      monthlyIncome: body.monthlyIncome ? parseFloat(body.monthlyIncome) : null,
      businessName: body.businessName || null,
      maritalStatus: body.maritalStatus || null,
      dependents: body.dependents ? parseInt(body.dependents) : 0,
      nationalId: body.nationalId || null,
      bankName: body.bankName || null,
      accountNumber: body.accountNumber || null,
      mobileMoneyProvider: body.mobileMoneyProvider || null,
      mobileMoneyNumber: body.mobileMoneyNumber || null,
      createdById: user.id
    }
  })

  console.log('Customer created:', customer)

  // Create audit log
  await db.auditLog.create({
    data: {
      userId: user.id,
      userName: user.name || user.email,
      userRole: user.role,
      action: 'CREATE',
      entityType: 'CUSTOMER',
      entityId: customer.id,
      details: { customerId: customer.customerId }
    }
  })

  // Return the customer directly (will be wrapped in { success: true, data: customer })
  return customer
}, { requireAuth: true })
