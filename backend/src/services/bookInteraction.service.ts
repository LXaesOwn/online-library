import { supabase } from '../config/database';
import { Comment, ReadingList, ReadingStatus } from '../types';
import { OpenLibraryService } from './openLibrary.service';

export class BookInteractionService {
  private openLibraryService = OpenLibraryService.getInstance();

  public async toggleLike(userId: string, bookOlid: string): Promise<{ liked: boolean; likeCount: number }> {
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('book_olid', bookOlid)
      .single();

    if (existingLike) {
      await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);
    } else {
      await supabase
        .from('likes')
        .insert({
          user_id: userId,
          book_olid: bookOlid,
        });
    }

    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('book_olid', bookOlid);

    return {
      liked: !existingLike,
      likeCount: count || 0,
    };
  }

  public async getLikeCount(bookOlid: string): Promise<number> {
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('book_olid', bookOlid);
    return count || 0;
  }

  public async getUserLikes(userId: string, page: number = 1, limit: number = 20): Promise<{ books: any[]; total: number }> {
    const offset = (page - 1) * limit;

    const { data: likes, count } = await supabase
      .from('likes')
      .select('book_olid', { count: 'exact' })
      .eq('user_id', userId)
      .range(offset, offset + limit - 1);

    if (!likes || likes.length === 0) {
      return { books: [], total: 0 };
    }

    const olids = likes.map((l) => l.book_olid);
    const books = await this.openLibraryService.getBookDetailsBatch(olids);

    return { books, total: count || 0 };
  }

  public async checkIfLiked(userId: string, bookOlid: string): Promise<boolean> {
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('book_olid', bookOlid)
      .single();
    return !!data;
  }

  public async createComment(userId: string, bookOlid: string, content: string): Promise<Comment> {
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        book_olid: bookOlid,
        content,
      })
      .select()
      .single();

    if (error || !comment) {
      throw new Error('Failed to create comment');
    }

    const { data: user } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();

    return {
      ...comment,
      username: user?.username,
    };
  }

  public async updateComment(commentId: string, userId: string, content: string): Promise<Comment> {
    const { data: existingComment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (!existingComment || existingComment.user_id !== userId) {
      throw new Error('You can only edit your own comments');
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', commentId)
      .select()
      .single();

    if (error || !comment) {
      throw new Error('Failed to update comment');
    }

    return comment;
  }

  public async deleteComment(commentId: string, userId: string): Promise<void> {
    const { data: existingComment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (!existingComment || existingComment.user_id !== userId) {
      throw new Error('You can only delete your own comments');
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      throw new Error('Failed to delete comment');
    }
  }

  public async getBookComments(bookOlid: string, page: number = 1, limit: number = 20): Promise<{ comments: Comment[]; total: number }> {
    const offset = (page - 1) * limit;

    const { data: comments, count } = await supabase
      .from('comments')
      .select('*, users(username)', { count: 'exact' })
      .eq('book_olid', bookOlid)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (!comments) {
      return { comments: [], total: 0 };
    }

    const formattedComments: Comment[] = comments.map((c) => ({
      ...c,
      username: c.users?.username || 'Unknown User',
    }));

    return { comments: formattedComments, total: count || 0 };
  }

  public async getUserComments(userId: string, page: number = 1, limit: number = 20): Promise<{ comments: any[]; total: number }> {
    const offset = (page - 1) * limit;

    const { data: comments, count } = await supabase
      .from('comments')
      .select('*, users(username)', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (!comments) {
      return { comments: [], total: 0 };
    }

    const commentsWithBooks = await Promise.all(
      comments.map(async (c) => {
        const book = await this.openLibraryService.getBookDetails(c.book_olid);
        return {
          ...c,
          username: c.users?.username || 'Unknown User',
          book,
        };
      })
    );

    return { comments: commentsWithBooks, total: count || 0 };
  }

  public async addToReadingList(userId: string, bookOlid: string, status: ReadingStatus): Promise<ReadingList> {
    const { data: existing } = await supabase
      .from('reading_list')
      .select('id')
      .eq('user_id', userId)
      .eq('book_olid', bookOlid)
      .single();

    if (existing) {
      const { data: item, error } = await supabase
        .from('reading_list')
        .update({ status })
        .eq('id', existing.id)
        .select()
        .single();

      if (error || !item) {
        throw new Error('Failed to update reading list');
      }
      return item;
    } else {
      const { data: item, error } = await supabase
        .from('reading_list')
        .insert({
          user_id: userId,
          book_olid: bookOlid,
          status,
        })
        .select()
        .single();

      if (error || !item) {
        throw new Error('Failed to add to reading list');
      }
      return item;
    }
  }

  public async removeFromReadingList(userId: string, bookOlid: string): Promise<void> {
    const { error } = await supabase
      .from('reading_list')
      .delete()
      .eq('user_id', userId)
      .eq('book_olid', bookOlid);

    if (error) {
      throw new Error('Failed to remove from reading list');
    }
  }

  public async getReadingList(
    userId: string,
    status?: ReadingStatus,
    page: number = 1,
    limit: number = 20
  ): Promise<{ books: any[]; total: number }> {
    const offset = (page - 1) * limit;

    let query = supabase
      .from('reading_list')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: items, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (!items || items.length === 0) {
      return { books: [], total: 0 };
    }

    const olids = items.map((i) => i.book_olid);
    const books = await this.openLibraryService.getBookDetailsBatch(olids);

    const booksWithStatus = items.map((item) => {
      const book = books.find((b) => b.olid === item.book_olid);
      return {
        ...book,
        status: item.status,
        reading_list_id: item.id,
      };
    });

    return { books: booksWithStatus, total: count || 0 };
  }

  public async getReadingListStatus(userId: string, bookOlid: string): Promise<string | null> {
    const { data: item } = await supabase
      .from('reading_list')
      .select('status')
      .eq('user_id', userId)
      .eq('book_olid', bookOlid)
      .single();
    return item?.status || null;
  }

  public async searchMyBooks(
    userId: string,
    query: string,
    category: 'likes' | 'reading' | 'both',
    page: number = 1,
    limit: number = 20
  ): Promise<{ books: any[]; total: number }> {
    const offset = (page - 1) * limit;
    let olids: string[] = [];

    if (category === 'likes' || category === 'both') {
      const { data: likes } = await supabase
        .from('likes')
        .select('book_olid')
        .eq('user_id', userId);
      if (likes) {
        olids.push(...likes.map((l) => l.book_olid));
      }
    }

    if (category === 'reading' || category === 'both') {
      const { data: reading } = await supabase
        .from('reading_list')
        .select('book_olid')
        .eq('user_id', userId);
      if (reading) {
        olids.push(...reading.map((r) => r.book_olid));
      }
    }

    olids = [...new Set(olids)];

    if (olids.length === 0) {
      return { books: [], total: 0 };
    }

    const books = await this.openLibraryService.getBookDetailsBatch(olids);
    
    const filteredBooks = books.filter((book) =>
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.authors.some((author) => author.toLowerCase().includes(query.toLowerCase()))
    );

    const paginatedBooks = filteredBooks.slice(offset, offset + limit);

    return { books: paginatedBooks, total: filteredBooks.length };
  }
}
