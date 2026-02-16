import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'superadmin@adrianmicrofinance.co.tz',
        password: 'demo-password',
        name: 'Super Admin',
        role: 'super_admin',
        isStaff: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'admin@adrianmicrofinance.co.tz',
        password: 'demo-password',
        name: 'Admin User',
        role: 'admin',
        isStaff: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'loan.officer@adrianmicrofinance.co.tz',
        password: 'demo-password',
        name: 'Loan Officer',
        role: 'loan_officer',
        isStaff: true
      }
    })
  ])

  console.log(`✅ Created ${users.length} users`)

  // Create customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        customerId: 'CUST-001',
        firstName: 'Laurent',
        surname: 'Adriano',
        phoneNumber: '+255784461743',
        email: 'adriandevelopment@gmail.com',
        occupation: 'Business Man',
        creditScore: 750,
        riskLevel: 'low',
        totalLoans: 3,
        activeLoans: 1,
        overdueLoans: 1,
        createdById: users[0].id
      }
    }),
    prisma.customer.create({
      data: {
        customerId: 'CUST-002',
        firstName: 'John',
        surname: 'Doe',
        phoneNumber: '+255712345678',
        email: 'john.doe@example.com',
        occupation: 'Teacher',
        creditScore: 680,
        riskLevel: 'medium',
        totalLoans: 1,
        activeLoans: 1,
        createdById: users[1].id
      }
    })
  ])

  console.log(`✅ Created ${customers.length} customers`)

  // Create loans
  const loans = await Promise.all([
    prisma.loan.create({
      data: {
        loanId: 'L-001',
        customerId: customers[0].id,
        amount: 3420000,
        purpose: 'Business Expansion',
        term: 6,
        interestRate: 12,
        amountPaid: 3380000,
        remainingBalance: 120000,
        status: 'overdue',
        stage: 3,
        createdById: users[2].id
      }
    }),
    prisma.loan.create({
      data: {
        loanId: 'L-002',
        customerId: customers[1].id,
        amount: 5000000,
        purpose: 'Education',
        term: 12,
        interestRate: 10,
        amountPaid: 1000000,
        remainingBalance: 4000000,
        status: 'active',
        stage: 4,
        createdById: users[2].id
      }
    })
  ])

  console.log(`✅ Created ${loans.length} loans`)
  console.log('🌱 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
