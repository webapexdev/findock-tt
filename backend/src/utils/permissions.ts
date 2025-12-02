import { Task } from '../entities/Task';
import { AuthTokenPayload } from './auth';

export type PermissionAction = 'edit' | 'delete';

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Check if a user has permission to perform an action on a task
 * 
 * Rules:
 * - Regular users: can only edit/delete tasks they own
 * - Managers: can edit any task but only delete their own
 * - Admins: have full access (edit/delete any task)
 */
export const checkTaskPermission = (
  user: AuthTokenPayload,
  task: Task,
  action: PermissionAction
): PermissionCheckResult => {
  const userId = user.userId;
  const userRoles = user.roles || [];
  const isOwner = task.owner.id === userId;
  const isAdmin = userRoles.includes('admin');
  const isManager = userRoles.includes('manager');

  // Validate action
  if (action !== 'edit' && action !== 'delete') {
    return {
      allowed: false,
      reason: 'Unknown action'
    };
  }

  // Admins and owner have full access
  if (isAdmin || isOwner) {
    return { allowed: true };
  }

  if (isManager && action === 'edit') {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: isManager
      ? 'Managers can only delete tasks they own'
      : 'You can only delete or edit tasks you own'
  };
};


