import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Comment } from '../entities/Comment';
import { Task } from '../entities/Task';
import { User } from '../entities/User';

export class CommentController {
  private commentRepository = AppDataSource.getRepository(Comment);
  private taskRepository = AppDataSource.getRepository(Task);
  private userRepository = AppDataSource.getRepository(User);

  private transformUser = (user: User) => ({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: (user.roles || []).map((role) => role.name) as ('admin' | 'manager' | 'user')[],
  });

  private transformComment = (comment: Comment, includeReplies: boolean = true): any => {
    const base = {
      id: comment.id,
      content: comment.content,
      author: this.transformUser(comment.author),
      taskId: comment.task.id,
      parentId: comment.parentId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };

    if (includeReplies && comment.replies && comment.replies.length > 0) {
      return {
        ...base,
        replies: comment.replies.map((reply) => this.transformComment(reply, true)),
      };
    }

    return base;
  };

  list = async (req: Request, res: Response) => {
    try {
      const taskId = req.params.taskId;

      if (!taskId) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: {
            taskId: ['Task ID is required'],
          },
        });
      }

      const task = await this.taskRepository.findOne({
        where: { id: taskId },
      });

      if (!task) {
        return res.status(404).json({
          message: 'Task not found',
          errors: {
            taskId: ['No task found with the provided ID'],
          },
        });
      }

      // Load all comments for this task at once
      const allComments = await this.commentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.author', 'author')
        .leftJoinAndSelect('author.roles', 'roles')
        .leftJoinAndSelect('comment.task', 'task')
        .where('comment.taskId = :taskId', { taskId })
        .orderBy('comment.createdAt', 'ASC')
        .getMany();

      // Build tree structure in memory
      const commentMap = new Map<string, Comment & { replies: Comment[] }>();
      const rootComments: Comment[] = [];

      // First pass: create map of all comments with empty replies array
      allComments.forEach((comment) => {
        (comment as any).replies = [];
        commentMap.set(comment.id, comment as Comment & { replies: Comment[] });
      });

      // Second pass: build tree structure
      allComments.forEach((comment) => {
        if (comment.parentId) {
          const parent = commentMap.get(comment.parentId);
          if (parent) {
            parent.replies.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });

      const transformedComments = rootComments.map((comment) => this.transformComment(comment, true));

      return res.json(transformedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).json({
        message: 'Failed to fetch comments',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const taskId = req.params.taskId;
      const { content, parentId } = req.body;
      const authorId = req.user?.userId;

      if (!taskId) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: {
            taskId: ['Task ID is required'],
          },
        });
      }

      if (!authorId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const task = await this.taskRepository.findOne({
        where: { id: taskId },
      });

      if (!task) {
        return res.status(404).json({
          message: 'Task not found',
          errors: {
            taskId: ['No task found with the provided ID'],
          },
        });
      }

      const author = await this.userRepository.findOne({
        where: { id: authorId },
        relations: ['roles'],
      });

      if (!author) {
        return res.status(404).json({
          message: 'Author not found',
          errors: {
            authorId: ['User not found'],
          },
        });
      }

      // If parentId is provided, validate it exists and belongs to the same task
      let parent: Comment | null = null;
      if (parentId) {
        parent = await this.commentRepository.findOne({
          where: { id: parentId },
          relations: ['task'],
        });

        if (!parent) {
          return res.status(404).json({
            message: 'Parent comment not found',
            errors: {
              parentId: ['No comment found with the provided parent ID'],
            },
          });
        }

        if (parent.task.id !== taskId) {
          return res.status(400).json({
            message: 'Validation failed',
            errors: {
              parentId: ['Parent comment must belong to the same task'],
            },
          });
        }
      }

      const comment = this.commentRepository.create({
        content: content.trim(),
        task,
        author,
        parent: parent || null,
        parentId: parentId || null,
      });

      const saved = await this.commentRepository.save(comment);

      // Reload with relations
      const commentWithRelations = await this.commentRepository.findOne({
        where: { id: saved.id },
        relations: ['author', 'author.roles', 'task', 'parent'],
      });

      if (!commentWithRelations) {
        return res.status(500).json({ message: 'Failed to fetch created comment' });
      }

      return res.status(201).json(this.transformComment(commentWithRelations, false));
    } catch (error) {
      console.error('Error creating comment:', error);
      return res.status(500).json({
        message: 'Failed to create comment',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const commentId = req.params.id;
      const { content } = req.body;
      const userId = req.user?.userId;

      if (!commentId) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: {
            id: ['Comment ID is required'],
          },
        });
      }

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const comment = await this.commentRepository.findOne({
        where: { id: commentId },
        relations: ['author', 'task'],
      });

      if (!comment) {
        return res.status(404).json({
          message: 'Comment not found',
          errors: {
            id: ['No comment found with the provided ID'],
          },
        });
      }

      // Only the author can edit their own comment
      if (comment.author.id !== userId) {
        return res.status(403).json({
          message: 'Permission denied',
          errors: {
            _general: ['You can only edit your own comments'],
          },
        });
      }

      comment.content = content.trim();
      const updated = await this.commentRepository.save(comment);

      // Reload with relations
      const commentWithRelations = await this.commentRepository.findOne({
        where: { id: updated.id },
        relations: ['author', 'author.roles', 'task'],
      });

      if (!commentWithRelations) {
        return res.status(500).json({ message: 'Failed to fetch updated comment' });
      }

      return res.json(this.transformComment(commentWithRelations));
    } catch (error) {
      console.error('Error updating comment:', error);
      return res.status(500).json({
        message: 'Failed to update comment',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  remove = async (req: Request, res: Response) => {
    try {
      const commentId = req.params.id;
      const userId = req.user?.userId;

      if (!commentId) {
        return res.status(400).json({ message: 'Comment id is required' });
      }

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const comment = await this.commentRepository.findOne({
        where: { id: commentId },
        relations: ['author'],
      });

      if (!comment) {
        return res.status(404).json({
          message: 'Comment not found',
          errors: {
            id: ['No comment found with the provided ID'],
          },
        });
      }

      // Only the author can delete their own comment
      if (comment.author.id !== userId) {
        return res.status(403).json({
          message: 'Permission denied',
          errors: {
            _general: ['You can only delete your own comments'],
          },
        });
      }

      await this.commentRepository.remove(comment);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting comment:', error);
      return res.status(500).json({
        message: 'Failed to delete comment',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };
}

