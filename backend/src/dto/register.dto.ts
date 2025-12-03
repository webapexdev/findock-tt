import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsArray } from 'class-validator';
import { IsStrongPassword } from '../validators/password-strength.validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString({ message: 'Password must be a string' })
  @IsStrongPassword()
  @MaxLength(100, { message: 'Password must not exceed 100 characters' })
  password!: string;

  @IsString({ message: 'First name must be a string' })
  @MinLength(1, { message: 'First name is required' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName!: string;

  @IsString({ message: 'Last name must be a string' })
  @MinLength(1, { message: 'Last name is required' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName!: string;

  @IsOptional()
  @IsArray({ message: 'Roles must be an array' })
  @IsString({ each: true, message: 'Each role must be a string' })
  roles?: string[];
}

