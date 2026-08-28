import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { Book } from '../types';
import BookCard from '../components/BookCard';

export const Likes: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchLikes = async () => {
      if (!token) {
        setError('Please login to view your likes');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get('/user/likes', {
          params: { page, limit: 20 },
          headers: { Authorization: `Bearer ${token}` }
        });
        setBooks(response.data.books || []);
        setTotal(response.data.total || 0);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load likes');
      } finally {
        setLoading(false);
      }
    };

    fetchLikes();
  }, [page, token]);

  const handleBookClick = (olid: string) => {
    navigate(`/book/${olid}`);
  };

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Please login to view your likes
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">❤️ My Liked Books</h1>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!loading && !error && books.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          You haven't liked any books yet. Start exploring and like some books!
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
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {Math.ceil(total / 20)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / 20)}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};