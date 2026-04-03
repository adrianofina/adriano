import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthCookie, verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Get auth token
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Try to find customer by userId first (linked account)
    let customer = await db.customer.findFirst({
      where: { userId: user.id },
      include: { loans: { orderBy: { createdAt: 'desc' } } }
    });

    // If not found by userId, try by email
    if (!customer && user.email) {
      customer = await db.customer.findFirst({
        where: { email: user.email },
        include: { loans: { orderBy: { createdAt: 'desc' } } }
      });
      
      // Link the customer to the user
      if (customer && !customer.userId) {
        customer = await db.customer.update({
          where: { id: customer.id },
          data: { userId: user.id },
          include: { loans: { orderBy: { createdAt: 'desc' } } }
        });
      }
    }

    return NextResponse.json({ customer });

  } catch (error: any) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Find the customer first
    let customer = await db.customer.findFirst({
      where: { userId: user.id }
    });

    if (!customer && user.email) {
      customer = await db.customer.findFirst({
        where: { email: user.email }
      });
    }

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Update customer
    const updatedCustomer = await db.customer.update({
      where: { id: customer.id },
      data: {
        firstName: data.firstName,
        surname: data.surname,
        middleName: data.middleName,
        phoneNumber: data.phoneNumber,
        alternativePhone: data.alternativePhone,
        email: data.email,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        gender: data.gender,
        address: data.address,
        city: data.city,
        region: data.region,
        occupation: data.occupation,
        employer: data.employer,
        monthlyIncome: data.monthlyIncome,
        businessName: data.businessName,
        maritalStatus: data.maritalStatus,
        dependents: data.dependents,
        nationalId: data.nationalId,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        mobileMoneyProvider: data.mobileMoneyProvider,
        mobileMoneyNumber: data.mobileMoneyNumber,
      },
      include: { loans: { orderBy: { createdAt: 'desc' } } }
    });

    return NextResponse.json({ customer: updatedCustomer });

  } catch (error: any) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { email, firstName, surname, phoneNumber } = data;

    // Check if customer already exists
    const existing = await db.customer.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phoneNumber ? { phoneNumber } : {}
        ].filter(condition => Object.keys(condition).length > 0)
      }
    });

    if (existing) {
      // Link existing customer to user if not already linked
      if (!existing.userId) {
        await db.customer.update({
          where: { id: existing.id },
          data: { userId: user.id }
        });
      }
      return NextResponse.json({ customer: existing });
    }

    // Create new customer
    const year = new Date().getFullYear();
    const count = await db.customer.count();
    const customerId = `CUST-${year}-${(count + 1).toString().padStart(4, '0')}`;

    const customer = await db.customer.create({
      data: {
        customerId,
        userId: user.id,
        firstName: firstName || '',
        surname: surname || '',
        email: email || null,
        phoneNumber: phoneNumber || '',
        createdById: user.id,
        totalLoans: 0,
        activeLoans: 0,
        overdueLoans: 0,
        totalBorrowed: 0,
        totalRepaid: 0
      }
    });

    return NextResponse.json({ customer });

  } catch (error: any) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
