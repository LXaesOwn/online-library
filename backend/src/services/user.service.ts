import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import env from '../config/env';
import { AUTH } from '../config/constants';
import { logger } from '../config/logger';
import * as userRepository from '../repositories/userRepository';
import type { JwtPayload, User } from '../types';

function generateToken(userId: string, username: string): string {
  const payload: JwtPayload = { userId, username };
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

function toUser(row: userRepository.UserRow): User {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class UserService {
  public static async register(username: string, password: string): Promise<{ user: User; token: string }> {
    logger.debug({ username }, 'register attempt');

    const existing = await userRepository.findByUsername(username);
    if (existing) throw new Error('Username already taken');

    const passwordHash = await bcrypt.hash(password, AUTH.SALT_ROUNDS);
    const row = await userRepository.insert(username, passwordHash);
    const token = generateToken(row.id, row.username);

    logger.info({ userId: row.id, username }, 'user registered');
    return { user: toUser(row), token };
  }

  public static async login(username: string, password: string): Promise<{ user: User; token: string }> {
    logger.debug({ username }, 'login attempt');

    const row = await userRepository.findByUsernameFull(username);
    if (!row) throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) throw new Error('Invalid credentials');

    const token = generateToken(row.id, row.username);
    logger.info({ userId: row.id }, 'login successful');
    return { user: toUser(row), token };
  }

  public static async getUserById(userId: string): Promise<User | null> {
    const row = await userRepository.findById(userId);
    return row ? toUser(row) : null;
  }

  public static async updateUsername(userId: string, newUsername: string): Promise<User> {
    const existing = await userRepository.findIdByUsernameExcluding(newUsername, userId);
    if (existing) throw new Error('Username already taken');

    const row = await userRepository.updateUsername(userId, newUsername);
    return toUser(row);
  }

  public static async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const row = await userRepository.findById(userId);
    if (!row) throw new Error('User not found');

    const valid = await bcrypt.compare(currentPassword, row.password_hash);
    if (!valid) throw new Error('Current password is incorrect');

    const newHash = await bcrypt.hash(newPassword, AUTH.SALT_ROUNDS);
    await userRepository.updatePassword(userId, newHash);
  }
}
