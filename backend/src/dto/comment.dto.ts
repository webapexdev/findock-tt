import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString({ message: 'Content must be a string' })
  @MinLength(1, { message: 'Comment content is required' })
  @MaxLength(2000, { message: 'Comment must not exceed 2000 characters' })
  content!: string;
}

export class UpdateCommentDto {
  @IsString({ message: 'Content must be a string' })
  @MinLength(1, { message: 'Comment content cannot be empty' })
  @MaxLength(2000, { message: 'Comment must not exceed 2000 characters' })
  content!: string;
}

