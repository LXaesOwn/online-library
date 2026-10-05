import { supabase } from '../config/database';
import { DATABASE } from '../config/constants';

export async function insert(userId: string, bookOlid: string, content: string) {
  const { data, error } = await supabase
    .from(DATABASE.TABLES.COMMENTS)
    .insert({ user_id: userId, book_olid: bookOlid, content })
    .select()
    .single();
  if (error || !data) throw error ?? new Error('Failed to create comment');
  return data;
}

export async function findById(id: string) {
  const { data, error } = await supabase
    .from(DATABASE.TABLES.COMMENTS)
    .select('user_id')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function update(id: string, content: string) {
  const { data, error } = await supabase
    .from(DATABASE.TABLES.COMMENTS)
    .update({ content })
    .eq('id', id)
    .select()
    .single();
  if (error || !data) throw error ?? new Error('Failed to update comment');
  return data;
}

export async function remove(id: string) {
  const { error } = await supabase.from(DATABASE.TABLES.COMMENTS).delete().eq('id', id);
  if (error) throw error;
}

export async function listByBook(bookOlid: string, from: number, to: number) {
  const { data, count, error } = await supabase
    .from(DATABASE.TABLES.COMMENTS)
    .select('*, users(username)', { count: 'exact' })
    .eq('book_olid', bookOlid)
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function listByUser(userId: string, from: number, to: number) {
  const { data, count, error } = await supabase
    .from(DATABASE.TABLES.COMMENTS)
    .select('*, users(username)', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}
