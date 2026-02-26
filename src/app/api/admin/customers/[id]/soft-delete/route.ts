import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthCookie, verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    console.log('🗑️ SOFT DELETE API CALLED');
    
    // Get customer ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const customerId = pathParts[pathParts.length - 2];
    console.log('Customer ID from URL:', customerId);

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

    // Only super_admin, admin, and loan_officer can delete
    if (!['super_admin', 'admin', 'loan_officer'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Get the request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      body = { reason: 'No reason provided' };
    }

    // Check if customer exists
    const customer = await db.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Soft delete the customer
    const updatedCustomer = await db.customer.update({
      where: { id: customerId },
      data: {
        deletedAt: new Date(),
        deletedById: user.id,
        deletionReason: body.reason || 'No reason provided'
      }
    });

    console.log('✅ Customer soft deleted:', updatedCustomer.id);

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
          reason: body.reason || 'No reason provided',
          deletedBy: user.name,
          deletedAt: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Customer soft deleted successfully'
    });

  } catch (error: any) {
    console.error('❌ SOFT DELETE ERROR:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error'
      },
      { status: 500 }
    );
  }
}
