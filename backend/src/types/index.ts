export interface User {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface Book {
  olid: string;
  title: string;
  authors: string[];
  cover_edition_key?: string;
  description?: string;
  cover_url?: string;
}

export interface Like {
  id: string;
  user_id: string;
  book_olid: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  book_olid: string;
  content: string;
  created_at: string;
  updated_at: string;
  username?: string;
}

export interface ReadingList {
  id: string;
  user_id: string;
  book_olid: string;
  status: 'want_to_read' | 'reading' | 'read';
  created_at: string;
  updated_at: string;
}

export interface OpenLibrarySearchResponse {
  numFound: number;
  docs: OpenLibraryDoc[];
}

export interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  cover_edition_key?: string;
  cover_i?: number;
  first_publish_year?: number;
  publisher?: string[];
}

export interface OpenLibraryWorkResponse {
  title: string;
  description?: string | { value: string };
  authors?: { author: { key: string } }[];
  covers?: number[];
}

export interface JwtPayload {
  userId: string;
  username: string;
}

export type ReadingStatus = 'want_to_read' | 'reading' | 'read';
