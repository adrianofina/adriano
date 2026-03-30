import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthCookie, verifyToken } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id, documentId } = await params;

    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the document exists and is soft deleted
    const existing = await db.customerDocument.findFirst({
      where: { id: documentId, customerId: id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    if (!existing.deletedAt) {
      return NextResponse.json({ 
        success: false, 
        error: 'Document is not deleted' 
      }, { status: 400 });
    }

    // Restore the document
    const restoredDocument = await db.customerDocument.update({
      where: { id: documentId },
      data: {
        deletedAt: null,
        deletedById: null,
        deletionReason: null
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        userName: user.email,
        userRole: user.role,
        action: 'RESTORE',
        entityType: 'CustomerDocument',
        entityId: documentId,
        details: {
          customerId: id,
          documentName: existing.fileName,
          documentType: existing.documentType,
          reason: 'Restored by user'
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: restoredDocument,
      message: 'Document restored successfully'
    });

  } catch (error: any) {
    console.error('[RESTORE /api/admin/customers/[id]/documents/[documentId]]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to restore document' },
      { status: 500 }
    );
  }
}