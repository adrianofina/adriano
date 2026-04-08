import { db } from '@/lib/db';

async function checkData() {
  console.log('=== CHECKING DATABASE ===');
  
  // Check all loans with status
  const allLoans = await db.loan.findMany({
    select: { id: true, loanId: true, status: true, dueDate: true, remainingBalance: true }
  });
  console.log('All loans:', allLoans.length);
  console.log('Loan statuses:', allLoans.map(l => ({ id: l.loanId, status: l.status, dueDate: l.dueDate })));
  
  // Check overdue loans
  const overdueLoans = await db.loan.findMany({
    where: { status: 'overdue' }
  });
  console.log('Overdue loans count:', overdueLoans.length);
  
  // Check customers with overdueLoans > 0
  const overdueCustomers = await db.customer.findMany({
    where: { overdueLoans: { gt: 0 } },
    select: { id: true, firstName: true, surname: true, overdueLoans: true }
  });
  console.log('Customers with overdueLoans > 0:', overdueCustomers.length);
  console.log('Customers:', overdueCustomers);
  
  // Check completed loans
  const completedLoans = await db.loan.findMany({
    where: { status: { in: ['completed', 'paid'] } }
  });
  console.log('Completed loans count:', completedLoans.length);
  
  // Check customers with no active/overdue but have loans
  const completedCustomers = await db.customer.findMany({
    where: {
      activeLoans: 0,
      overdueLoans: 0,
      totalLoans: { gt: 0 }
    },
    select: { id: true, firstName: true, surname: true, totalLoans: true, activeLoans: true, overdueLoans: true }
  });
  console.log('Customers with completed loans (no active/overdue):', completedCustomers.length);
}

checkData();
