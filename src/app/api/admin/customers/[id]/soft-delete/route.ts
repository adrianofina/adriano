import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthCookie, verifyToken } from '@/lib/auth';

export async function POST(
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

    // Only super_admin, admin, and loan_officer can soft delete
    if (!['super_admin', 'admin', 'loan_officer'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { reason, deletedBy } = await request.json();
    const customerId = params.id;

    // Check if customer exists
    const customer = await db.customer.findUnique({
      where: { id: customerId },
      include: {
        loans: true,
        documents: true
      }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Soft delete - set deletedAt and deletedBy
    const updatedCustomer = await db.customer.update({
      where: { id: customerId },
      data: {
        deletedAt: new Date(),
        deletedById: user.id,
        deletionReason: reason || 'No reason provided'
      }
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name || user.email,
        userRole: user.role,
        action: 'SOFT_DELETE',
        entityType: 'CUSTOMER',
        entityId: customerId,
        details: {
          customerName: `${customer.firstName} ${customer.surname}`,
          customerId: customer.customerId,
          reason,
          deletedBy: user.name,
          deletedAt: new Date().toISOString(),
          stats: {
            loans: customer.loans.length,
            documents: customer.documents.length
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Customer soft deleted successfully',
      deletedBy: user.name,
      deletedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Soft delete error:', error);
    return NextResponse.json(
      { error: 'Failed to soft delete customer' },
      { status: 500 }
    );
  }
}
