import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthCookie, verifyToken } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id, documentId } = await params;

    console.log(`🗑️ Deleting document ${documentId} for customer ${id}`);

    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // First check if document exists
    const existing = await db.customerDocument.findFirst({
      where: { 
        id: documentId,
        customerId: id 
      },
    });

    console.log('Found document:', existing);

    if (!existing) {
      return NextResponse.json({ 
        success: false, 
        error: 'Document not found' 
      }, { status: 404 });
    }

    // Soft delete
    const deletedDocument = await db.customerDocument.update({
      where: { id: documentId },
      data: {
        deletedAt: new Date(),
        deletedById: user.id,
        deletionReason: 'Deleted by user'
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        userName: user.email,
        userRole: user.role,
        action: 'DELETE',
        entityType: 'CustomerDocument',
        entityId: documentId,
        details: {
          customerId: id,
          documentName: existing.fileName,
          documentType: existing.documentType
        }
      }
    });

    console.log(`✅ Document ${documentId} soft deleted`);

    return NextResponse.json({ 
      success: true, 
      data: deletedDocument,
      message: 'Document deleted successfully'
    });

  } catch (error: any) {
    console.error('[DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete document' },
      { status: 500 }
    );
  }
}