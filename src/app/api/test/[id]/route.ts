import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('🔧 TEST API - Full params:', params);
  console.log('🔧 TEST API - params.id:', params?.id);
  
  return NextResponse.json({
    success: true,
    data: {
      receivedParams: params,
      id: params?.id,
      message: 'Test API working'
    }
  });
}
