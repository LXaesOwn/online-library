import * as likeRepository from '../repositories/likeRepository';
import * as commentRepository from '../repositories/commentRepository';
import * as readingListRepository from '../repositories/readingListRepository';
import * as userRepository from '../repositories/userRepository';
import { getBookDetails, getBookDetailsBatch } from './openLibrary.service';
import type { Book, Comment, ReadingList, ReadingStatus } from '../types';

function mapComment(row: Record<string, unknown>): Comment {
  const users = row.users as { username?: string } | null | undefined;
  return {
    id: row.id as string,
    userId: row.user_id as string,
    bookOlid: row.book_olid as string,
    content: row.content as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    username: users?.username ?? 'Unknown User',
  };
}

export async function toggleLike(userId: string, bookOlid: string): Promise<{ liked: boolean; likeCount: number }> {
  const existing = await likeRepository.findLike(userId, bookOlid);

  if (existing) await likeRepository.removeById(existing.id);
  else await likeRepository.insert(userId, bookOlid);

  const likeCount = await likeRepository.countByBook(bookOlid);
  return { liked: !existing, likeCount };
}

export async function getLikeCount(bookOlid: string): Promise<number> {
  return likeRepository.countByBook(bookOlid);
}

export async function getUserLikes(userId: string, page: number, limit: number) {
  const from = (page - 1) * limit;
  const { rows, total } = await likeRepository.listByUser(userId, from, from + limit - 1);
  if (rows.length === 0) return { books: [] as Book[], total };

  const books = await getBookDetailsBatch(rows.map((r) => r.book_olid as string));
  return { books, total };
}

export async function checkIfLiked(userId: string, bookOlid: string): Promise<boolean> {
  return Boolean(await likeRepository.findLike(userId, bookOlid));
}

export async function createComment(userId: string, bookOlid: string, content: string): Promise<Comment> {
  const row = await commentRepository.insert(userId, bookOlid, content);
  const username = await userRepository.getUsernameById(userId);
  return { ...mapComment({ ...row, users: { username } }) };
}

export async function updateComment(commentId: string, userId: string, content: string): Promise<Comment> {
  const existing = await commentRepository.findById(commentId);
  if (!existing || existing.user_id !== userId) {
    throw new Error('You can only edit your own comments');
  }
  const row = await commentRepository.update(commentId, content);
  return mapComment(row as Record<string, unknown>);
}

export async function deleteComment(commentId: string, userId: string): Promise<void> {
  const existing = await commentRepository.findById(commentId);
  if (!existing || existing.user_id !== userId) {
    throw new Error('You can only delete your own comments');
  }
  await commentRepository.remove(commentId);
}

export async function getBookComments(bookOlid: string, page: number, limit: number) {
  const from = (page - 1) * limit;
  const { rows, total } = await commentRepository.listByBook(bookOlid, from, from + limit - 1);
  return { comments: rows.map((r) => mapComment(r as Record<string, unknown>)), total };
}

export async function getUserComments(userId: string, page: number, limit: number) {
  const from = (page - 1) * limit;
  const { rows, total } = await commentRepository.listByUser(userId, from, from + limit - 1);

  const comments = await Promise.all(
    rows.map(async (row) => {
      const comment = mapComment(row as Record<string, unknown>);
      const book = await getBookDetails(comment.bookOlid);
      return { ...comment, book };
    })
  );

  return { comments, total };
}

export async function addToReadingList(
  userId: string,
  bookOlid: string,
  status: ReadingStatus
): Promise<ReadingList> {
  const existing = await readingListRepository.findEntry(userId, bookOlid);
  const row = existing
    ? await readingListRepository.updateStatus(existing.id, status)
    : await readingListRepository.insert(userId, bookOlid, status);

  return {
    id: row.id as string,
    userId: row.user_id as string,
    bookOlid: row.book_olid as string,
    status: row.status as ReadingStatus,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function removeFromReadingList(userId: string, bookOlid: string): Promise<void> {
  await readingListRepository.remove(userId, bookOlid);
}

export async function getReadingList(
  userId: string,
  status: ReadingStatus | undefined,
  page: number,
  limit: number
) {
  const from = (page - 1) * limit;
  const { rows, total } = await readingListRepository.listByUser(userId, status, from, from + limit - 1);
  if (rows.length === 0) return { books: [], total };

  const books = await getBookDetailsBatch(rows.map((r) => r.book_olid as string));
  const booksWithStatus = rows.map((item) => {
    const book = books.find((b) => b.olid === item.book_olid);
    return { ...book, status: item.status, readingListId: item.id };
  });

  return { books: booksWithStatus, total };
}

export async function getReadingListStatus(userId: string, bookOlid: string): Promise<string | null> {
  return readingListRepository.getStatus(userId, bookOlid);
}

export async function searchMyBooks(
  userId: string,
  query: string,
  category: 'likes' | 'reading' | 'both',
  page: number,
  limit: number
) {
  const from = (page - 1) * limit;
  const olids = new Set<string>();

  if (category === 'likes' || category === 'both') {
    (await likeRepository.listOlidsByUser(userId)).forEach((id) => olids.add(id));
  }
  if (category === 'reading' || category === 'both') {
    (await readingListRepository.listOlidsByUser(userId)).forEach((id) => olids.add(id));
  }

  if (olids.size === 0) return { books: [], total: 0 };

  const books = await getBookDetailsBatch([...olids]);
  const filtered = books.filter(
    (book) =>
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.authors.some((author) => author.toLowerCase().includes(query.toLowerCase()))
  );

  return { books: filtered.slice(from, from + limit), total: filtered.length };
}
