import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthCookie, verifyToken } from '@/lib/auth';

export async function GET() {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    let customer = await db.customer.findFirst({ where: { userId: user.id } });
    if (!customer && user.email) {
      customer = await db.customer.findFirst({ where: { email: user.email } });
    }
    
    if (!customer) {
      return NextResponse.json({ loans: [] });
    }
    
    const loans = await db.loan.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ loans });
  } catch (error) {
    console.error('Error fetching loans:', error);
    return NextResponse.json({ loans: [] }, { status: 500 });
  }
}
