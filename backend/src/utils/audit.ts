import { Request } from 'express';
import { Task } from '../entities/Task';
import { PermissionAction } from './permissions';

export interface AuditLog {
  userId: string;
  action: PermissionAction;
  taskId: string;
  denied: boolean;
  reason?: string;
  timestamp: Date;
  userRoles: string[];
}

// In-memory audit log (in production, this would be stored in a database)
const auditLogs: AuditLog[] = [];

/**
 * Log a permission-denied attempt
 */
export const logPermissionDenied = (
  req: Request,
  task: Task,
  action: PermissionAction,
  reason: string
): void => {
  if (!req.user) {
    return;
  }

  const logEntry: AuditLog = {
    userId: req.user.userId,
    action,
    taskId: task.id,
    denied: true,
    reason,
    timestamp: new Date(),
    userRoles: req.user.roles || [],
  };

  auditLogs.push(logEntry);

  // In production, you would save this to a database
  // For now, we'll just log to console
  console.log('[AUDIT] Permission denied:', JSON.stringify(logEntry, null, 2));
};

/**
 * Get audit logs (for admin purposes)
 */
export const getAuditLogs = (): AuditLog[] => {
  return [...auditLogs];
};

/**
 * Get audit logs for a specific user
 */
export const getAuditLogsForUser = (userId: string): AuditLog[] => {
  return auditLogs.filter((log) => log.userId === userId);
};



