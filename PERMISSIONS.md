# Task Permissions Matrix

This document outlines the role-based access control (RBAC) permissions for task operations in the application.

## Roles

- **Admin**: Full access to all tasks
- **Manager**: Can edit any task, but can only delete their own tasks
- **User**: Can only edit and delete tasks they own

## Task Operations

### Create Task
- **All authenticated users** can create tasks
- The creator automatically becomes the task owner

### View Tasks
- **Admin**: Can view all tasks
- **Manager**: Can view all tasks
- **User**: Can only view tasks where they are:
  - The owner, OR
  - An assignee

## Permission Rules Summary

1. **Admins** have full access to all tasks (view, edit, delete)
2. **Managers** can:
   - View all tasks
   - Edit any task
   - Delete only their own tasks
3. **Regular users** can:
   - View only tasks they're involved in (owner or assignee)
   - Edit only their own tasks
   - Delete only their own tasks

## Error Messages

When permission is denied, users receive specific error messages:

- **Edit denied (User)**: "You can only edit tasks you own"
- **Delete denied (Manager)**: "Managers can only delete tasks they own"
- **Delete denied (User)**: "You can only delete tasks you own"

## Audit Logging

All permission-denied attempts are logged for security auditing purposes. The audit log includes:
- User ID
- Action attempted (edit/delete)
- Task ID
- Reason for denial
- Timestamp
- User roles

## Implementation

### Backend
- Permission checks are implemented in `backend/src/utils/permissions.ts`
- Task controller (`backend/src/controllers/task.controller.ts`) enforces permissions on update and delete operations
- Role-based visibility is enforced in the task list endpoint

### Frontend
- Permission checks are implemented in `frontend/src/utils/permissions.ts`
- Task component (`frontend/src/components/Task.tsx`) hides edit/delete buttons based on permissions
- Error handling displays appropriate messages when permission is denied

## Testing

Unit tests for permission logic are located in `backend/src/utils/permissions.test.ts`.



