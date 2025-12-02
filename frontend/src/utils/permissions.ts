import { Task } from '../types/task';
import { AuthUser } from '../types/auth';

export type PermissionAction = 'edit' | 'delete';

/**
 * Check if a user has permission to perform an action on a task
 * 
 * Rules (mirrors backend logic):
 * - Regular users: can only edit/delete tasks they own
 * - Managers: can edit any task but only delete their own
 * - Admins: have full access (edit/delete any task)
 */
export const checkTaskPermission = (
  user: AuthUser | null,
  task: Task,
  action: PermissionAction
): boolean => {
  if (!user) {
    return false;
  }

  const userId = user.id;
  const userRoles = user.roles || [];
  const isOwner = task.owner.id === userId;
  const isAdmin = userRoles.includes('admin');
  const isManager = userRoles.includes('manager');

  // Admins have full access
  if (isAdmin || isOwner) {
    return true;
  }

  if (isManager) {
    return action === 'edit';
  }

  return false;
};


