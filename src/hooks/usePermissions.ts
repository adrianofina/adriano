'use client';

import { UserRole, Permission } from '@/types';
import { useSession } from 'next-auth/react';

// ========== ROLE-BASED PERMISSION MATRIX ==========
const PERMISSION_MATRIX: Record<UserRole, Permission[]> = {
  super_admin: [
    'view_customers',
    'create_customer',
    'edit_customer',
    'delete_customer',
    'view_loans',
    'create_loan',
    'edit_loan',
    'delete_loan',
    'approve_loan_stage1',
    'approve_loan_stage2',
    'disburse_loan',
    'mark_paid',
    'waive_penalty',
    'upload_customers',
    'view_reports',
    'manage_users',
    'audit_logs',
    'delegate_permissions'
  ],

  admin: [
    'view_customers',
    'create_customer',
    'edit_customer',
    'view_loans',
    'create_loan',
    'edit_loan',
    'approve_loan_stage1',
    'mark_paid',
    'waive_penalty',
    'upload_customers',
    'view_reports'
  ],

  loan_officer: [
    'view_customers',
    'create_customer',
    'edit_customer',
    'view_loans',
    'create_loan',
    'edit_loan',
    'mark_paid',
    'upload_customers'
  ],

  customer_service: [
    'view_customers',
    'create_customer',
    'edit_customer',
    'view_loans',
    'upload_customers'
  ],

  viewer: [
    'view_customers',
    'view_loans'
  ]
};

export function usePermissions() {
  // FOR DEMO: Change this to test different roles
  // In production, this would come from your auth system
  const userRole: UserRole = 'super_admin'; // Try: 'super_admin', 'admin', 'loan_officer', 'customer_service', 'viewer'
  
  // Mock delegated permissions (in production, these would come from API)
  const delegatedPermissions: Permission[] = [];
  
  // Combine base permissions with delegated ones
  const basePermissions = PERMISSION_MATRIX[userRole] || [];
  const allPermissions = [...basePermissions, ...delegatedPermissions];
  
  const hasPermission = (permission: Permission): boolean => {
    return allPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };

  // Specific permission checks
  const canApproveStage1 = hasPermission('approve_loan_stage1');
  const canApproveStage2 = hasPermission('approve_loan_stage2');
  const canDisburse = hasPermission('disburse_loan');
  const canMarkPaid = hasPermission('mark_paid');
  const canDeleteCustomer = hasPermission('delete_customer');
  const canDeleteLoan = hasPermission('delete_loan');
  const canManageUsers = hasPermission('manage_users');
  const canAuditLogs = hasPermission('audit_logs');
  const canUploadCustomers = hasPermission('upload_customers');
  const canDelegate = hasPermission('delegate_permissions');

  // ===== LOAN WORKFLOW WITH FULL TRANSPARENCY =====
  const getLoanWorkflowStep = (loan: any): number => {
    if (loan.status === 'rejected' || loan.status === 'cancelled') return 0;
    if (!loan.stage1Approval) return 1;
    if (!loan.stage2Approval) return 2;
    if (!loan.disbursement) return 3;
    if (loan.remainingBalance > 0) return 4;
    return 5;
  };

  const getLoanApprovalChain = (loan: any) => {
    return {
      createdBy: loan.createdBy,
      createdAt: loan.createdAt,
      stage1: loan.stage1Approval ? {
        by: loan.stage1Approval.approvedBy,
        at: loan.stage1Approval.approvedAt,
        notes: loan.stage1Approval.notes
      } : null,
      stage2: loan.stage2Approval ? {
        by: loan.stage2Approval.approvedBy,
        at: loan.stage2Approval.approvedAt,
        notes: loan.stage2Approval.notes
      } : null,
      disbursedBy: loan.disbursement?.disbursedBy,
      disbursedAt: loan.disbursement?.disbursedAt,
      paidBy: loan.paidBy,
      paidAt: loan.paidAt
    };
  };

  // ===== UI HELPERS =====
  const getRoleBadgeColor = (role: UserRole): string => {
    switch(role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'loan_officer': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'customer_service': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'viewer': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getLoanStatusColor = (status: string): string => {
    switch(status) {
      case 'pending_stage1': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'pending_stage2': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'disbursed': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'paid': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'defaulted': return 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-300';
      case 'rejected': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return {
    // Role info
    userRole,
    
    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Specific permissions
    canApproveStage1,
    canApproveStage2,
    canDisburse,
    canMarkPaid,
    canDeleteCustomer,
    canDeleteLoan,
    canManageUsers,
    canAuditLogs,
    canUploadCustomers,
    canDelegate,
    
    // Loan workflow
    getLoanWorkflowStep,
    getLoanApprovalChain,
    
    // UI helpers
    getRoleBadgeColor,
    getLoanStatusColor
  };
}
