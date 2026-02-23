import { NextResponse } from 'next/server';
import pkg from '@prisma/client';
import pkg2 from 'pg';
const { PrismaClient } = pkg;
const { Pool } = pkg2;
import { PrismaPg } from '@prisma/adapter-pg';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET /api/admin/customers/[id]/contracts
export async function GET(
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

    // In a real app, you'd fetch from a contracts table
    // For now, return empty array
    return NextResponse.json([]);

  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contracts' },
      { status: 500 }
    );
  }
}

// POST /api/admin/customers/[id]/contracts
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Save file to uploads directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public/uploads/contracts');
    await mkdir(uploadDir, { recursive: true });
    
    // Generate unique filename
    const fileExt = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Save file
    await writeFile(filePath, buffer);
    
    // Create contract record (in a real app, you'd save to database)
    const contract = {
      id: uuidv4(),
      contractNumber: formData.get('contractNumber'),
      contractType: formData.get('contractType'),
      contractNumber_seq: parseInt(formData.get('contractNumber_seq') as string),
      description: formData.get('description'),
      expiryDate: formData.get('expiryDate'),
      notes: formData.get('notes'),
      fileUrl: `/uploads/contracts/${fileName}`,
      fileName: file.name,
      fileSize: file.size,
      uploadedBy: {
        name: user.name
      },
      createdAt: new Date().toISOString()
    };

    return NextResponse.json(contract, { status: 201 });

  } catch (error) {
    console.error('Error uploading contract:', error);
    return NextResponse.json(
      { error: 'Failed to upload contract' },
      { status: 500 }
    );
  }
}
