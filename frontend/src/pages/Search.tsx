import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import type { Book } from '../types';
import BookCard from '../components/BookCard';
import { useNavigate } from 'react-router-dom';

export const Search: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const searchBooks = async (searchQuery: string, pageNum: number): Promise<void> => {
    if (!searchQuery.trim()) {
      setBooks([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/books/search', {
        params: { q: searchQuery, page: pageNum, limit: 20 },
      });
      setBooks(response.data.books || []);
      setTotal(response.data.total || 0);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to search books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        searchBooks(query, 1);
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (query) {
      searchBooks(query, page);
    }
  }, [page]);

  const handleBookClick = (olid: string) => {
    console.log('📖 Navigating to book:', olid);
    navigate(`/book/${olid}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search books by title or author..."
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {loading && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!loading && !error && books.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard
                key={book.olid}
                book={book}
                onClick={() => handleBookClick(book.olid)}
              />
            ))}
          </div>

          {total > 20 && (
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {Math.ceil(total / 20)}
              </span>
              <button
                onClick={() => setPage((p: number) => p + 1)}
                disabled={page >= Math.ceil(total / 20)}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {!loading && !error && query && books.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No books found for "{query}"
        </div>
      )}

      {!loading && !error && !query && (
        <div className="text-center text-gray-500 py-8">
          Start typing to search for books
        </div>
      )}
    </div>
  );
};
