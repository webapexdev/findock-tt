import { checkTaskPermission } from './permissions';
import { Task } from '../entities/Task';
import { User } from '../entities/User';
import { AuthTokenPayload } from './auth';

// Mock task and user data for testing
const createMockTask = (ownerId: string): Task => {
  const owner = new User();
  owner.id = ownerId;
  owner.firstName = 'Test';
  owner.lastName = 'User';
  owner.email = 'test@example.com';

  const task = new Task();
  task.id = 'task-1';
  task.title = 'Test Task';
  task.description = 'Test Description';
  task.status = 'todo';
  task.owner = owner;
  task.assignees = [];

  return task;
};

const createMockUser = (userId: string, roles: string[]): AuthTokenPayload => {
  return {
    userId,
    roles,
  };
};

describe('checkTaskPermission', () => {
  const taskOwnerId = 'owner-1';
  const otherUserId = 'other-1';
  const task = createMockTask(taskOwnerId);

  describe('Admin permissions', () => {
    const admin = createMockUser('admin-1', ['admin']);

    it('should allow admin to edit any task', () => {
      const result = checkTaskPermission(admin, task, 'edit');
      expect(result.allowed).toBe(true);
    });

    it('should allow admin to delete any task', () => {
      const result = checkTaskPermission(admin, task, 'delete');
      expect(result.allowed).toBe(true);
    });
  });

  describe('Manager permissions', () => {
    const manager = createMockUser('manager-1', ['manager']);
    const managerOwner = createMockUser(taskOwnerId, ['manager']);
    const managerTask = createMockTask(taskOwnerId);

    it('should allow manager to edit any task', () => {
      const result = checkTaskPermission(manager, task, 'edit');
      expect(result.allowed).toBe(true);
    });

    it('should allow manager to delete their own task', () => {
      const result = checkTaskPermission(managerOwner, managerTask, 'delete');
      expect(result.allowed).toBe(true);
    });

    it('should deny manager from deleting tasks they do not own', () => {
      const result = checkTaskPermission(manager, task, 'delete');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Managers can only delete tasks they own');
    });
  });

  describe('Regular user permissions', () => {
    const regularUser = createMockUser(taskOwnerId, ['user']);
    const otherUser = createMockUser(otherUserId, ['user']);
    const userTask = createMockTask(taskOwnerId);

    it('should allow user to edit their own task', () => {
      const result = checkTaskPermission(regularUser, userTask, 'edit');
      expect(result.allowed).toBe(true);
    });

    it('should deny user from editing tasks they do not own', () => {
      const result = checkTaskPermission(otherUser, task, 'edit');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('You can only delete or edit tasks you own');
    });

    it('should allow user to delete their own task', () => {
      const result = checkTaskPermission(regularUser, userTask, 'delete');
      expect(result.allowed).toBe(true);
    });

    it('should deny user from deleting tasks they do not own', () => {
      const result = checkTaskPermission(otherUser, task, 'delete');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('You can only delete or edit tasks you own');
    });
  });

  describe('Edge cases', () => {
    const otherUser = createMockUser(otherUserId, ['user']);

    it('should handle unknown action', () => {
      const result = checkTaskPermission(otherUser, task, 'unknown' as any);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Unknown action');
    });
  });
});


