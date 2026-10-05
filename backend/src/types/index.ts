export interface User {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  olid: string;
  title: string;
  authors: string[];
  coverEditionKey?: string;
  description?: string;
  coverUrl?: string;
}

export interface Comment {
  id: string;
  userId: string;
  bookOlid: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  username?: string;
}

export interface ReadingList {
  id: string;
  userId: string;
  bookOlid: string;
  status: ReadingStatus;
  createdAt: string;
  updatedAt: string;
}

export type ReadingStatus = 'want_to_read' | 'reading' | 'read';

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
