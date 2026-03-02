import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthCookie, verifyToken } from '@/lib/auth';

// GET - List customers
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
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch customers' }, { status: 500 });
  }
}

// POST - Create new customer
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
    console.log('Body received:', body);

    // Generate customer ID
    const year = new Date().getFullYear();
    const count = await db.customer.count();
    const customerId = `CUST-${year}-${(count + 1).toString().padStart(4, '0')}`;

    // Create customer (without audit log for now)
    const customer = await db.customer.create({
      data: {
        customerId,
        firstName: body.firstName,
        surname: body.surname,
        phoneNumber: body.phoneNumber,
        email: body.email,
        gender: body.gender,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        createdById: user.id,
        totalLoans: 0,
        activeLoans: 0,
        overdueLoans: 0,
        totalBorrowed: 0,
        totalRepaid: 0
      }
    });

    console.log('✅ Customer created:', customer.id);
    return NextResponse.json({ success: true, data: customer }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
