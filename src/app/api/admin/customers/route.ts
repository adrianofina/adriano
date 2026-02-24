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

export async function GET(request: Request) {
  console.log('📋 GET /api/admin/customers called');
  
  try {
    // Check authentication
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
    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await prisma.customer.count();

    // Get customers - ONLY using fields that definitely exist
    const customers = await prisma.customer.findMany({
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
        // Remove fields that might not exist
        // activeLoans: true,
        // overdueLoans: true,
        // completedLoans: true,
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
    });

    console.log(`✅ Found ${customers.length} customers`);

    // Add computed status fields
    const customersWithStatus = customers.map(customer => ({
      ...customer,
      activeLoans: customer._count.loans, // You can compute this based on loan status later
      overdueLoans: 0, // Default for now
      completedLoans: 0 // Default for now
    }));

    return NextResponse.json({
      customers: customersWithStatus,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('❌ Customers API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('📝 Creating new customer...');
    
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.firstName || !body.surname || !body.phoneNumber) {
      return NextResponse.json(
        { error: 'First name, surname, and phone number are required' },
        { status: 400 }
      );
    }

    // Generate customer ID
    const year = new Date().getFullYear();
    const count = await prisma.customer.count();
    const customerId = `CUST-${year}-${(count + 1).toString().padStart(4, '0')}`;

    // Create customer - only include fields that exist
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
      },
      select: {
        id: true,
        customerId: true,
        firstName: true,
        surname: true,
        phoneNumber: true,
        email: true,
        createdAt: true
      }
    });

    return NextResponse.json(customer, { status: 201 });

  } catch (error) {
    console.error('❌ Create customer error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
