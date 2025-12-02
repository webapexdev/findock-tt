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

  private transformComment = (comment: Comment) => ({
    id: comment.id,
    content: comment.content,
    author: this.transformUser(comment.author),
    taskId: comment.task.id,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  });

  list = async (req: Request, res: Response) => {
    try {
      const taskId = req.params.taskId;

      if (!taskId) {
        return res.status(400).json({ message: 'Task id is required' });
      }

      const task = await this.taskRepository.findOne({
        where: { id: taskId },
      });

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const comments = await this.commentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.author', 'author')
        .leftJoinAndSelect('author.roles', 'roles')
        .leftJoinAndSelect('comment.task', 'task')
        .where('comment.taskId = :taskId', { taskId })
        .orderBy('comment.createdAt', 'ASC')
        .getMany();

      const transformedComments = comments.map((comment) => this.transformComment(comment));

      return res.json(transformedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).json({ message: 'Failed to fetch comments' });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const taskId = req.params.taskId;
      const { content } = req.body;
      const authorId = req.user?.userId;

      if (!taskId) {
        return res.status(400).json({ message: 'Task id is required' });
      }

      if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Comment content is required' });
      }

      if (!authorId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const task = await this.taskRepository.findOne({
        where: { id: taskId },
      });

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const author = await this.userRepository.findOne({
        where: { id: authorId },
        relations: ['roles'],
      });

      if (!author) {
        return res.status(404).json({ message: 'Author not found' });
      }

      const comment = this.commentRepository.create({
        content: content.trim(),
        task,
        author,
      });

      const saved = await this.commentRepository.save(comment);

      // Reload with relations
      const commentWithRelations = await this.commentRepository.findOne({
        where: { id: saved.id },
        relations: ['author', 'author.roles', 'task'],
      });

      if (!commentWithRelations) {
        return res.status(500).json({ message: 'Failed to fetch created comment' });
      }

      return res.status(201).json(this.transformComment(commentWithRelations));
    } catch (error) {
      return res.status(500).json({ message: 'Failed to create comment' });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const commentId = req.params.id;
      const { content } = req.body;
      const userId = req.user?.userId;

      if (!commentId) {
        return res.status(400).json({ message: 'Comment id is required' });
      }

      if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Comment content is required' });
      }

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const comment = await this.commentRepository.findOne({
        where: { id: commentId },
        relations: ['author', 'task'],
      });

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      // Only the author can edit their own comment
      if (comment.author.id !== userId) {
        return res.status(403).json({ message: 'You can only edit your own comments' });
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
      return res.status(500).json({ message: 'Failed to update comment' });
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
        return res.status(404).json({ message: 'Comment not found' });
      }

      // Only the author can delete their own comment
      if (comment.author.id !== userId) {
        return res.status(403).json({ message: 'You can only delete your own comments' });
      }

      await this.commentRepository.remove(comment);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: 'Failed to delete comment' });
    }
  };
}

