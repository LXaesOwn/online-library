import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { z } from 'zod';

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

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors });
        return;
      }

      const { username, password } = validation.data;
      const result = await UserService.register(username, password);
      
      res.status(201).json({
        message: 'Registration successful',
        user: {
          id: result.user.id,
          username: result.user.username,
        },
        token: result.token,
      });
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ error: err.message });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors });
        return;
      }

      const { username, password } = validation.data;
      const result = await UserService.login(username, password);
      
      res.json({
        message: 'Login successful',
        user: {
          id: result.user.id,
          username: result.user.username,
        },
        token: result.token,
      });
    } catch (error) {
      const err = error as Error;
      res.status(401).json({ error: err.message });
    }
  }

  public static async me(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const userData = await UserService.getUserById(user.userId);
      
      if (!userData) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        id: userData.id,
        username: userData.username,
        created_at: userData.created_at,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  }

  public static async updateUsername(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validation = updateUsernameSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors });
        return;
      }

      const updatedUser = await UserService.updateUsername(user.userId, validation.data.username);
      
      res.json({
        message: 'Username updated successfully',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
        },
      });
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ error: err.message });
    }
  }

  public static async updatePassword(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validation = updatePasswordSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors });
        return;
      }

      await UserService.updatePassword(
        user.userId,
        validation.data.currentPassword,
        validation.data.newPassword
      );
      
      res.json({
        message: 'Password updated successfully',
      });
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ error: err.message });
    }
  }
}