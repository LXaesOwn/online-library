import { supabase } from '../config/database';
import { DATABASE } from '../config/constants';
import type { ReadingStatus } from '../types';

export async function findEntry(userId: string, bookOlid: string) {
  const { data, error } = await supabase
    .from(DATABASE.TABLES.READING_LIST)
    .select('id, status')
    .eq('user_id', userId)
    .eq('book_olid', bookOlid)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateStatus(id: string, status: ReadingStatus) {
  const { data, error } = await supabase
    .from(DATABASE.TABLES.READING_LIST)
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error || !data) throw error ?? new Error('Failed to update reading list');
  return data;
}

export async function insert(userId: string, bookOlid: string, status: ReadingStatus) {
  const { data, error } = await supabase
    .from(DATABASE.TABLES.READING_LIST)
    .insert({ user_id: userId, book_olid: bookOlid, status })
    .select()
    .single();
  if (error || !data) throw error ?? new Error('Failed to add to reading list');
  return data;
}

export async function remove(userId: string, bookOlid: string) {
  const { error } = await supabase
    .from(DATABASE.TABLES.READING_LIST)
    .delete()
    .eq('user_id', userId)
    .eq('book_olid', bookOlid);
  if (error) throw error;
}

export async function listByUser(
  userId: string,
  status: ReadingStatus | undefined,
  from: number,
  to: number
) {
  let query = supabase
    .from(DATABASE.TABLES.READING_LIST)
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  if (status) query = query.eq('status', status);

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function getStatus(userId: string, bookOlid: string): Promise<string | null> {
  const { data } = await supabase
    .from(DATABASE.TABLES.READING_LIST)
    .select('status')
    .eq('user_id', userId)
    .eq('book_olid', bookOlid)
    .maybeSingle();
  return data?.status ?? null;
}

export async function listOlidsByUser(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from(DATABASE.TABLES.READING_LIST)
    .select('book_olid')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.book_olid as string);
}
