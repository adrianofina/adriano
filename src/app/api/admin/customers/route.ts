import { NextResponse } from 'next/server';
import pkg from '@prisma/client';
import pkg2 from 'pg';
const { PrismaClient } = pkg;
const { Pool } = pkg2;
import { PrismaPg } from '@prisma/adapter-pg';
import { getAuthCookie, verifyToken } from '@/lib/auth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET /api/admin/customers - List all customers with pagination
export async function GET(request: Request) {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { surname: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { customerId: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Status filter
    if (status !== 'all') {
      if (status === 'active') where.activeLoans = { gt: 0 };
      if (status === 'overdue') where.overdueLoans = { gt: 0 };
      if (status === 'completed') where.completedLoans = { gt: 0 };
      if (status === 'new') {
        where.activeLoans = 0;
        where.completedLoans = 0;
      }
    }

    // Get customers with counts
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        select: {
          id: true,
          customerId: true,
          firstName: true,
          surname: true,
          middleName: true,
          phoneNumber: true,
          email: true,
          city: true,
          region: true,
          createdAt: true,
          activeLoans: true,
          overdueLoans: true,
          completedLoans: true,
          totalLoans: true,
          createdBy: {
            select: {
              name: true
            }
          },
          _count: {
            select: {
              loans: true,
              documents: true,
              courtCases: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.customer.count({ where })
    ]);

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Customers API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST /api/admin/customers - Create new customer
export async function POST(request: Request) {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.firstName || !body.surname || !body.phoneNumber) {
      return NextResponse.json(
        { error: 'First name, surname, and phone number are required' },
        { status: 400 }
      );
    }

    // Check if phone number already exists
    const existingPhone = await prisma.customer.findUnique({
      where: { phoneNumber: body.phoneNumber }
    });

    if (existingPhone) {
      return NextResponse.json(
        { error: 'A customer with this phone number already exists' },
        { status: 400 }
      );
    }

    // Check if email already exists (if provided)
    if (body.email) {
      const existingEmail = await prisma.customer.findUnique({
        where: { email: body.email }
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: 'A customer with this email already exists' },
          { status: 400 }
        );
      }
    }

    // Generate customer ID
    const year = new Date().getFullYear();
    const count = await prisma.customer.count();
    const customerId = `CUST-${year}-${(count + 1).toString().padStart(4, '0')}`;

    // Create customer
    const customer = await prisma.customer.create({
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
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name || user.email,
        userRole: user.role,
        action: 'CREATE',
        entityType: 'CUSTOMER',
        entityId: customer.id,
        details: {
          customerId: customer.customerId,
          name: `${customer.firstName} ${customer.surname}`,
          phone: customer.phoneNumber
        }
      }
    });

    return NextResponse.json(customer, { status: 201 });

  } catch (error) {
    console.error('Create customer error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
