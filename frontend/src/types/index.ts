export interface Book {
  olid: string;
  title: string;
  authors: string[];
  cover_edition_key?: string;
  description?: string;
  cover_url?: string;
}

export interface User {
  id: string;
  username: string;
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

export interface ReadingListItem {
  id: string;
  user_id: string;
  book_olid: string;
  status: 'want_to_read' | 'reading' | 'read';
  created_at: string;
  updated_at: string;
}
