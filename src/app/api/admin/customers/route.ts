import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthCookie, verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    console.log('📋 GET /api/admin/customers called');
    
    // Check authentication
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get ONLY customers that are NOT deleted
    const customers = await db.customer.findMany({
      where: {
        deletedAt: null  // This filters out soft-deleted customers
      },
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
        _count: {
          select: {
            loans: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Found ${customers.length} active customers`);

    return NextResponse.json({
      success: true,
      data: customers
    });

  } catch (error) {
    console.error('❌ Customers API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    console.log('📝 POST /api/admin/customers called');
    
    // Check authentication
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log('📦 Request body:', body);

    // Validate required fields
    if (!body.firstName || !body.surname || !body.phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'First name, surname, and phone number are required' },
        { status: 400 }
      );
    }

    // Generate customer ID
    const year = new Date().getFullYear();
    const count = await db.customer.count();
    const customerId = `CUST-${year}-${(count + 1).toString().padStart(4, '0')}`;

    // Create customer
    const customer = await db.customer.create({
      data: {
        customerId,
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
        mobileMoneyNumber: body.mobileMoneyNumber,
        creditScore: body.creditScore ? parseInt(body.creditScore) : 0,
        riskLevel: body.riskLevel || 'medium',
        category: body.category || 'Standard',
        createdById: user.id,
        totalLoans: 0,
        activeLoans: 0,
        overdueLoans: 0,
        totalBorrowed: 0,
        totalRepaid: 0
      }
    });

   // Create audit log - temporarily disabled until we fix the schema
// await db.auditLog.create({
//   data: {
//     userId: user.id,
//     action: 'CREATE',
//     entityType: 'Customer',
//     entityId: customer.id,
//     after: JSON.stringify(customer),
//     metadata: { customerId: customer.customerId }
//   }
// });
    console.log('✅ Customer created successfully:', customer.id);
    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
