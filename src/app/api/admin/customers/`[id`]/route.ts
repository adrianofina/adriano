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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication (temporarily allow any logged-in user)
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete customer and related data
    await prisma.$transaction(async (tx) => {
      // Delete payments through loans
      const loans = await tx.loan.findMany({
        where: { customerId: params.id }
      });
      
      for (const loan of loans) {
        await tx.payment.deleteMany({
          where: { loanId: loan.id }
        });
      }

      // Delete loans
      await tx.loan.deleteMany({
        where: { customerId: params.id }
      });

      // Delete customer
      await tx.customer.delete({
        where: { id: params.id }
      });
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
