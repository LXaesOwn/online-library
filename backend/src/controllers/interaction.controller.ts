import { Request, Response } from 'express';
import { z } from 'zod';
import { HTTP } from '../config/constants';
import * as bookInteractionService from '../services/bookInteraction.service';
import type { ReadingStatus } from '../types';

const commentSchema = z.object({ content: z.string().min(1).max(1000) });
const readingListSchema = z.object({ status: z.enum(['want_to_read', 'reading', 'read']) });
const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});
const searchMyBooksSchema = paginationSchema.extend({
  q: z.string().min(1),
  category: z.enum(['likes', 'reading', 'both']).default('both'),
});

function getUserId(req: Request, res: Response): string | null {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(HTTP.STATUS.UNAUTHORIZED).json({ error: 'Unauthorized' });
    return null;
  }
  return userId;
}

export class InteractionController {
  public static async toggleLike(req: Request, res: Response): Promise<void> {
    try {
      const userId = getUserId(req, res);
      if (!userId) return;

      const { olid } = req.params;
      if (!olid) {
        res.status(HTTP.STATUS.BAD_REQUEST).json({ error: 'Book ID is required' });
        return;
      }

      res.json(await bookInteractionService.toggleLike(userId, olid));
    } catch (error) {
      const err = error as Error;
      res.status(HTTP.STATUS.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
  }

  public static async getLikes(req: Request, res: Response): Promise<void> {
    try {
      const userId = getUserId(req, res);
      if (!userId) return;

      const { page, limit } = paginationSchema.parse(req.query);
      res.json(await bookInteractionService.getUserLikes(userId, page, limit));
    } catch (error) {
      const err = error as Error;
      res.status(HTTP.STATUS.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
  }

  public static async createComment(req: Request, res: Response): Promise<void> {
    try {
      const userId = getUserId(req, res);
      if (!userId) return;

      const validation = commentSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(HTTP.STATUS.BAD_REQUEST).json({ error: validation.error.errors });
        return;
      }

      const comment = await bookInteractionService.createComment(
        userId,
        req.params.olid,
        validation.data.content
      );
      res.status(HTTP.STATUS.CREATED).json(comment);
    } catch (error) {
      const err = error as Error;
      res.status(HTTP.STATUS.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
  }

  public static async updateComment(req: Request, res: Response): Promise<void> {
    try {
      const userId = getUserId(req, res);
      if (!userId) return;

      const validation = commentSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(HTTP.STATUS.BAD_REQUEST).json({ error: validation.error.errors });
        return;
      }

      const comment = await bookInteractionService.updateComment(
        req.params.commentId,
        userId,
        validation.data.content
      );
      res.json(comment);
    } catch (error) {
      const err = error as Error;
      res.status(HTTP.STATUS.FORBIDDEN).json({ error: err.message });
    }
  }

  public static async deleteComment(req: Request, res: Response): Promise<void> {
    try {
      const userId = getUserId(req, res);
      if (!userId) return;

      await bookInteractionService.deleteComment(req.params.commentId, userId);
      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      const err = error as Error;
      res.status(HTTP.STATUS.FORBIDDEN).json({ error: err.message });
    }
  }

  public static async getUserComments(req: Request, res: Response): Promise<void> {
    try {
      const userId = getUserId(req, res);
      if (!userId) return;

      const { page, limit } = paginationSchema.parse(req.query);
      res.json(await bookInteractionService.getUserComments(userId, page, limit));
    } catch (error) {
      const err = error as Error;
      res.status(HTTP.STATUS.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
  }

  public static async getBookComments(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit } = paginationSchema.parse(req.query);
      res.json(await bookInteractionService.getBookComments(req.params.olid, page, limit));
    } catch (error) {
      const err = error as Error;
      res.status(HTTP.STATUS.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
  }

  public static async addToReadingList(req: Request, res: Response): Promise<void> {
    try {
      const userId = getUserId(req, res);
      if (!userId) return;

      const validation = readingListSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(HTTP.STATUS.BAD_REQUEST).json({ error: validation.error.errors });
        return;
      }

      const item = await bookInteractionService.addToReadingList(
        userId,
        req.params.olid,
        validation.data.status as ReadingStatus
      );
      res.json(item);
    } catch (error) {
      const err = error as Error;
      res.status(HTTP.STATUS.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
  }

  public static async removeFromReadingList(req: Request, res: Response): Promise<void> {
    try {
      const userId = getUserId(req, res);
      if (!userId) return;

      await bookInteractionService.removeFromReadingList(userId, req.params.olid);
      res.json({ message: 'Removed from reading list' });
    } catch (error) {
      const err = error as Error;
      res.status(HTTP.STATUS.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
  }

  public static async getReadingList(req: Request, res: Response): Promise<void> {
    try {
      const userId = getUserId(req, res);
      if (!userId) return;

      const { page, limit } = paginationSchema.parse(req.query);
      const status = req.query.status as ReadingStatus | undefined;

      res.json(await bookInteractionService.getReadingList(userId, status, page, limit));
    } catch (error) {
      const err = error as Error;
      res.status(HTTP.STATUS.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
  }

  public static async searchMyBooks(req: Request, res: Response): Promise<void> {
    try {
      const userId = getUserId(req, res);
      if (!userId) return;

      const validation = searchMyBooksSchema.safeParse(req.query);
      if (!validation.success) {
        res.status(HTTP.STATUS.BAD_REQUEST).json({ error: validation.error.errors });
        return;
      }

      const { q, category, page, limit } = validation.data;
      res.json(await bookInteractionService.searchMyBooks(userId, q, category, page, limit));
    } catch (error) {
      const err = error as Error;
      res.status(HTTP.STATUS.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
  }
}
