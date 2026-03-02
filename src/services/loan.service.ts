import { db } from '@/lib/db';
import { auditService } from './audit.service';

export interface ApproveLoanInput {
  loanId: string;
  approvedById: string;
  approvedAt: Date;
  notes?: string;
}

export class LoanService {
  /**
   * Approve a loan with full transaction safety
   * Updates loan status AND customer counters atomically
   */
  static async approveLoan(input: ApproveLoanInput) {
    const { loanId, approvedById, approvedAt, notes } = input;

    return await db.$transaction(async (tx) => {
      // 1. Get the loan with customer
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
        include: { customer: true }
      });

      if (!loan) {
        throw new Error('Loan not found');
      }

      if (loan.status !== 'pending') {
        throw new Error(`Loan cannot be approved - current status: ${loan.status}`);
      }

      // 2. Update loan status
      const updatedLoan = await tx.loan.update({
        where: { id: loanId },
        data: {
          status: 'active',
          approvedById,
          approvedAt,
          notes: notes ? `${loan.notes || ''}\nApproval note: ${notes}` : loan.notes
        }
      });

      // 3. Update customer counters
      await tx.customer.update({
        where: { id: loan.customerId },
        data: {
          totalLoans: { increment: 1 },
          activeLoans: { increment: 1 }
        }
      });

      // 4. Create audit log
      await tx.auditLog.create({
        data: {
          userId: approvedById,
          action: 'UPDATE',
          entityType: 'Loan',
          entityId: loanId,
          before: JSON.stringify({ status: loan.status }),
          after: JSON.stringify({ status: 'active' }),
          metadata: {
            loanId,
            customerId: loan.customerId,
            approvedBy: approvedById,
            notes
          }
        }
      });

      return updatedLoan;
    });
  }

  /**
   * Disburse loan funds
   */
  static async disburseLoan(input: { 
    loanId: string; 
    disbursedById: string;
    disbursementMethod: string;
    reference?: string;
  }) {
    const { loanId, disbursedById, disbursementMethod, reference } = input;

    return await db.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
        include: { customer: true }
      });

      if (!loan) throw new Error('Loan not found');
      if (loan.status !== 'active') {
        throw new Error('Loan must be active before disbursement');
      }

      // Update loan to disbursed
      const updatedLoan = await tx.loan.update({
        where: { id: loanId },
        data: {
          status: 'disbursed',
          disbursedById,
          disbursedAt: new Date(),
          disbursementMethod,
          disbursementReference: reference
        }
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: disbursedById,
          action: 'UPDATE',
          entityType: 'Loan',
          entityId: loanId,
          before: JSON.stringify({ status: loan.status }),
          after: JSON.stringify({ status: 'disbursed' }),
          metadata: { loanId, method: disbursementMethod, reference }
        }
      });

      return updatedLoan;
    });
  }

  /**
   * Mark loan as overdue
   */
  static async markOverdue(loanId: string, updatedById: string) {
    return await db.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
        include: { customer: true }
      });

      if (!loan) throw new Error('Loan not found');
      if (loan.status !== 'active') {
        throw new Error('Only active loans can become overdue');
      }

      // Update loan
      const updatedLoan = await tx.loan.update({
        where: { id: loanId },
        data: { status: 'overdue' }
      });

      // Update customer overdue counter
      await tx.customer.update({
        where: { id: loan.customerId },
        data: {
          activeLoans: { decrement: 1 },
          overdueLoans: { increment: 1 }
        }
      });

      // Audit
      await tx.auditLog.create({
        data: {
          userId: updatedById,
          action: 'UPDATE',
          entityType: 'Loan',
          entityId: loanId,
          before: JSON.stringify({ status: loan.status }),
          after: JSON.stringify({ status: 'overdue' })
        }
      });

      return updatedLoan;
    });
  }
}
