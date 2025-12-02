import { apiClient } from './client';
import { Task, TaskInput, TasksResponse, TaskFilters } from '../types/task';

export const fetchTasks = async (filters?: TaskFilters): Promise<TasksResponse> => {
  const params = new URLSearchParams();

  if (filters?.search) {
    params.append('search', filters.search);
  }
  if (filters?.status && filters.status.length > 0) {
    params.append('status', filters.status.join(','));
  }
  if (filters?.page) {
    params.append('page', filters.page.toString());
  }
  if (filters?.limit) {
    params.append('limit', filters.limit.toString());
  }
  if (filters?.sortBy) {
    params.append('sortBy', filters.sortBy);
  }
  if (filters?.sortOrder) {
    params.append('sortOrder', filters.sortOrder);
  }
  if (filters?.myTasks) {
    params.append('myTasks', 'true');
  }

  const queryString = params.toString();
  const url = queryString ? `/tasks?${queryString}` : '/tasks';
  const { data } = await apiClient.get<TasksResponse>(url);
  return data;
};

export const createTask = async (payload: TaskInput): Promise<Task> => {
  const { data } = await apiClient.post<Task>('/tasks', payload);
  return data;
};

export const updateTask = async (id: string, payload: TaskInput): Promise<Task> => {
  const { data } = await apiClient.put<Task>(`/tasks/${id}`, payload);
  return data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await apiClient.delete(`/tasks/${id}`);
};

