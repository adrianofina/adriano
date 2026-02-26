import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthCookie, verifyToken } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📄 Uploading document');
    
    // Get customer ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const customerId = pathParts[pathParts.length - 2];
    
    console.log('Customer ID:', customerId);

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

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const documentType = formData.get('documentType') as string;
    const file = formData.get('file') as File;

    if (!documentType || !file) {
      return NextResponse.json(
        { success: false, error: 'Document type and file are required' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public/uploads/documents');
    await mkdir(uploadDir, { recursive: true });
    
    // Generate unique filename
    const fileExt = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create document record in database
    const document = await db.customerDocument.create({
      data: {
        customerId,
        documentType,
        fileName: file.name,
        fileUrl: `/uploads/documents/${fileName}`,
        fileSize: file.size,
        uploadedAt: new Date(),
        uploadedById: user.id,
        status: 'uploaded'
      }
    });

    console.log('✅ Document uploaded:', document.id);

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name || user.email,
        userRole: user.role,
        action: 'UPLOAD',
        entityType: 'DOCUMENT',
        entityId: document.id,
        details: {
          documentType,
          fileName: file.name,
          customerId
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: document
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error uploading document:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get customer ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const customerId = pathParts[pathParts.length - 2];
    
    const documents = await db.customerDocument.findMany({
      where: { customerId },
      orderBy: { uploadedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: documents
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
