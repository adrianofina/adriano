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
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only super_admin, admin, and loan_officer can delete
    if (!['super_admin', 'admin', 'loan_officer'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { reason } = await request.json();
    const customerId = params.id;

    // Soft delete the customer
    const customer = await db.customer.update({
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
          reason: reason || 'No reason provided',
          deletedBy: user.name,
          deletedAt: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Customer soft deleted successfully'
    });

  } catch (error) {
    console.error('Soft delete error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
