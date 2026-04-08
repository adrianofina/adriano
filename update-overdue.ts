import { db } from '@/lib/db';

async function updateOverdueStatus() {
  console.log('=== UPDATING OVERDUE LOAN STATUS ===');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Find loans that are active but past due date
  const pastDueLoans = await db.loan.findMany({
    where: {
      status: 'active',
      dueDate: { lt: today },
      remainingBalance: { gt: 0 }
    }
  });
  
  console.log(`Found ${pastDueLoans.length} loans that are past due date`);
  
  // Update them to overdue
  for (const loan of pastDueLoans) {
    const daysOverdue = Math.floor((today.getTime() - new Date(loan.dueDate).getTime()) / (1000 * 60 * 60 * 24));
    console.log(`  Updating ${loan.loanId} - overdue by ${daysOverdue} days`);
    
    await db.loan.update({
      where: { id: loan.id },
      data: { status: 'overdue' }
    });
    
    // Update customer's overdue count
    await db.customer.update({
      where: { id: loan.customerId },
      data: { overdueLoans: { increment: 1 } }
    });
  }
  
  console.log('✅ Done updating overdue loans');
}

updateOverdueStatus();
