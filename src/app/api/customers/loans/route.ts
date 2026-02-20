import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { getAuthCookie, verifyToken } from '@/lib/auth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    // Get current user from token
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ loans: [] });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ loans: [] });
    }

    // Find customer by email
    const customer = await prisma.customer.findFirst({
      where: { email: payload.email }
    });

    if (!customer) {
      return NextResponse.json({ loans: [] });
    }

    // Get customer's loans
    const loans = await prisma.loan.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ loans });

  } catch (error: any) {
    console.error('Error fetching loans:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
