import { useEffect, useMemo, useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { createTask, deleteTask, fetchTasks, updateTask } from '@/api/tasks';
import { Task, TaskInput, TaskFilters } from '@/types/task';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { TaskFilters as TaskFiltersComponent } from '@/components/TaskFilters';
import { Pagination } from '@/components/Pagination';
import { useAuth } from '@/hooks/useAuth';

const STORAGE_KEY = 'task_filters_preferences';

const getInitialFiltersFromStorage = (): Partial<TaskFilters> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return {};
};

export const TasksPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Get initial values from URL or localStorage
  const initialFilters = useMemo(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlStatus = searchParams.get('status')?.split(',').filter(Boolean) || [];
    const urlAssigneeIds = searchParams.get('assigneeIds')?.split(',').filter(Boolean) || [];
    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    const urlSortBy = (searchParams.get('sortBy') as TaskFilters['sortBy']) || 'createdAt';
    const urlSortOrder = (searchParams.get('sortOrder') as TaskFilters['sortOrder']) || 'DESC';
    const urlMyTasks = searchParams.get('myTasks') === 'true';

    const stored = getInitialFiltersFromStorage();

    return {
      search: urlSearch || stored.search || '',
      status: urlStatus.length > 0 ? urlStatus : (stored.status || []),
      assigneeIds: urlAssigneeIds.length > 0 ? urlAssigneeIds : (stored.assigneeIds || []),
      page: urlPage || stored.page || 1,
      limit: stored.limit || 10,
      sortBy: urlSortBy || stored.sortBy || 'createdAt',
      sortOrder: urlSortOrder || stored.sortOrder || 'DESC',
      myTasks: urlMyTasks || stored.myTasks || false,
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<TaskFilters>({
    search: initialFilters.search as string,
    status: initialFilters.status as string[],
    assigneeIds: initialFilters.assigneeIds as string[],
    page: initialFilters.page as number,
    limit: initialFilters.limit as number,
    sortBy: initialFilters.sortBy as TaskFilters['sortBy'],
    sortOrder: initialFilters.sortOrder as TaskFilters['sortOrder'],
    myTasks: initialFilters.myTasks as boolean,
  });

  // Update URL and localStorage when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status && filters.status.length > 0) {
      params.set('status', filters.status.join(','));
    }
    if (filters.assigneeIds && filters.assigneeIds.length > 0) {
      params.set('assigneeIds', filters.assigneeIds.join(','));
    }
    if (filters.page && filters.page > 1) {
      params.set('page', filters.page.toString());
    }
    if (filters.sortBy && filters.sortBy !== 'createdAt') {
      params.set('sortBy', filters.sortBy);
    }
    if (filters.sortOrder && filters.sortOrder !== 'DESC') {
      params.set('sortOrder', filters.sortOrder);
    }
    if (filters.myTasks) {
      params.set('myTasks', 'true');
    }
    setSearchParams(params, { replace: true });

    // Save to localStorage (bonus)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      search: filters.search,
      status: filters.status,
      assigneeIds: filters.assigneeIds,
      limit: filters.limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      myTasks: filters.myTasks,
    }));
  }, [filters, setSearchParams]);

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => fetchTasks(filters),
  });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      // Error is handled by TaskForm component
      console.error('Failed to create task:', error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaskInput }) => updateTask(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setEditingTask(null);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update task';
      if (error?.response?.status === 403) {
        alert(`Permission denied: ${message}`);
      } else {
        alert(message);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete task';
      if (error?.response?.status === 403) {
        alert(`Permission denied: ${message}`);
      } else {
        alert(message);
      }
    },
  });

  const handleCreate = async (payload: TaskInput) => {
    try {
      await createMutation.mutateAsync(payload);
    } catch (error: any) {
      // Error is handled by TaskForm component
      throw error;
    }
  };

  const handleUpdate = async (payload: TaskInput) => {
    if (!editingTask) return;
    try {
      await updateMutation.mutateAsync({ id: editingTask.id, payload });
    } catch (error: any) {
      // Error is handled by TaskForm component
      throw error;
    }
  };

  // Any authenticated user can create tasks
  // Editing is controlled by checkTaskPermission in Task component
  const canShowTaskForm = !!user;

  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
    if (editingTask) {
      setEditingTask(null);
    }
  }, [editingTask]);

  const handleStatusToggle = (status: string) => {
    setFilters((prev) => {
      const currentStatus = prev.status || [];
      const newStatus = currentStatus.includes(status)
        ? currentStatus.filter((s) => s !== status)
        : [...currentStatus, status];
      return { ...prev, status: newStatus, page: 1 };
    });
    if (editingTask) {
      setEditingTask(null);
    }
  };

  const handleMyTasksToggle = () => {
    setFilters((prev) => ({ ...prev, myTasks: !prev.myTasks, page: 1 }));
    if (editingTask) {
      setEditingTask(null);
    }
  };

  const handleAssigneeIdsChange = (assigneeIds: string[]) => {
    setFilters((prev) => ({ ...prev, assigneeIds, page: 1 }));
    if (editingTask) {
      setEditingTask(null);
    }
  };

  const handleSortChange = (sortBy: TaskFilters['sortBy']) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  };

  const handleSortOrderToggle = () => {
    setFilters((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === 'ASC' ? 'DESC' : 'ASC',
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: [],
      assigneeIds: [],
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      myTasks: false,
    });
    if (editingTask) {
      setEditingTask(null);
    }
  };

  const tasks = tasksData?.tasks || [];
  const pagination = tasksData?.pagination;

  return (
    <div className="tasks-page">
      <section className="tasks-section">
        <div className="tasks-section__header">
          <h2>Tasks</h2>
        </div>
        <TaskFiltersComponent
          search={filters.search || ''}
          statusFilters={(filters.status || []) as Array<'todo' | 'in_progress' | 'done'>}
          assigneeIds={filters.assigneeIds || []}
          myTasks={filters.myTasks || false}
          sortBy={filters.sortBy || 'createdAt'}
          sortOrder={filters.sortOrder || 'DESC'}
          onSearchChange={handleSearchChange}
          onStatusToggle={handleStatusToggle}
          onAssigneeIdsChange={handleAssigneeIdsChange}
          onMyTasksToggle={handleMyTasksToggle}
          onSortChange={handleSortChange}
          onSortOrderToggle={handleSortOrderToggle}
          onClear={handleClearFilters}
        />
        {isLoading ? (
          <p>Loading tasks…</p>
        ) : (
          <>
            <TaskList
              tasks={tasks}
              onEdit={(task) => setEditingTask(task)}
              onDelete={(task) => deleteMutation.mutate(task.id)}
            />
            {pagination && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </section>
      {canShowTaskForm && (
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

