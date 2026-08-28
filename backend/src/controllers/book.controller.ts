import { Request, Response } from 'express';
import { OpenLibraryService } from '../services/openLibrary.service';
import { BookInteractionService } from '../services/bookInteraction.service';
import { z } from 'zod';

const openLibraryService = OpenLibraryService.getInstance();
const bookInteractionService = new BookInteractionService();

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
        res.status(400).json({ error: validation.error.errors });
        return;
      }

      const { q, page, limit } = validation.data;
      console.log(`🔍 Searching for: "${q}" (page: ${page}, limit: ${limit})`);
      
      const result = await openLibraryService.searchBooks(q, page, limit);
      
      console.log(`✅ Found ${result.books.length} books out of ${result.total}`);
      res.json(result);
    } catch (error) {
      const err = error as Error;
      console.error('❌ Search error:', err.message);
      res.status(500).json({ error: err.message });
    }
  }

  public static async getDetails(req: Request, res: Response): Promise<void> {
    try {
      const { olid } = req.params;
      
      if (!olid) {
        res.status(400).json({ error: 'Book ID is required' });
        return;
      }

      console.log(`📖 Getting details for book: ${olid}`);
      
      const book = await openLibraryService.getBookDetails(olid);
      const likeCount = await bookInteractionService.getLikeCount(olid);
      const { comments } = await bookInteractionService.getBookComments(olid, 1, 10);
      
      let userLiked = false;
      let readingStatus: string | null = null;
      
      if (req.user) {
        userLiked = await bookInteractionService.checkIfLiked(req.user.userId, olid);
        readingStatus = await bookInteractionService.getReadingListStatus(req.user.userId, olid);
      }

      res.json({
        ...book,
        likeCount,
        userLiked,
        readingStatus,
        comments,
      });
    } catch (error) {
      const err = error as Error;
      console.error('❌ Book details error:', err.message);
      res.status(500).json({ error: err.message });
    }
  }
}