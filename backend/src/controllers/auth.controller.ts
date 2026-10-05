import { Request, Response } from 'express';
import { z } from 'zod';
import { UserService } from '../services/user.service';
import { HTTP } from '../config/constants';
import { logger } from '../config/logger';

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const updateUsernameSchema = z.object({
  username: z.string().min(3).max(50),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

function handleError(error: unknown, res: Response, context: string): void {
  const err = error as Error;
  logger.error({ err, context }, 'auth error');

  // Пользовательские ошибки — 400
  const clientMessages = [
    'Username already taken',
    'Invalid credentials',
    'Current password is incorrect',
    'User not found',
  ];

  if (clientMessages.includes(err.message)) {
    res.status(HTTP.STATUS.BAD_REQUEST).json({ error: err.message });
    return;
  }

  //(Supabase/fetch/network) — 503
  if (err.message.includes('fetch failed') || err.message.includes('ENOTFOUND')) {
    res.status(HTTP.STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Database temporarily unavailable. Please try again.',
    });
    return;
  }

  res.status(HTTP.STATUS.INTERNAL_SERVER_ERROR).json({ error: err.message });
}

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(HTTP.STATUS.BAD_REQUEST).json({ error: validation.error.errors });
      return;
    }

    try {
      const { username, password } = validation.data;
      const result = await UserService.register(username, password);

      res.status(HTTP.STATUS.CREATED).json({
        message: 'Registration successful',
        user: { id: result.user.id, username: result.user.username },
        token: result.token,
      });
    } catch (error) {
      handleError(error, res, 'register');
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(HTTP.STATUS.BAD_REQUEST).json({ error: validation.error.errors });
      return;
    }

    try {
      const result = await UserService.login(validation.data.username, validation.data.password);
      res.json({
        message: 'Login successful',
        user: { id: result.user.id, username: result.user.username },
        token: result.token,
      });
    } catch (error) {
      handleError(error, res, 'login');
    }
  }

  public static async me(req: Request, res: Response): Promise<void> {
    const user = req.user;
    if (!user) {
      res.status(HTTP.STATUS.UNAUTHORIZED).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const userData = await UserService.getUserById(user.userId);
      if (!userData) {
        res.status(HTTP.STATUS.NOT_FOUND).json({ error: 'User not found' });
        return;
      }
      res.json({ id: userData.id, username: userData.username, createdAt: userData.createdAt });
    } catch (error) {
      handleError(error, res, 'me');
    }
  }

  public static async updateUsername(req: Request, res: Response): Promise<void> {
    const user = req.user;
    if (!user) {
      res.status(HTTP.STATUS.UNAUTHORIZED).json({ error: 'Unauthorized' });
      return;
    }

    const validation = updateUsernameSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(HTTP.STATUS.BAD_REQUEST).json({ error: validation.error.errors });
      return;
    }

    try {
      const updatedUser = await UserService.updateUsername(user.userId, validation.data.username);
      res.json({
        message: 'Username updated successfully',
        user: { id: updatedUser.id, username: updatedUser.username },
      });
    } catch (error) {
      handleError(error, res, 'updateUsername');
    }
  }

  public static async updatePassword(req: Request, res: Response): Promise<void> {
    const user = req.user;
    if (!user) {
      res.status(HTTP.STATUS.UNAUTHORIZED).json({ error: 'Unauthorized' });
      return;
    }

    const validation = updatePasswordSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(HTTP.STATUS.BAD_REQUEST).json({ error: validation.error.errors });
      return;
    }

    try {
      await UserService.updatePassword(
        user.userId,
        validation.data.currentPassword,
        validation.data.newPassword
      );
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      handleError(error, res, 'updatePassword');
    }
  }
}