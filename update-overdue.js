const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== UPDATING OVERDUE LOANS ===');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Find loans that are active but past due date
  const pastDueLoans = await prisma.loan.findMany({
    where: {
      status: 'active',
      dueDate: { lt: today },
      remainingBalance: { gt: 0 }
    }
  });
  
  console.log(`Found ${pastDueLoans.length} loans past due date`);
  
  for (const loan of pastDueLoans) {
    const daysOverdue = Math.floor((today.getTime() - new Date(loan.dueDate).getTime()) / (1000 * 60 * 60 * 24));
    console.log(`  Updating ${loan.loanId} - overdue by ${daysOverdue} days`);
    
    await prisma.loan.update({
      where: { id: loan.id },
      data: { status: 'overdue' }
    });
    
    // Update customer's overdue count
    await prisma.customer.update({
      where: { id: loan.customerId },
      data: { overdueLoans: { increment: 1 } }
    });
  }
  
  // Also check for loans that should be completed (amountPaid >= amount)
  const completedLoans = await prisma.loan.findMany({
    where: {
      status: { in: ['active', 'overdue'] },
      amountPaid: { gte: prisma.loan.fields.amount }
    }
  });
  
  console.log(`\nFound ${completedLoans.length} loans that should be completed`);
  
  for (const loan of completedLoans) {
    console.log(`  Completing ${loan.loanId}`);
    
    await prisma.loan.update({
      where: { id: loan.id },
      data: { 
        status: 'completed',
        remainingBalance: 0
      }
    });
    
    // Update customer's active/overdue counts
    await prisma.customer.update({
      where: { id: loan.customerId },
      data: { 
        activeLoans: { decrement: loan.status === 'active' ? 1 : 0 },
        overdueLoans: { decrement: loan.status === 'overdue' ? 1 : 0 }
      }
    });
  }
  
  console.log('\n=== DONE ===');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
