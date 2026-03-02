import { db } from '@/lib/db';

export interface AuditInput {
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN';
  entityType: string;
  entityId: string;
  before?: any;
  after?: any;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  static async log(input: AuditInput) {
    return await db.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        before: input.before ? JSON.stringify(input.before) : null,
        after: input.after ? JSON.stringify(input.after) : null,
        metadata: input.metadata || {},
        ipAddress: input.ipAddress,
        userAgent: input.userAgent
      }
    });
  }

  static async logWithTransaction(tx: any, input: AuditInput) {
    return await tx.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        before: input.before ? JSON.stringify(input.before) : null,
        after: input.after ? JSON.stringify(input.after) : null,
        metadata: input.metadata || {},
        ipAddress: input.ipAddress,
        userAgent: input.userAgent
      }
    });
  }
}
