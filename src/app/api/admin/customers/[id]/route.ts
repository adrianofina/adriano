import { NextResponse } from 'next/server';
import pkg from '@prisma/client';
import pkg2 from 'pg';
const { PrismaClient } = pkg;
const { Pool } = pkg2;
import { PrismaPg } from '@prisma/adapter-pg';
import { getAuthCookie, verifyToken } from '@/lib/auth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET /api/admin/customers/[id] - Get single customer
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        loans: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            loanId: true,
            amount: true,
            purpose: true,
            status: true,
            stage: true,
            createdAt: true,
            remainingBalance: true
          }
        },
        documents: {
          take: 5,
          orderBy: { uploadedAt: 'desc' }
        },
        courtCases: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            loans: true,
            documents: true,
            courtCases: true
          }
        }
      }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get audit logs for this customer
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        entityType: 'CUSTOMER',
        entityId: customer.id
      },
      orderBy: { timestamp: 'desc' },
      take: 20
    });

    return NextResponse.json({
      ...customer,
      auditLogs
    });

  } catch (error) {
    console.error('Get customer error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/customers/[id] - Update customer
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: params.id }
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check phone uniqueness (if changed)
    if (body.phoneNumber && body.phoneNumber !== existingCustomer.phoneNumber) {
      const phoneExists = await prisma.customer.findUnique({
        where: { phoneNumber: body.phoneNumber }
      });
      if (phoneExists) {
        return NextResponse.json(
          { error: 'Phone number already in use' },
          { status: 400 }
        );
      }
    }

    // Check email uniqueness (if changed and provided)
    if (body.email && body.email !== existingCustomer.email) {
      const emailExists = await prisma.customer.findUnique({
        where: { email: body.email }
      });
      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    // Update customer
    const updatedCustomer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        firstName: body.firstName || existingCustomer.firstName,
        surname: body.surname || existingCustomer.surname,
        middleName: body.middleName !== undefined ? body.middleName : existingCustomer.middleName,
        phoneNumber: body.phoneNumber || existingCustomer.phoneNumber,
        alternativePhone: body.alternativePhone !== undefined ? body.alternativePhone : existingCustomer.alternativePhone,
        email: body.email !== undefined ? body.email : existingCustomer.email,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : existingCustomer.dateOfBirth,
        gender: body.gender !== undefined ? body.gender : existingCustomer.gender,
        address: body.address !== undefined ? body.address : existingCustomer.address,
        city: body.city !== undefined ? body.city : existingCustomer.city,
        region: body.region !== undefined ? body.region : existingCustomer.region,
        occupation: body.occupation !== undefined ? body.occupation : existingCustomer.occupation,
        employer: body.employer !== undefined ? body.employer : existingCustomer.employer,
        monthlyIncome: body.monthlyIncome ? parseFloat(body.monthlyIncome) : existingCustomer.monthlyIncome,
        businessName: body.businessName !== undefined ? body.businessName : existingCustomer.businessName,
        maritalStatus: body.maritalStatus !== undefined ? body.maritalStatus : existingCustomer.maritalStatus,
        dependents: body.dependents ? parseInt(body.dependents) : existingCustomer.dependents,
        nationalId: body.nationalId !== undefined ? body.nationalId : existingCustomer.nationalId,
        bankName: body.bankName !== undefined ? body.bankName : existingCustomer.bankName,
        accountNumber: body.accountNumber !== undefined ? body.accountNumber : existingCustomer.accountNumber,
        mobileMoneyProvider: body.mobileMoneyProvider !== undefined ? body.mobileMoneyProvider : existingCustomer.mobileMoneyProvider,
        mobileMoneyNumber: body.mobileMoneyNumber !== undefined ? body.mobileMoneyNumber : existingCustomer.mobileMoneyNumber
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name || user.email,
        userRole: user.role,
        action: 'UPDATE',
        entityType: 'CUSTOMER',
        entityId: updatedCustomer.id,
        details: {
          changes: {
            from: {
              firstName: existingCustomer.firstName,
              surname: existingCustomer.surname,
              phoneNumber: existingCustomer.phoneNumber,
              email: existingCustomer.email
            },
            to: {
              firstName: updatedCustomer.firstName,
              surname: updatedCustomer.surname,
              phoneNumber: updatedCustomer.phoneNumber,
              email: updatedCustomer.email
            }
          }
        }
      }
    });

    return NextResponse.json(updatedCustomer);

  } catch (error) {
    console.error('Update customer error:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/customers/[id] - Delete customer
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only super_admin can delete
    if (user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super administrators can delete customers' },
        { status: 403 }
      );
    }

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        loans: true,
        courtCases: true
      }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if customer has active loans
    if (customer.activeLoans > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with active loans' },
        { status: 400 }
      );
    }

    // Store customer info for audit before deletion
    const customerInfo = {
      id: customer.id,
      customerId: customer.customerId,
      name: `${customer.firstName} ${customer.surname}`,
      phone: customer.phoneNumber,
      email: customer.email,
      totalLoans: customer.totalLoans,
      activeLoans: customer.activeLoans,
      completedLoans: customer.completedLoans
    };

    // Delete related records first (due to foreign key constraints)
    await prisma.$transaction([
      // Delete documents
      prisma.customerDocument.deleteMany({
        where: { customerId: customer.id }
      }),
      // Delete payments through loans
      ...customer.loans.map(loan => 
        prisma.payment.deleteMany({
          where: { loanId: loan.id }
        })
      ),
      // Delete loans
      prisma.loan.deleteMany({
        where: { customerId: customer.id }
      }),
      // Delete court cases
      prisma.courtCase.deleteMany({
        where: { customerId: customer.id }
      }),
      // Finally delete customer
      prisma.customer.delete({
        where: { id: customer.id }
      })
    ]);

    // Create audit log for deletion
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name || user.email,
        userRole: user.role,
        action: 'DELETE',
        entityType: 'CUSTOMER',
        entityId: customer.id,
        details: {
          deletedCustomer: customerInfo,
          deletedBy: {
            id: user.id,
            name: user.name,
            role: user.role
          },
          deletedAt: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({ 
      message: 'Customer deleted successfully',
      deletedCustomer: customerInfo,
      deletedBy: {
        id: user.id,
        name: user.name,
        role: user.role
      },
      deletedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Delete customer error:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
