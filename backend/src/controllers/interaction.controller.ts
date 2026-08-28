import { Request, Response } from 'express';
import { BookInteractionService } from '../services/bookInteraction.service';
import { z } from 'zod';
import { ReadingStatus } from '../types';

const bookInteractionService = new BookInteractionService();

const commentSchema = z.object({
  content: z.string().min(1).max(1000),
});

const readingListSchema = z.object({
  status: z.enum(['want_to_read', 'reading', 'read']),
});

const searchMyBooksSchema = z.object({
  q: z.string().min(1),
  category: z.enum(['likes', 'reading', 'both']).default('both'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export class InteractionController {
  public static async toggleLike(req: Request, res: Response): Promise<void> {
    try {
      const { olid } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!olid) {
        res.status(400).json({ error: 'Book ID is required' });
        return;
      }

      const result = await bookInteractionService.toggleLike(userId, olid);
      res.json(result);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  }

  public static async getLikes(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await bookInteractionService.getUserLikes(userId, page, limit);
      res.json(result);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  }

  public static async createComment(req: Request, res: Response): Promise<void> {
    try {
      const { olid } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validation = commentSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors });
        return;
      }

      const comment = await bookInteractionService.createComment(userId, olid, validation.data.content);
      res.status(201).json(comment);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  }

  public static async updateComment(req: Request, res: Response): Promise<void> {
    try {
      const { commentId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validation = commentSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors });
        return;
      }

      const comment = await bookInteractionService.updateComment(commentId, userId, validation.data.content);
      res.json(comment);
    } catch (error) {
      const err = error as Error;
      res.status(403).json({ error: err.message });
    }
  }

  public static async deleteComment(req: Request, res: Response): Promise<void> {
    try {
      const { commentId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await bookInteractionService.deleteComment(commentId, userId);
      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      const err = error as Error;
      res.status(403).json({ error: err.message });
    }
  }

  public static async getUserComments(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await bookInteractionService.getUserComments(userId, page, limit);
      res.json(result);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  }

  public static async getBookComments(req: Request, res: Response): Promise<void> {
    try {
      const { olid } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await bookInteractionService.getBookComments(olid, page, limit);
      res.json(result);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  }

  public static async addToReadingList(req: Request, res: Response): Promise<void> {
    try {
      const { olid } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validation = readingListSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors });
        return;
      }

      const item = await bookInteractionService.addToReadingList(
        userId,
        olid,
        validation.data.status as ReadingStatus
      );
      res.json(item);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  }

  public static async removeFromReadingList(req: Request, res: Response): Promise<void> {
    try {
      const { olid } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await bookInteractionService.removeFromReadingList(userId, olid);
      res.json({ message: 'Removed from reading list' });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  }

  public static async getReadingList(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const status = req.query.status as ReadingStatus | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await bookInteractionService.getReadingList(userId, status, page, limit);
      res.json(result);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  }

  public static async searchMyBooks(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validation = searchMyBooksSchema.safeParse(req.query);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors });
        return;
      }

      const result = await bookInteractionService.searchMyBooks(
        userId,
        validation.data.q,
        validation.data.category,
        validation.data.page,
        validation.data.limit
      );
      res.json(result);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  }
}