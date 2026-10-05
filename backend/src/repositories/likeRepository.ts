import { supabase } from '../config/database';
import { DATABASE } from '../config/constants';

export async function findLike(userId: string, bookOlid: string) {
  const { data, error } = await supabase
    .from(DATABASE.TABLES.LIKES)
    .select('id')
    .eq('user_id', userId)
    .eq('book_olid', bookOlid)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function removeById(id: string) {
  const { error } = await supabase.from(DATABASE.TABLES.LIKES).delete().eq('id', id);
  if (error) throw error;
}

export async function insert(userId: string, bookOlid: string) {
  const { error } = await supabase
    .from(DATABASE.TABLES.LIKES)
    .insert({ user_id: userId, book_olid: bookOlid });
  if (error) throw error;
}

export async function countByBook(bookOlid: string): Promise<number> {
  const { count, error } = await supabase
    .from(DATABASE.TABLES.LIKES)
    .select('*', { count: 'exact', head: true })
    .eq('book_olid', bookOlid);
  if (error) throw error;
  return count ?? 0;
}

export async function listByUser(userId: string, from: number, to: number) {
  const { data, count, error } = await supabase
    .from(DATABASE.TABLES.LIKES)
    .select('book_olid', { count: 'exact' })
    .eq('user_id', userId)
    .range(from, to);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function listOlidsByUser(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from(DATABASE.TABLES.LIKES)
    .select('book_olid')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.book_olid as string);
}
