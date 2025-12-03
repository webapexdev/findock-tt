import { apiClient } from './client';

export type Notification = {
  id: string;
  taskId: string;
  commentId: string;
  read: boolean;
  createdAt: string;
  task: {
    id: string;
    title: string;
  };
  comment: {
    id: string;
    content: string;
    author: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
};

export type NotificationsResponse = {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type UnreadCountResponse = {
  count: number;
};

export const fetchNotifications = async (page: number = 1, limit: number = 20): Promise<NotificationsResponse> => {
  const { data } = await apiClient.get<NotificationsResponse>(`/notifications?page=${page}&limit=${limit}`);
  return data;
};

export const fetchUnreadCount = async (): Promise<UnreadCountResponse> => {
  const { data } = await apiClient.get<UnreadCountResponse>('/notifications/unread-count');
  return data;
};

export const markNotificationsAsReadByTask = async (taskId: string): Promise<void> => {
  await apiClient.put(`/notifications/read-by-task/${taskId}`);
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  await apiClient.put(`/notifications/${notificationId}/read`);
};

