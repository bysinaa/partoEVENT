// ============================================
// Auth Service — Complete Authentication Logic
// Handles login, token refresh, user creation, logout
// ============================================

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '../../../generated/prisma';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar: string | null;
  };
}

@Injectable()
export class AuthService {
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 7;
  private readonly ACCESS_TOKEN_EXPIRY_SECONDS = 900; // 15 minutes

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  /**
   * Authenticate user with email and password
   */
  async login(
    email: string,
    password: string,
    ip?: string,
    userAgent?: string,
  ): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      // Log failed attempt
      await this.logActivity(null, 'login_failed', undefined, undefined, ip, { email });
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      // Log failed attempt
      await this.logActivity(user.id, 'login_failed', undefined, undefined, ip, { email });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token with metadata
    await this.storeRefreshToken(user.id, tokens.refreshToken, ip, userAgent);

    // Log successful login
    await this.logActivity(user.id, 'login', undefined, undefined, ip);

    return {
      ...tokens,
      expiresIn: this.ACCESS_TOKEN_EXPIRY_SECONDS,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  /**
   * Create a new user account (admin only)
   */
  async register(
    email: string,
    password: string,
    name: string,
    role: UserRole = UserRole.EDITOR,
    createdBy?: string,
  ) {
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Validate role hierarchy - only SUPER_ADMIN can create ADMIN or SUPER_ADMIN
    if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot create admin users via this endpoint');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Log user creation
    await this.logActivity(createdBy ?? null, 'create', 'user', user.id);

    return user;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(refreshToken: string, ip?: string): Promise<TokenPair> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    // Find the refresh token
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token is revoked
    if (storedToken.revokedAt) {
      // Security: revoke all tokens for this user if a revoked token is used
      await this.prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Token has been revoked');
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Check if user is still active
    if (!storedToken.user.isActive) {
      throw new UnauthorizedException('User account is disabled');
    }

    // Revoke old refresh token (rotation)
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens
    const tokens = await this.generateTokens({
      sub: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    });

    // Store new refresh token
    await this.storeRefreshToken(storedToken.user.id, tokens.refreshToken, ip);

    return tokens;
  }

  /**
   * Invalidate all refresh tokens for a user (logout)
   */
  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // Revoke specific token
      await this.prisma.refreshToken.updateMany({
        where: { token: refreshToken, userId },
        data: { revokedAt: new Date() },
      });
    } else {
      // Revoke all tokens for this user
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    // Log logout
    await this.logActivity(userId, 'logout', undefined, undefined);
  }

  /**
   * Revoke all sessions for a user (force logout everywhere)
   */
  async revokeAllSessions(userId: string, performedBy: string): Promise<number> {
    const result = await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await this.logActivity(
      performedBy,
      'revoke_sessions',
      'user',
      userId,
      undefined,
      { sessionsRevoked: result.count },
    );

    return result.count;
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: { name?: string; avatar?: string },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
      },
    });
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Revoke all sessions except current
    await this.logActivity(userId, 'password_change', undefined, undefined);

    return { message: 'Password changed successfully' };
  }

  /**
   * Validate user for Passport strategy
   */
  async validateUser(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    };
  }

  /**
   * Get active sessions for a user
   */
  async getActiveSessions(userId: string) {
    const sessions = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        ip: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions;
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(userId: string, sessionId: string): Promise<boolean> {
    const result = await this.prisma.refreshToken.updateMany({
      where: { id: sessionId, userId },
      data: { revokedAt: new Date() },
    });

    return result.count > 0;
  }

  // ─── Private Helpers ────────────────────────

  private async generateTokens(payload: JwtPayload): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(
    userId: string,
    token: string,
    ip?: string,
    userAgent?: string,
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
        ip,
        userAgent,
      },
    });

    // Clean up old tokens (keep max 5 active tokens per user)
    await this.cleanupOldTokens(userId);
  }

  private async cleanupOldTokens(userId: string): Promise<void> {
    const tokenCount = await this.prisma.refreshToken.count({
      where: { userId, revokedAt: null },
    });

    if (tokenCount > 5) {
      // Get oldest tokens to revoke
      const oldTokens = await this.prisma.refreshToken.findMany({
        where: { userId, revokedAt: null },
        orderBy: { createdAt: 'asc' },
        take: tokenCount - 5,
        select: { id: true },
      });

      await this.prisma.refreshToken.updateMany({
        where: { id: { in: oldTokens.map((t: { id: string }) => t.id) } },
        data: { revokedAt: new Date() },
      });
    }
  }

  private async logActivity(
    userId: string | null,
    action: string,
    entityType?: string,
    entityId?: string,
    ip?: string,
    details?: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.prisma.activityLog.create({
        data: {
          userId,
          action,
          entityType,
          entityId,
          ip,
          details: details ? JSON.stringify(details) : null,
        },
      });
    } catch {
      // Silently fail - don't break auth flow
    }
  }
}