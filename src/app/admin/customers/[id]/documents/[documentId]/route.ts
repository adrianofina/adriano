import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthCookie, verifyToken } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id, documentId } = await params;

    console.log('========== DELETE API CALLED ==========');
    console.log('Customer ID:', id);
    console.log('Document ID:', documentId);

    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // First, let's see all documents for this customer
    const allDocs = await db.customerDocument.findMany({
      where: { customerId: id },
      select: { id: true, documentType: true, fileName: true }
    });
    console.log('All documents for this customer:', allDocs);

    // Now try to find the specific document
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
        error: `Document not found. ID: ${documentId}`,
        availableDocuments: allDocs.map(d => ({ id: d.id, type: d.documentType }))
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

    console.log('Document soft deleted:', deletedDocument);

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