import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('✅ SIMPLE TEST API CALLED');
  console.log('Params:', params);
  console.log('ID:', params?.id);
  
  return NextResponse.json({
    success: true,
    message: 'Simple test API working',
    receivedId: params?.id,
    timestamp: new Date().toISOString()
  });
}
