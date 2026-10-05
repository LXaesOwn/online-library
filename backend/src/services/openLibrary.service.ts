import { cache, getCacheKey, CACHE_KEYS } from '../config/cache';
import { OPEN_LIBRARY } from '../config/constants';
import { logger } from '../config/logger';
import * as openLibraryClient from '../clients/openLibrary.client';
import type { Book } from '../types';

export interface SearchResult {
  books: Book[];
  total: number;
}

export async function searchBooks(
  query: string,
  page: number = 1,
  limit: number = OPEN_LIBRARY.DEFAULT_LIMIT
): Promise<SearchResult> {
  const cacheKey = getCacheKey(CACHE_KEYS.OPEN_LIBRARY_SEARCH, { q: query, page, limit });
  const cached = cache.get<SearchResult>(cacheKey);
  if (cached) {
    logger.debug({ cacheKey }, 'cache hit');
    return cached;
  }

  logger.debug({ cacheKey }, 'cache miss');
  const offset = (page - 1) * limit;
  const data = await openLibraryClient.search(query, offset, limit);

  const books: Book[] = data.docs.map((doc) => ({
    olid: doc.key ? doc.key.replace('/works/', '') : `unknown_${Math.random()}`,
    title: doc.title || 'Unknown Title',
    authors: doc.author_name || ['Unknown Author'],
    coverEditionKey: doc.cover_edition_key,
    coverUrl: doc.cover_edition_key
      ? `https://covers.openlibrary.org/b/olid/${doc.cover_edition_key}-M.jpg`
      : undefined,
  }));

  const result: SearchResult = { books, total: data.numFound || 0 };
  cache.set(cacheKey, result);
  return result;
}

export async function getBookDetails(olid: string): Promise<Book> {
  const cacheKey = getCacheKey(CACHE_KEYS.OPEN_LIBRARY_WORK, { olid });
  const cached = cache.get<Book>(cacheKey);
  if (cached) {
    logger.debug({ cacheKey }, 'cache hit');
    return cached;
  }

  logger.debug({ cacheKey }, 'cache miss');
  const data = await openLibraryClient.getWork(olid);

  const description =
    typeof data.description === 'string'
      ? data.description
      : data.description?.value || 'No description available';

  const book: Book = {
    olid,
    title: data.title || 'Unknown Title',
    authors: data.authors?.map((a) => a.author.key.replace('/authors/', '')) || ['Unknown Author'],
    coverEditionKey: data.covers?.[0]?.toString(),
    description,
    coverUrl: data.covers?.[0]
      ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
      : undefined,
  };

  cache.set(cacheKey, book);
  return book;
}

export async function getBookDetailsBatch(olids: string[]): Promise<Book[]> {
  const uniqueOlids = [...new Set(olids)];
  const books: Book[] = [];
  const missing: string[] = [];

  for (const olid of uniqueOlids) {
    const cacheKey = getCacheKey(CACHE_KEYS.OPEN_LIBRARY_WORK, { olid });
    const cached = cache.get<Book>(cacheKey);
    if (cached) books.push(cached);
    else missing.push(olid);
  }

  for (const olid of missing) {
    try {
      books.push(await getBookDetails(olid));
    } catch (error) {
      logger.warn({ olid, error }, 'failed to fetch book details');
    }
    await delay(OPEN_LIBRARY.RATE_LIMIT.DELAY_MS);
  }

  return books;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
