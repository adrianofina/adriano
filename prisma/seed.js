const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:42phinaH@localhost:5432/adrian_cims'
});

// Create adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma with adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding users...');

  const password = await bcrypt.hash('password123', 10);

  // Check if users already exist
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log(`⚠️  Database already has ${existingUsers} users. Skipping seed.`);
    return;
  }

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
    }),
    prisma.user.create({
      data: {
        email: 'admin@adrianmicrofinance.co.tz',
        password,
        name: 'Admin User',
        role: 'admin',
        isStaff: true,
      }
    }),
    prisma.user.create({
      data: {
        email: 'loan.officer@adrianmicrofinance.co.tz',
        password,
        name: 'Loan Officer',
        role: 'loan_officer',
        isStaff: true,
      }
    }),
    prisma.user.create({
      data: {
        email: 'customer.service@adrianmicrofinance.co.tz',
        password,
        name: 'Customer Service',
        role: 'customer_service',
        isStaff: true,
      }
    }),
    prisma.user.create({
      data: {
        email: 'viewer@adrianmicrofinance.co.tz',
        password,
        name: 'Viewer User',
        role: 'viewer',
        isStaff: true,
      }
    }),
    prisma.user.create({
      data: {
        email: 'customer@example.com',
        password,
        name: 'John Customer',
        role: 'customer',
        isStaff: false,
      }
    }),
  ]);

  console.log(`✅ Created ${users.length} users successfully!`);
  console.log('\n📋 User credentials:');
  console.log('====================');
  users.forEach(user => {
    console.log(`\n📧 ${user.email}`);
    console.log(`   Password: password123`);
    console.log(`   Role: ${user.role}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
