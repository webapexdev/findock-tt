import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from './Task';
import { Comment } from './Comment';
import { User } from './User';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Task, { nullable: false, onDelete: 'CASCADE' })
  task!: Task;

  @Column()
  taskId!: string;

  @ManyToOne(() => Comment, { nullable: false, onDelete: 'CASCADE' })
  comment!: Comment;

  @Column()
  commentId!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user!: User;

  @Column()
  userId!: string;

  @Column({ default: false })
  read!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

