import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const TOKEN_EXPIRY = '7d';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value;
}

export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}

export function getRoleFromEmail(email: string): { role: string; isStaff: boolean } {
  const companyDomain = '@adrianmicrofinance.co.tz';
  
  if (!email.includes(companyDomain)) {
    return { role: 'customer', isStaff: false };
  }
  
  if (email.startsWith('superadmin')) return { role: 'super_admin', isStaff: true };
  if (email.startsWith('admin')) return { role: 'admin', isStaff: true };
  if (email.startsWith('loan.officer')) return { role: 'loan_officer', isStaff: true };
  if (email.startsWith('customer.service')) return { role: 'customer_service', isStaff: true };
  if (email.startsWith('viewer')) return { role: 'viewer', isStaff: true };
  
  return { role: 'admin', isStaff: true };
}
