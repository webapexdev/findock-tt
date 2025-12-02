import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  list = async (_req: Request, res: Response) => {
    try {
      const users = await this.userRepository.find({
        relations: ['roles'],
        order: {
          firstName: 'ASC',
          lastName: 'ASC',
        },
      });
      // Transform to match frontend AuthUser type (roles as string array)
      const transformedUsers = users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map((role) => role.name) as ('admin' | 'manager' | 'user')[],
      }));
      return res.json(transformedUsers);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch users' });
    }
  };
}

