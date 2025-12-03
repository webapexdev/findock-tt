import { apiClient } from './client';

export type Comment = {
  id: string;
  content: string;
  author: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: ('admin' | 'manager' | 'user')[];
  };
  taskId: string;
  parentId: string | null;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
};

export type CommentInput = {
  content: string;
  parentId?: string | null;
};

export const fetchComments = async (taskId: string): Promise<Comment[]> => {
  const { data } = await apiClient.get<Comment[]>(`/tasks/${taskId}/comments`);
  return data;
};

export const createComment = async (taskId: string, payload: CommentInput): Promise<Comment> => {
  const { data } = await apiClient.post<Comment>(`/tasks/${taskId}/comments`, payload);
  return data;
};

export const updateComment = async (
  taskId: string,
  commentId: string,
  payload: { content: string }
): Promise<Comment> => {
  const { data } = await apiClient.put<Comment>(`/comments/${commentId}`, payload);
  return data;
};

export const deleteComment = async (taskId: string, commentId: string): Promise<void> => {
  await apiClient.delete(`/comments/${commentId}`);
};

