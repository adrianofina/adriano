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

export async function POST(request: Request) {
  try {
    // Verify authentication
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { customers } = await request.json();

    if (!customers || !Array.isArray(customers)) {
      return NextResponse.json(
        { error: 'Invalid customer data' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const customerData of customers) {
      try {
        // Generate customer ID
        const count = await prisma.customer.count();
        const customerId = `CUST-${String(count + 1).padStart(3, '0')}`;

        // Create customer
        const customer = await prisma.customer.create({
          data: {
            customerId,
            firstName: customerData.firstName,
            surname: customerData.surname,
            email: customerData.email,
            phoneNumber: customerData.phoneNumber,
            createdById: payload.id,
            totalLoans: customerData.loanAmount ? 1 : 0,
            activeLoans: customerData.loanAmount ? 1 : 0,
            totalBorrowed: customerData.loanAmount || 0,
          }
        });

        // Create loan if amount exists
        if (customerData.loanAmount) {
          const loanCount = await prisma.loan.count();
          const loanId = `L-${String(loanCount + 1).padStart(3, '0')}`;

          await prisma.loan.create({
            data: {
              loanId,
              customerId: customer.id,
              amount: customerData.loanAmount,
              purpose: customerData.loanPurpose || 'Business',
              term: 12,
              interestRate: 12,
              amountPaid: 0,
              remainingBalance: customerData.loanAmount,
              status: customerData.status || 'active',
              stage: 3,
              createdById: payload.id,
            }
          });
        }

        results.push(customer);
      } catch (err: any) {
        errors.push({
          customer: customerData,
          error: err.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      imported: results.length,
      failed: errors.length,
      errors
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
