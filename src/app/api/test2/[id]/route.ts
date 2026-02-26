import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  console.log('🧪 TEST API - Full context:', JSON.stringify(context, null, 2));
  
  const id = context?.params?.id || context?.id || 'none';
  
  return NextResponse.json({
    success: true,
    data: {
      receivedId: id,
      context: context
    }
  });
}
