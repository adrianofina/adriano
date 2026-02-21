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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        loans: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Get audit logs
    const auditLogs = await prisma.auditLog.findMany({
      where: { entityId: customer.id },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    return NextResponse.json({ 
      customer: {
        ...customer,
        auditLogs
      }
    });

  } catch (error: any) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    const data = await request.json();

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        firstName: data.firstName,
        surname: data.surname,
        phoneNumber: data.phoneNumber,
        alternativePhone: data.alternativePhone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender,
        address: data.address,
        city: data.city,
        region: data.region,
        occupation: data.occupation,
        employer: data.employer,
        monthlyIncome: data.monthlyIncome ? parseFloat(data.monthlyIncome) : null,
        businessName: data.businessName,
        maritalStatus: data.maritalStatus,
        dependents: data.dependents ? parseInt(data.dependents) : null,
        nationalId: data.nationalId,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        mobileMoneyNumber: data.mobileMoneyNumber,
        creditScore: data.creditScore ? parseInt(data.creditScore) : null
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: payload.id,
        userName: payload.email,
        userRole: payload.role,
        action: 'CUSTOMER_UPDATED',
        entityType: 'customer',
        entityId: customer.id,
        details: data,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
      }
    });

    return NextResponse.json({ success: true, customer });

  } catch (error: any) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
