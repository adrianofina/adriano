import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import path from 'path';
import fs from 'fs/promises';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get all NON-DELETED documents
    const documents = await db.customerDocument.findMany({
      where: { 
        customerId: id,
        deletedAt: null
      },
      orderBy: { uploadedAt: 'desc' }
    });

    return NextResponse.json({ 
      success: true, 
      data: documents 
    });

  } catch (error: any) {
    console.error('[GET]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const documentType = formData.get('documentType') as string;
    const file = formData.get('file') as File;

    if (!documentType || !file) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing document type or file' 
      }, { status: 400 });
    }

    // CHECK FOR DUPLICATE
    const existingDocument = await db.customerDocument.findFirst({
      where: {
        customerId: id,
        documentType: documentType,
        deletedAt: null  // Only check non-deleted documents
      }
    });

    if (existingDocument) {
      return NextResponse.json({ 
        success: false, 
        error: `A ${documentType} document already exists for this customer. Do you want to replace it?`,
        duplicate: true,
        existingDocumentId: existingDocument.id
      }, { status: 409 }); // 409 Conflict
    }

    // Process the file upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create unique filename
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
    
    // Save file
    await fs.writeFile(filePath, buffer);
    
    // Create document record
    const document = await db.customerDocument.create({
      data: {
        customerId: id,
        documentType: documentType,
        fileName: file.name,
        fileUrl: `/uploads/${fileName}`,
        fileSize: file.size,
        uploadedAt: new Date(),
        uploadedById: user.id,
        status: 'pending'
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: document,
      message: 'Document uploaded successfully'
    });

  } catch (error: any) {
    console.error('[POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload document' },
      { status: 500 }
    );
  }
}