import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from './Task';
import { User } from './User';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  content!: string;

  @ManyToOne(() => Task, (task) => task.comments, { nullable: false, onDelete: 'CASCADE' })
  task!: Task;

  @ManyToOne(() => User, { nullable: false, eager: true })
  author!: User;

  @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true, onDelete: 'CASCADE' })
  parent!: Comment | null;

  @Column({ nullable: true })
  parentId!: string | null;

  @OneToMany(() => Comment, (comment) => comment.parent, { cascade: true })
  replies!: Comment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}


