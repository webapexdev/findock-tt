import { IsString, MinLength, MaxLength, IsOptional, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsString({ message: 'Content must be a string' })
  @MinLength(1, { message: 'Comment content is required' })
  @MaxLength(2000, { message: 'Comment must not exceed 2000 characters' })
  content!: string;

  @IsOptional()
  @IsUUID('4', { message: 'Parent ID must be a valid UUID' })
  parentId?: string | null;
}

export class UpdateCommentDto {
  @IsString({ message: 'Content must be a string' })
  @MinLength(1, { message: 'Comment content cannot be empty' })
  @MaxLength(2000, { message: 'Comment must not exceed 2000 characters' })
  content!: string;
}

