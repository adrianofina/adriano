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
    // Verify admin access
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || !['super_admin', 'admin'].includes(payload.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get all customers with their loan stats
    const customers = await prisma.customer.findMany({
      include: {
        loans: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate summary stats for each customer
    const customersWithStats = customers.map(customer => {
      const totalLoans = customer.loans.length;
      const activeLoans = customer.loans.filter(l => l.status === 'active').length;
      const overdueLoans = customer.loans.filter(l => l.status === 'overdue').length;
      const totalBorrowed = customer.loans.reduce((sum, l) => sum + l.amount, 0);
      const totalRepaid = customer.loans.reduce((sum, l) => sum + l.amountPaid, 0);

      return {
        id: customer.id,
        customerId: customer.customerId,
        firstName: customer.firstName,
        surname: customer.surname,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        creditScore: customer.creditScore || 650,
        totalLoans,
        activeLoans,
        overdueLoans,
        totalBorrowed,
        totalRepaid,
        createdAt: customer.createdAt
      };
    });

    return NextResponse.json({ customers: customersWithStats });

  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
