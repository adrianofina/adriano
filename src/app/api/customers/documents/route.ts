import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find customer
    let customer = await db.customer.findFirst({
      where: { userId: user.id }
    });

    if (!customer && user.email) {
      customer = await db.customer.findFirst({
        where: { email: user.email }
      });
    }

    if (!customer) {
      return NextResponse.json({ documents: [] });
    }

    const documents = await db.customerDocument.findMany({
      where: { customerId: customer.id },
      orderBy: { uploadedAt: 'desc' }
    });

    return NextResponse.json({ documents });

  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find customer
    let customer = await db.customer.findFirst({
      where: { userId: user.id }
    });

    if (!customer && user.email) {
      customer = await db.customer.findFirst({
        where: { email: user.email }
      });
    }

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'customer-documents');
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const safeFileName = `${customer.id}_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadDir, safeFileName);
    const fileUrl = `/uploads/customer-documents/${safeFileName}`;

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save to database
    const document = await db.customerDocument.create({
      data: {
        customerId: customer.id,
        documentType: documentType || 'other',
        fileName: file.name,
        fileUrl: fileUrl,
        fileSize: file.size,
        uploadedAt: new Date(),
        uploadedById: user.id,
        status: 'pending'
      }
    });

    return NextResponse.json({ document });

  } catch (error: any) {
    console.error('Error uploading document:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
