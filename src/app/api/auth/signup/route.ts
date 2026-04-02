import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword, getRoleFromEmail, generateToken, setAuthCookie } from '@/lib/auth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, phoneNumber } = body;

    console.log('Signup attempt for:', { email, phoneNumber });

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists by email (if provided)
    let existingUser = null;
    if (email) {
      existingUser = await prisma.user.findUnique({
        where: { email }
      });
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Determine role from email (or default to customer)
    const { role, isStaff } = email ? getRoleFromEmail(email) : { role: 'customer', isStaff: false };

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user (email optional!)
    const user = await prisma.user.create({
      data: {
        email: email || null,
        password: hashedPassword,
        name: name || (email ? email.split('@')[0] : 'Customer'),
        role,
        isStaff,
      }
    });

    console.log('User created:', user.id);

    // Check if customer already exists by email OR phone
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phoneNumber ? { phoneNumber } : {}
        ].filter(condition => Object.keys(condition).length > 0)
      }
    });

    let customer;
    
    if (existingCustomer) {
      // Link user to existing customer
      customer = await prisma.customer.update({
        where: { id: existingCustomer.id },
        data: {
          userId: user.id,
          // Update missing fields
          email: existingCustomer.email || email,
          phoneNumber: existingCustomer.phoneNumber || phoneNumber,
          // Update name if missing and user provided one
          firstName: existingCustomer.firstName || (name?.split(' ')[0] || ''),
          surname: existingCustomer.surname || (name?.split(' ')[1] || '')
        }
      });
      
      console.log('Linked user to existing customer by',
        existingCustomer.email === email ? 'email' : 'phone');
    } else {
      // Create new customer
      const year = new Date().getFullYear();
      const count = await prisma.customer.count();
      const customerId = `CUST-${year}-${(count + 1).toString().padStart(4, '0')}`;
      
      customer = await prisma.customer.create({
        data: {
          customerId,
          userId: user.id,
          firstName: name?.split(' ')[0] || '',
          surname: name?.split(' ')[1] || '',
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
      
      console.log('Created new customer:', customer.id);
    }

    // Generate token
    const token = generateToken({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    });

    // Set cookie
    await setAuthCookie(token);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      customer,
      message: existingCustomer ? 'Account linked successfully' : 'Account created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
