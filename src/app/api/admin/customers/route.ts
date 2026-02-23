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
    const region = searchParams.get('region') || 'all';
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

    // Region filter
    if (region !== 'all') {
      where.region = region;
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
          occupation: true,
          employer: true,
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
    console.log('📝 Creating new customer...');
    
    // Check authentication
    const token = await getAuthCookie();
    if (!token) {
      console.log('❌ No token found');
      return NextResponse.json(
        { error: 'Please login first' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      console.log('❌ Invalid token');
      return NextResponse.json(
        { error: 'Your session has expired. Please login again.' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.id, user.role);

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('📦 Request body received');
    } catch (e) {
      console.error('❌ Failed to parse request body:', e);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    const missingFields = [];
    if (!body.firstName) missingFields.push('First name');
    if (!body.surname) missingFields.push('Surname');
    if (!body.phoneNumber) missingFields.push('Phone number');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Helper function to calculate age from date of birth
    function calculateAge(dateOfBirth: Date): number {
      const today = new Date();
      let age = today.getFullYear() - dateOfBirth.getFullYear();
      const monthDiff = today.getMonth() - dateOfBirth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
        age--;
      }
      return age;
    }

    // Age validation if date of birth is provided
    if (body.dateOfBirth) {
      const dob = new Date(body.dateOfBirth);
      if (isNaN(dob.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date of birth format' },
          { status: 400 }
        );
      }

      const age = calculateAge(dob);
      if (age < 18) {
        return NextResponse.json(
          { error: 'Customer must be at least 18 years old' },
          { status: 400 }
        );
      }
      body.age = age;
    }

    // Phone number format validation
    const phoneRegex = /^[0-9]{10,12}$/;
    if (!phoneRegex.test(body.phoneNumber.replace(/\D/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Please use 10-12 digits.' },
        { status: 400 }
      );
    }

    // Check if phone number already exists
    try {
      const existingPhone = await prisma.customer.findUnique({
        where: { phoneNumber: body.phoneNumber }
      });

      if (existingPhone) {
        return NextResponse.json(
          { error: 'A customer with this phone number already exists' },
          { status: 400 }
        );
      }
    } catch (dbError) {
      console.error('❌ Database error checking phone:', dbError);
      return NextResponse.json(
        { error: 'Database error - please try again' },
        { status: 500 }
      );
    }

    // Check if email already exists (if provided)
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }

      try {
        const existingEmail = await prisma.customer.findUnique({
          where: { email: body.email }
        });

        if (existingEmail) {
          return NextResponse.json(
            { error: 'A customer with this email already exists' },
            { status: 400 }
          );
        }
      } catch (dbError) {
        console.error('❌ Database error checking email:', dbError);
        return NextResponse.json(
          { error: 'Database error - please try again' },
          { status: 500 }
        );
      }
    }

    // Generate customer ID
    const year = new Date().getFullYear();
    let count;
    try {
      count = await prisma.customer.count();
      console.log('📊 Current customer count:', count);
    } catch (dbError) {
      console.error('❌ Database error getting count:', dbError);
      return NextResponse.json(
        { error: 'Database error - please try again' },
        { status: 500 }
      );
    }

    const customerId = `CUST-${year}-${(count + 1).toString().padStart(4, '0')}`;
    console.log('🏷️ Generated customer ID:', customerId);

    // Create customer
    let customer;
    try {
      console.log('💾 Creating customer in database...');
      customer = await prisma.customer.create({
        data: {
          customerId,
          firstName: body.firstName.trim(),
          surname: body.surname.trim(),
          middleName: body.middleName?.trim() || null,
          phoneNumber: body.phoneNumber,
          alternativePhone: body.alternativePhone || null,
          email: body.email?.toLowerCase().trim() || null,
          dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
          age: body.age || null,
          gender: body.gender || null,
          address: body.address?.trim() || null,
          city: body.city?.trim() || null,
          region: body.region?.trim() || null,
          occupation: body.occupation?.trim() || null,
          employer: body.employer?.trim() || null,
          monthlyIncome: body.monthlyIncome ? parseFloat(body.monthlyIncome) : null,
          businessName: body.businessName?.trim() || null,
          maritalStatus: body.maritalStatus || null,
          dependents: body.dependents ? parseInt(body.dependents) : 0,
          nationalId: body.nationalId?.trim() || null,
          bankName: body.bankName?.trim() || null,
          accountNumber: body.accountNumber?.trim() || null,
          mobileMoneyProvider: body.mobileMoneyProvider || null,
          mobileMoneyNumber: body.mobileMoneyNumber || null,
          createdById: user.id
        }
      });
      console.log('✅ Customer created successfully:', customer.id);
    } catch (dbError) {
      console.error('❌ Database error creating customer:', dbError);
      return NextResponse.json(
        { error: 'Failed to create customer. Please check all fields and try again.' },
        { status: 500 }
      );
    }

    // Create audit log
    try {
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
            phone: customer.phoneNumber,
            age: customer.age
          }
        }
      });
      console.log('📝 Audit log created');
    } catch (auditError) {
      console.error('⚠️ Audit log failed:', auditError);
      // Don't fail the request if audit log fails
    }

    return NextResponse.json(customer, { status: 201 });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
