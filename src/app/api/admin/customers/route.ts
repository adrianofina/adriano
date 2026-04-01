import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthCookie, verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const customers = await db.customer.findMany({
      where: { deletedAt: null },
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
        _count: { select: { loans: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    console.error('❌ Customers API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    console.log('📝 POST /api/admin/customers called');

    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
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

    // Check for duplicate phone number (only if provided)
    const existingPhone = await db.customer.findFirst({
      where: { phoneNumber: body.phoneNumber, deletedAt: null }
    });

    if (existingPhone) {
      return NextResponse.json(
        { success: false, error: 'A customer with this phone number already exists' },
        { status: 409 }
      );
    }

    // Check for duplicate email if provided
    if (body.email && body.email.trim() !== '') {
      const existingEmail = await db.customer.findFirst({
        where: { email: body.email, deletedAt: null }
      });

      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: 'A customer with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Check for duplicate National ID ONLY if provided (not empty)
    if (body.nationalId && body.nationalId.trim() !== '') {
      const existingNationalId = await db.customer.findFirst({
        where: { nationalId: body.nationalId, deletedAt: null }
      });

      if (existingNationalId) {
        return NextResponse.json(
          { success: false, error: 'A customer with this National ID already exists' },
          { status: 409 }
        );
      }
    }

    // Generate customer ID
    const year = new Date().getFullYear();
    const count = await db.customer.count();
    const customerId = `CUST-${year}-${(count + 1).toString().padStart(4, '0')}`;

    // Prepare data - set empty strings to null
    const nationalId = body.nationalId && body.nationalId.trim() !== '' ? body.nationalId : null;
    const email = body.email && body.email.trim() !== '' ? body.email : null;
    const alternativePhone = body.alternativePhone && body.alternativePhone.trim() !== '' ? body.alternativePhone : null;
    const businessName = body.businessName && body.businessName.trim() !== '' ? body.businessName : null;
    const employer = body.employer && body.employer.trim() !== '' ? body.employer : null;
    const address = body.address && body.address.trim() !== '' ? body.address : null;
    const city = body.city && body.city.trim() !== '' ? body.city : null;
    const region = body.region && body.region.trim() !== '' ? body.region : null;
    const occupation = body.occupation && body.occupation.trim() !== '' ? body.occupation : null;
    const bankName = body.bankName && body.bankName.trim() !== '' ? body.bankName : null;
    const accountNumber = body.accountNumber && body.accountNumber.trim() !== '' ? body.accountNumber : null;
    const mobileMoneyNumber = body.mobileMoneyNumber && body.mobileMoneyNumber.trim() !== '' ? body.mobileMoneyNumber : null;

    // Create customer
    const customer = await db.customer.create({
      data: {
        customerId,
        firstName: body.firstName,
        surname: body.surname,
        middleName: body.middleName,
        phoneNumber: body.phoneNumber,
        alternativePhone,
        email,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        gender: body.gender,
        address,
        city,
        region,
        occupation,
        employer,
        monthlyIncome: body.monthlyIncome ? parseFloat(body.monthlyIncome) : null,
        businessName,
        maritalStatus: body.maritalStatus,
        dependents: body.dependents ? parseInt(body.dependents) : 0,
        nationalId,
        bankName,
        accountNumber,
        mobileMoneyProvider: body.mobileMoneyProvider,
        mobileMoneyNumber,
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

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        userName: user.email,
        userRole: user.role,
        action: 'CREATE',
        entityType: 'Customer',
        entityId: customer.id,
        details: {
          customerId: customer.customerId,
          firstName: customer.firstName,
          surname: customer.surname,
          phoneNumber: customer.phoneNumber
        }
      }
    });

    console.log('✅ Customer created successfully:', customer.id);
    return NextResponse.json({ success: true, data: customer }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error creating customer:', error);
    
    // Check for Prisma unique constraint errors
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target && target.includes('nationalId')) {
        return NextResponse.json(
          { success: false, error: 'A customer with this National ID already exists' },
          { status: 409 }
        );
      }
      if (target && target.includes('phoneNumber')) {
        return NextResponse.json(
          { success: false, error: 'A customer with this phone number already exists' },
          { status: 409 }
        );
      }
      if (target && target.includes('email')) {
        return NextResponse.json(
          { success: false, error: 'A customer with this email already exists' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create customer' },
      { status: 500 }
    );
  }
}
