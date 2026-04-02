import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthCookie, verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');

    // Check authentication (user must be logged in)
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

    // Find customer by email OR phone OR by userId
    let customer = null;
    
    if (email) {
      customer = await db.customer.findFirst({
        where: { email },
        include: { loans: { orderBy: { createdAt: 'desc' } } }
      });
    }
    
    if (!customer && phone) {
      customer = await db.customer.findFirst({
        where: { phoneNumber: phone },
        include: { loans: { orderBy: { createdAt: 'desc' } } }
      });
    }
    
    // If not found by email/phone, try by userId (linked account)
    if (!customer && user.id) {
      customer = await db.customer.findFirst({
        where: { userId: user.id },
        include: { loans: { orderBy: { createdAt: 'desc' } } }
      });
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

    // Check if customer already exists by email or phone
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
