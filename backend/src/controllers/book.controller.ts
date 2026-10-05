import { Request, Response } from 'express';
import { z } from 'zod';
import { HTTP } from '../config/constants';
import { logger } from '../config/logger';
import * as openLibraryService from '../services/openLibrary.service';
import * as bookInteractionService from '../services/bookInteraction.service';

const searchSchema = z.object({
  q: z.string().min(1),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export class BookController {
  public static async search(req: Request, res: Response): Promise<void> {
    try {
      const validation = searchSchema.safeParse(req.query);
      if (!validation.success) {
        res.status(HTTP.STATUS.BAD_REQUEST).json({ error: validation.error.errors });
        return;
      }

      const { q, page, limit } = validation.data;
      logger.debug({ q, page, limit }, 'searching books');

      const result = await openLibraryService.searchBooks(q, page, limit);
      res.json(result);
    } catch (error) {
      const err = error as Error;
      logger.error({ err }, 'search failed');
      res.status(HTTP.STATUS.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
  }

  public static async getDetails(req: Request, res: Response): Promise<void> {
    try {
      const { olid } = req.params;
      if (!olid) {
        res.status(HTTP.STATUS.BAD_REQUEST).json({ error: 'Book ID is required' });
        return;
      }

      const book = await openLibraryService.getBookDetails(olid);
      const likeCount = await bookInteractionService.getLikeCount(olid);
      const { comments } = await bookInteractionService.getBookComments(olid, 1, 10);

      let userLiked = false;
      let readingStatus: string | null = null;

      if (req.user) {
        userLiked = await bookInteractionService.checkIfLiked(req.user.userId, olid);
        readingStatus = await bookInteractionService.getReadingListStatus(req.user.userId, olid);
      }

      res.json({ ...book, likeCount, userLiked, readingStatus, comments });
    } catch (error) {
      const err = error as Error;
      logger.error({ err }, 'get details failed');
      res.status(HTTP.STATUS.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
  }
}
