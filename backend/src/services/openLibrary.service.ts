import axios from 'axios';
import { cache, getCacheKey, CACHE_KEYS } from '../config/cache';
import { OpenLibrarySearchResponse, OpenLibraryWorkResponse, Book } from '../types';

const OPEN_LIBRARY_BASE_URL = process.env.OPEN_LIBRARY_BASE_URL || 'https://openlibrary.org';

export class OpenLibraryService {
  private static instance: OpenLibraryService | null = null;

  public static getInstance(): OpenLibraryService {
    if (!OpenLibraryService.instance) {
      OpenLibraryService.instance = new OpenLibraryService();
    }
    return OpenLibraryService.instance;
  }

  public async searchBooks(query: string, page: number = 1, limit: number = 20): Promise<{ books: Book[]; total: number }> {
    const cacheKey = getCacheKey(CACHE_KEYS.OPEN_LIBRARY_SEARCH, { q: query, page, limit });
    const cached = cache.get<{ books: Book[]; total: number }>(cacheKey);
    
    if (cached) {
      console.log(`[Cache HIT] ${cacheKey}`);
      return cached;
    }

    console.log(`[Cache MISS] ${cacheKey}`);
    console.log(`[Request] Searching for: "${query}"`);
    
    const offset = (page - 1) * limit;
    
    try {
      const response = await axios.get<OpenLibrarySearchResponse>(
        `${OPEN_LIBRARY_BASE_URL}/search.json`,
        {
          params: {
            q: query,
            offset,
            limit,
          },
          headers: {
            'User-Agent': 'OnlineLibraryApp/1.0 (contact@example.com)',
          },
          timeout: 10000,
        }
      );

      console.log(`[Response] Status: ${response.status}, Found: ${response.data.numFound} books`);

      const books: Book[] = response.data.docs.map((doc) => ({
        olid: doc.key ? doc.key.replace('/works/', '') : `unknown_${Math.random()}`,
        title: doc.title || 'Unknown Title',
        authors: doc.author_name || ['Unknown Author'],
        cover_edition_key: doc.cover_edition_key,
        cover_url: doc.cover_edition_key 
          ? `https://covers.openlibrary.org/b/olid/${doc.cover_edition_key}-M.jpg`
          : undefined,
      }));

      const result = {
        books,
        total: response.data.numFound || 0,
      };

      cache.set(cacheKey, result);
      console.log(`[Cache] Stored ${books.length} books in cache`);
      return result;
    } catch (error) {
      console.error('[Error] OpenLibrary API error:', error);
      if (axios.isAxiosError(error)) {
        console.error('[Error] Status:', error.response?.status);
        console.error('[Error] Message:', error.message);
        console.error('[Error] URL:', error.config?.url);
      }
      throw new Error(`Failed to search books: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async getBookDetails(olid: string): Promise<Book> {
    const cacheKey = getCacheKey(CACHE_KEYS.OPEN_LIBRARY_WORK, { olid });
    const cached = cache.get<Book>(cacheKey);
    
    if (cached) {
      console.log(`[Cache HIT] ${cacheKey}`);
      return cached;
    }

    console.log(`[Cache MISS] ${cacheKey}`);
    console.log(`[Request] Getting details for: ${olid}`);
    
    try {
      const response = await axios.get<OpenLibraryWorkResponse>(
        `${OPEN_LIBRARY_BASE_URL}/works/${olid}.json`,
        {
          headers: {
            'User-Agent': 'OnlineLibraryApp/1.0 (contact@example.com)',
          },
          timeout: 10000,
        }
      );

      console.log(`[Response] Status: ${response.status}`);

      const data = response.data;
      const description = typeof data.description === 'string' 
        ? data.description 
        : data.description?.value || 'No description available';

      const book: Book = {
        olid,
        title: data.title || 'Unknown Title',
        authors: data.authors?.map((a) => a.author.key.replace('/authors/', '')) || ['Unknown Author'],
        cover_edition_key: data.covers?.[0]?.toString(),
        description,
        cover_url: data.covers?.[0] 
          ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
          : undefined,
      };

      cache.set(cacheKey, book);
      return book;
    } catch (error) {
      console.error('[Error] OpenLibrary API error:', error);
      if (axios.isAxiosError(error)) {
        console.error('[Error] Status:', error.response?.status);
        console.error('[Error] Message:', error.message);
      }
      throw new Error(`Failed to get book details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async getBookDetailsBatch(olids: string[]): Promise<Book[]> {
    const uniqueOlids = [...new Set(olids)];
    const books: Book[] = [];
    const missingOlids: string[] = [];

    for (const olid of uniqueOlids) {
      const cacheKey = getCacheKey(CACHE_KEYS.OPEN_LIBRARY_WORK, { olid });
      const cached = cache.get<Book>(cacheKey);
      if (cached) {
        books.push(cached);
      } else {
        missingOlids.push(olid);
      }
    }

    for (const olid of missingOlids) {
      const book = await this.getBookDetails(olid);
      books.push(book);
      await this.delay(1000);
    }

    return books;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
