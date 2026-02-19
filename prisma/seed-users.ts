import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding users...');

  const password = await bcrypt.hash('password123', 10);

  // Create staff users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'superadmin@adrianmicrofinance.co.tz',
        password,
        name: 'Super Admin',
        role: 'super_admin',
        isStaff: true,
      }
    }).catch(() => null),
    prisma.user.create({
      data: {
        email: 'admin@adrianmicrofinance.co.tz',
        password,
        name: 'Admin User',
        role: 'admin',
        isStaff: true,
      }
    }).catch(() => null),
    prisma.user.create({
      data: {
        email: 'loan.officer@adrianmicrofinance.co.tz',
        password,
        name: 'Loan Officer',
        role: 'loan_officer',
        isStaff: true,
      }
    }).catch(() => null),
    prisma.user.create({
      data: {
        email: 'customer.service@adrianmicrofinance.co.tz',
        password,
        name: 'Customer Service',
        role: 'customer_service',
        isStaff: true,
      }
    }).catch(() => null),
    prisma.user.create({
      data: {
        email: 'viewer@adrianmicrofinance.co.tz',
        password,
        name: 'Viewer User',
        role: 'viewer',
        isStaff: true,
      }
    }).catch(() => null),
    prisma.user.create({
      data: {
        email: 'customer@example.com',
        password,
        name: 'John Customer',
        role: 'customer',
        isStaff: false,
      }
    }).catch(() => null),
  ]);

  console.log(`✅ Created ${users.filter(Boolean).length} users`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
