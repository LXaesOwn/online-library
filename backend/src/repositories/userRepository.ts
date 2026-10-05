import { supabase } from '../config/database';
import { DATABASE } from '../config/constants';

export interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export async function findByUsername(username: string) {
  const { data, error } = await supabase
    .from(DATABASE.TABLES.USERS)
    .select('id')
    .eq('username', username)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function findById(id: string): Promise<UserRow | null> {
  const { data, error } = await supabase
    .from(DATABASE.TABLES.USERS)
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as UserRow | null;
}

export async function findByUsernameFull(username: string): Promise<UserRow | null> {
  const { data, error } = await supabase
    .from(DATABASE.TABLES.USERS)
    .select('*')
    .eq('username', username)
    .maybeSingle();
  if (error) throw error;
  return data as UserRow | null;
}

export async function insert(username: string, passwordHash: string): Promise<UserRow> {
  const { data, error } = await supabase
    .from(DATABASE.TABLES.USERS)
    .insert({ username, password_hash: passwordHash })
    .select()
    .single();
  if (error || !data) throw error ?? new Error('Failed to create user');
  return data as UserRow;
}

export async function updateUsername(id: string, username: string): Promise<UserRow> {
  const { data, error } = await supabase
    .from(DATABASE.TABLES.USERS)
    .update({ username })
    .eq('id', id)
    .select()
    .single();
  if (error || !data) throw error ?? new Error('Failed to update username');
  return data as UserRow;
}

export async function updatePassword(id: string, passwordHash: string): Promise<void> {
  const { error } = await supabase
    .from(DATABASE.TABLES.USERS)
    .update({ password_hash: passwordHash })
    .eq('id', id);
  if (error) throw error;
}

export async function findIdByUsernameExcluding(username: string, excludeId: string) {
  const { data, error } = await supabase
    .from(DATABASE.TABLES.USERS)
    .select('id')
    .eq('username', username)
    .neq('id', excludeId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getUsernameById(id: string): Promise<string | undefined> {
  const { data } = await supabase
    .from(DATABASE.TABLES.USERS)
    .select('username')
    .eq('id', id)
    .maybeSingle();
  return data?.username;
}
