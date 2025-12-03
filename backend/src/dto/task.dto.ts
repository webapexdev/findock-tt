import { IsString, IsOptional, IsEnum, IsArray, IsUUID, MinLength, MaxLength, ArrayMaxSize } from 'class-validator';

export class CreateTaskDto {
  @IsString({ message: 'Title must be a string' })
  @MinLength(1, { message: 'Title is required' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title!: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  description?: string;

  @IsOptional()
  @IsEnum(['todo', 'in_progress', 'done'], {
    message: 'Status must be one of: todo, in_progress, done',
  })
  status?: 'todo' | 'in_progress' | 'done';

  @IsOptional()
  @IsArray({ message: 'Assignee IDs must be an array' })
  @IsUUID('4', { each: true, message: 'Each assignee ID must be a valid UUID' })
  @ArrayMaxSize(50, { message: 'Cannot assign more than 50 users to a task' })
  assigneeIds?: string[];
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MinLength(1, { message: 'Title cannot be empty' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  description?: string;

  @IsOptional()
  @IsEnum(['todo', 'in_progress', 'done'], {
    message: 'Status must be one of: todo, in_progress, done',
  })
  status?: 'todo' | 'in_progress' | 'done';

  @IsOptional()
  @IsArray({ message: 'Assignee IDs must be an array' })
  @IsUUID('4', { each: true, message: 'Each assignee ID must be a valid UUID' })
  @ArrayMaxSize(50, { message: 'Cannot assign more than 50 users to a task' })
  assigneeIds?: string[];
}

