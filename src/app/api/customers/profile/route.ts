import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find customer by email
    const customer = await prisma.customer.findFirst({
      where: { email },
      include: {
        loans: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

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
    const data = await request.json();
    const { email, firstName, surname, phoneNumber } = data;

    // Check if customer already exists
    const existing = await prisma.customer.findFirst({
      where: { email }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Customer already exists' },
        { status: 400 }
      );
    }

    // Create new customer
    const customer = await prisma.customer.create({
      data: {
        customerId: `CUST-${Date.now()}`,
        firstName,
        surname,
        email,
        phoneNumber: phoneNumber || '',
        createdById: (await prisma.user.findFirst({ where: { email } }))?.id || '',
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
