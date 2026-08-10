// ============================================
// Auth DTOs — Request/Response Validation
// ============================================

import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../../generated/prisma';

export class LoginDto {
  @ApiProperty({ example: 'admin@parto.ir' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'use-a-password-manager' })
  @IsString()
  @MinLength(6)
  password!: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'editor@parto.ir' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.EDITOR })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}

export class LoginResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar: string | null;
  };
}

export class TokenResponseDto {
  accessToken!: string;
  refreshToken!: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'currentPassword123' })
  @IsString()
  @MinLength(6)
  currentPassword!: string;

  @ApiProperty({ example: 'newSecurePassword456' })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
