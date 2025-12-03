import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Notification } from '../entities/Notification';

export class NotificationController {
  private notificationRepository = AppDataSource.getRepository(Notification);

  list = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { page = '1', limit = '20' } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const [notifications, total] = await this.notificationRepository.findAndCount({
        where: {
          userId,
          read: false,
        },
        relations: ['task', 'comment', 'comment.author'],
        order: {
          createdAt: 'DESC',
        },
        skip,
        take: limitNum,
      });

      const transformedNotifications = notifications.map((notification) => ({
        id: notification.id,
        taskId: notification.taskId,
        commentId: notification.commentId,
        read: notification.read,
        createdAt: notification.createdAt,
        task: {
          id: notification.task.id,
          title: notification.task.title,
        },
        comment: {
          id: notification.comment.id,
          content: notification.comment.content.substring(0, 100),
          author: {
            id: notification.comment.author.id,
            firstName: notification.comment.author.firstName,
            lastName: notification.comment.author.lastName,
          },
        },
      }));

      return res.json({
        notifications: transformedNotifications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({
        message: 'Failed to fetch notifications',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  getUnreadCount = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const count = await this.notificationRepository.count({
        where: {
          userId,
          read: false,
        },
      });

      return res.json({ count });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return res.status(500).json({
        message: 'Failed to fetch unread count',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  markAsReadByTask = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      const taskId = req.params.taskId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!taskId) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: {
            taskId: ['Task ID is required'],
          },
        });
      }

      await this.notificationRepository.update(
        {
          userId,
          taskId,
          read: false,
        },
        {
          read: true,
        }
      );

      return res.status(204).send();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      return res.status(500).json({
        message: 'Failed to mark notifications as read',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  markAsRead = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      const notificationId = req.params.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!notificationId) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: {
            id: ['Notification ID is required'],
          },
        });
      }

      const notification = await this.notificationRepository.findOne({
        where: { id: notificationId, userId },
      });

      if (!notification) {
        return res.status(404).json({
          message: 'Notification not found',
          errors: {
            id: ['No notification found with the provided ID'],
          },
        });
      }

      notification.read = true;
      await this.notificationRepository.save(notification);

      return res.status(204).send();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return res.status(500).json({
        message: 'Failed to mark notification as read',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };
}

