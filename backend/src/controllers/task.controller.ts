import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Task } from '../entities/Task';
import { User } from '../entities/User';
import { In, Like, Or } from 'typeorm';
import { checkTaskPermission } from '../utils/permissions';
import { logPermissionDenied } from '../utils/audit';

export class TaskController {
  private taskRepository = AppDataSource.getRepository(Task);
  private userRepository = AppDataSource.getRepository(User);

  private transformUser = (user: User) => ({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: (user.roles || []).map((role) => role.name) as ('admin' | 'manager' | 'user')[],
  });

  private transformTask = (task: Task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    owner: this.transformUser(task.owner),
    assignees: task.assignees?.map((assignee) => this.transformUser(assignee)) || [],
    attachments: task.attachments || [],
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  });

  list = async (req: Request, res: Response) => {
    try {
      const {
        search = '',
        status = '',
        page = '1',
        limit = '10',
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        myTasks = 'false',
      } = req.query;

      const userId = req.user?.userId;
      const userRoles = req.user?.roles || [];
      const isAdmin = userRoles.includes('admin');
      const isManager = userRoles.includes('manager');
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build query builder
      const queryBuilder = this.taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.owner', 'owner')
        .leftJoinAndSelect('owner.roles', 'ownerRoles')
        .leftJoinAndSelect('task.assignees', 'assignees')
        .leftJoinAndSelect('assignees.roles', 'assigneeRoles')
        .leftJoinAndSelect('task.attachments', 'attachments');

      // Role-based task visibility (bonus)
      // Regular users can only see tasks they're involved in (owner or assignee)
      // Managers and admins can see all tasks
      if (!isAdmin && !isManager && userId) {
        queryBuilder.andWhere(
          '(owner.id = :userId OR assignees.id = :userId)',
          { userId }
        );
      }

      // Search filter (title and description) - case-insensitive
      if (search) {
        const searchString = typeof search === 'string' ? search : String(search);
        const searchTerm = `%${searchString.toLowerCase()}%`;
        // Use LOWER() for case-insensitive search (works with both SQLite and PostgreSQL)
        queryBuilder.andWhere(
          '(LOWER(task.title) LIKE :search OR LOWER(task.description) LIKE :search)',
          { search: searchTerm }
        );
      }

      // Status filter (multiple statuses)
      if (status) {
        const statusArray = (status as string).split(',').filter(Boolean);
        if (statusArray.length > 0) {
          queryBuilder.andWhere('task.status IN (:...statuses)', {
            statuses: statusArray,
          });
        }
      }

      // My Tasks filter (bonus)
      if (myTasks === 'true' && userId) {
        queryBuilder.andWhere(
          '(owner.id = :userId OR assignees.id = :userId)',
          { userId }
        );
      }

      // Sorting
      const validSortFields = ['createdAt', 'updatedAt', 'title', 'status'];
      const sortField = validSortFields.includes(sortBy as string)
        ? (sortBy as string)
        : 'createdAt';
      const sortDirection = sortOrder === 'ASC' ? 'ASC' : 'DESC';

      if (sortField === 'title' || sortField === 'status') {
        queryBuilder.orderBy(`task.${sortField}`, sortDirection);
      } else {
        queryBuilder.orderBy(`task.${sortField}`, sortDirection);
      }

      // Get total count before pagination
      const totalCount = await queryBuilder.getCount();

      // Apply pagination
      queryBuilder.skip(skip).take(limitNum);

      // Execute query
      const tasks = await queryBuilder.getMany();
      const transformedTasks = tasks.map((task) => this.transformTask(task));

      return res.json({
        tasks: transformedTasks,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNum),
        },
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return res.status(500).json({
        message: 'Failed to fetch tasks',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const taskId = req.params.id;

      if (!taskId) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: {
            id: ['Task ID is required'],
          },
        });
      }

      const task = await this.taskRepository.findOne({
        where: { id: taskId },
        relations: ['owner', 'owner.roles', 'assignees', 'assignees.roles', 'attachments'],
      });

      if (!task) {
        return res.status(404).json({
          message: 'Task not found',
          errors: {
            id: ['No task found with the provided ID'],
          },
        });
      }

      return res.json(this.transformTask(task));
    } catch (error) {
      console.error('Error fetching task:', error);
      return res.status(500).json({
        message: 'Failed to fetch task',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  create = async (req: Request, res: Response) => {
    const { title, description, status = 'todo', assigneeIds = [] } = req.body;
    const ownerId = req.user?.userId;

    try {
      if (!ownerId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const owner = await this.userRepository.findOne({
        where: { id: ownerId },
        relations: ['roles'],
      });
      if (!owner) {
        return res.status(404).json({
          message: 'Owner not found',
          errors: {
            ownerId: ['User not found'],
          },
        });
      }

      let assignees: User[] = [];
      if (assigneeIds && assigneeIds.length > 0) {
        assignees = await this.userRepository.find({
          where: { id: In(assigneeIds) },
          relations: ['roles'],
        });

        // Check if all assignee IDs are valid
        const foundIds = assignees.map((a) => a.id);
        const invalidIds = assigneeIds.filter((id: string) => !foundIds.includes(id));
        if (invalidIds.length > 0) {
          return res.status(400).json({
            message: 'Validation failed',
            errors: {
              assigneeIds: [`Invalid assignee IDs: ${invalidIds.join(', ')}`],
            },
          });
        }
      }

      const task = this.taskRepository.create({
        title,
        description,
        status,
        owner,
        assignees,
      });

      const saved = await this.taskRepository.save(task);
      // Reload with relations to get roles
      const taskWithRelations = await this.taskRepository.findOne({
        where: { id: saved.id },
        relations: ['owner', 'assignees', 'attachments'],
      });
      if (!taskWithRelations) {
        return res.status(500).json({ message: 'Failed to fetch created task' });
      }
      return res.status(201).json(this.transformTask(taskWithRelations));
    } catch (error) {
      console.error('Error creating task:', error);
      return res.status(500).json({
        message: 'Failed to create task',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  update = async (req: Request, res: Response) => {
    const taskId = req.params.id;
    const { title, description, status, assigneeIds = [] } = req.body;

    try {
      if (!taskId) {
        return res.status(400).json({ message: 'Task id is required' });
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const task = await this.taskRepository.findOne({
        where: { id: taskId },
        relations: ['owner', 'assignees', 'attachments'],
      });
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Check permission to edit
      const permissionCheck = checkTaskPermission(req.user, task, 'edit');
      if (!permissionCheck.allowed) {
        // Log permission denied attempt (bonus)
        logPermissionDenied(req, task, 'edit', permissionCheck.reason || 'Permission denied');
        return res.status(403).json({
          message: permissionCheck.reason || 'Permission denied',
        });
      }

      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status;
      if (assigneeIds !== undefined) {
        if (assigneeIds && assigneeIds.length > 0) {
          const assignees = await this.userRepository.find({
            where: { id: In(assigneeIds) },
            relations: ['roles'],
          });

          // Check if all assignee IDs are valid
          const foundIds = assignees.map((a) => a.id);
          const invalidIds = assigneeIds.filter((id: string) => !foundIds.includes(id));
          if (invalidIds.length > 0) {
            return res.status(400).json({
              message: 'Validation failed',
              errors: {
                assigneeIds: [`Invalid assignee IDs: ${invalidIds.join(', ')}`],
              },
            });
          }
          task.assignees = assignees;
        } else {
          task.assignees = [];
        }
      }

      const updated = await this.taskRepository.save(task);
      // Reload with relations to get roles
      const taskWithRelations = await this.taskRepository.findOne({
        where: { id: updated.id },
        relations: ['owner', 'assignees', 'attachments'],
      });
      if (!taskWithRelations) {
        return res.status(500).json({ message: 'Failed to fetch updated task' });
      }
      return res.json(this.transformTask(taskWithRelations));
    } catch (error) {
      console.error('Error updating task:', error);
      return res.status(500).json({
        message: 'Failed to update task',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  remove = async (req: Request, res: Response) => {
    const taskId = req.params.id;

    try {
      if (!taskId) {
        return res.status(400).json({ message: 'Task id is required' });
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const task = await this.taskRepository.findOne({
        where: { id: taskId },
        relations: ['owner'],
      });
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Check permission to delete
      const permissionCheck = checkTaskPermission(req.user, task, 'delete');
      if (!permissionCheck.allowed) {
        // Log permission denied attempt (bonus)
        logPermissionDenied(req, task, 'delete', permissionCheck.reason || 'Permission denied');
        return res.status(403).json({
          message: permissionCheck.reason || 'Permission denied',
        });
      }

      await this.taskRepository.remove(task);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting task:', error);
      return res.status(500).json({
        message: 'Failed to delete task',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };
}

