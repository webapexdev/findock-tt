import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTask, deleteTask, fetchTasks, updateTask } from '../api/tasks';
import { fetchUsers } from '../api/users';
import { Task, TaskInput } from '../types/task';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { useAuth } from '../hooks/useAuth';

export const TasksPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState<string>('');
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaskInput }) => updateTask(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setEditingTask(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const handleCreate = (payload: TaskInput) => {
    createMutation.mutate(payload);
  };

  const handleUpdate = (payload: TaskInput) => {
    if (!editingTask) return;
    updateMutation.mutate({ id: editingTask.id, payload });
  };

  const canManage = user?.roles.some((role) => role === 'admin' || role === 'manager');

  const handleFilterChange = (assigneeId: string) => {
    setAssigneeFilter(assigneeId);
    if (editingTask) {
      setEditingTask(null);
    }
  };

  return (
    <div className="tasks-page">
      <section className="tasks-section">
        <div className="tasks-section__header">
          <h2>Tasks</h2>
          {users.length > 0 && (
            <div className="tasks-filter">
              <label htmlFor="assignee-filter">Filter by assignee:</label>
              <select
                id="assignee-filter"
                value={assigneeFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="tasks-filter__select"
              >
                <option value="">All tasks</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        {isLoading ? (
          <p>Loading tasks…</p>
        ) : (
          <TaskList
            tasks={tasks}
            filterByAssigneeId={assigneeFilter || undefined}
            onEdit={canManage ? (task) => setEditingTask(task) : undefined}
            onDelete={canManage ? (task) => deleteMutation.mutate(task.id) : undefined}
          />
        )}
      </section>
      {canManage && (
        <section className="tasks-section">
          <h2>{editingTask ? 'Edit Task' : 'Create Task'}</h2>
          <TaskForm
            initialValue={
              editingTask
                ? {
                    title: editingTask.title,
                    description: editingTask.description,
                    status: editingTask.status,
                    assigneeIds: editingTask.assignees.map((assignee) => assignee.id),
                  }
                : undefined
            }
            onSubmit={editingTask ? handleUpdate : handleCreate}
            submitLabel={editingTask ? 'Update Task' : 'Create Task'}
          />
        </section>
      )}
    </div>
  );
};

