import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthCookie, verifyToken } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔄 Restore API called for customer:', params.id);
    
    // Get customer ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const customerId = pathParts[pathParts.length - 2];

    // Check authentication
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

    // Only super_admin and admin can restore
    if (!['super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Restore the customer (set deletedAt to null)
    const restored = await db.customer.update({
      where: { id: customerId },
      data: {
        deletedAt: null,
        deletedById: null,
        deletionReason: null
      }
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name || user.email,
        userRole: user.role,
        action: 'RESTORE',
        entityType: 'CUSTOMER',
        entityId: customerId,
        details: {
          customerName: `${restored.firstName} ${restored.surname}`,
          customerId: restored.customerId,
          restoredBy: user.name,
          restoredAt: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Customer restored successfully'
    });

  } catch (error: any) {
    console.error('❌ Restore error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
