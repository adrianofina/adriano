import { db } from '@/lib/db';
import { AuditService } from './audit.service';

export interface CreateCustomerInput {
  firstName: string;
  surname: string;
  phoneNumber: string;
  email?: string;
  createdById: string;
  // ... other fields
}

export class CustomerService {
  /**
   * Create a new customer with audit trail
   */
  static async createCustomer(input: CreateCustomerInput) {
    const { createdById, ...customerData } = input;

    return await db.$transaction(async (tx) => {
      // Generate customer ID
      const year = new Date().getFullYear();
      const count = await tx.customer.count();
      const customerId = `CUST-${year}-${(count + 1).toString().padStart(4, '0')}`;

      // Create customer
      const customer = await tx.customer.create({
        data: {
          ...customerData,
          customerId,
          createdById,
          totalLoans: 0,
          activeLoans: 0,
          overdueLoans: 0,
          totalBorrowed: 0,
          totalRepaid: 0
        }
      });

      // Audit log
      await AuditService.logWithTransaction(tx, {
        userId: createdById,
        action: 'CREATE',
        entityType: 'Customer',
        entityId: customer.id,
        after: customer,
        metadata: { customerId: customer.customerId }
      });

      return customer;
    });
  }

  /**
   * Soft delete a customer
   */
  static async deleteCustomer(customerId: string, deletedById: string, reason: string) {
    return await db.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: customerId }
      });

      if (!customer) throw new Error('Customer not found');
      if (customer.activeLoans > 0) {
        throw new Error('Cannot delete customer with active loans');
      }

      const deleted = await tx.customer.update({
        where: { id: customerId },
        data: {
          deletedAt: new Date(),
          deletedById,
          deletionReason: reason
        }
      });

      await AuditService.logWithTransaction(tx, {
        userId: deletedById,
        action: 'DELETE',
        entityType: 'Customer',
        entityId: customerId,
        before: customer,
        after: deleted,
        metadata: { reason }
      });

      return deleted;
    });
  }
}
