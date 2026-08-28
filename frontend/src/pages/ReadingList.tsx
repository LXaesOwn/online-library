import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { Book } from '../types';

export const ReadingList: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const statusLabels: Record<string, string> = {
    'want_to_read': '📌 Want to Read',
    'reading': '📖 Reading',
    'read': '✅ Read'
  };

  useEffect(() => {
    const fetchReadingList = async () => {
      if (!token) {
        setError('Please login to view your reading list');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const params: any = { page, limit: 20 };
        if (filter) params.status = filter;
        
        const response = await api.get('/user/reading-list', {
          params,
          headers: { Authorization: `Bearer ${token}` }
        });
        setBooks(response.data.books || []);
        setTotal(response.data.total || 0);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load reading list');
      } finally {
        setLoading(false);
      }
    };

    fetchReadingList();
  }, [page, filter, token]);

  const handleRemove = async (olid: string) => {
    if (!confirm('Remove this book from reading list?')) return;
    
    try {
      await api.delete(`/books/${olid}/reading-list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooks(books.filter(b => b.olid !== olid));
      setTotal(total - 1);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to remove from reading list');
    }
  };

  const handleStatusChange = async (olid: string, newStatus: string) => {
    try {
      await api.post(`/books/${olid}/reading-list`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBooks(books.map(b => 
        b.olid === olid ? { ...b, status: newStatus } : b
      ));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleBookClick = (olid: string) => {
    navigate(`/book/${olid}`);
  };

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Please login to view your reading list
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">📚 My Reading List</h1>

      <div className="mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="">All books</option>
          <option value="want_to_read">📌 Want to Read</option>
          <option value="reading">📖 Reading</option>
          <option value="read">✅ Read</option>
        </select>
      </div>

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
          No books in your reading list. Start adding some!
        </div>
      )}

      {!loading && !error && books.length > 0 && (
        <>
          <div className="space-y-4">
            {books.map((book) => (
              <div key={book.olid} className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
                <div className="w-20 h-28 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      No cover
                    </div>
                  )}
                </div>
                <div className="flex-1 cursor-pointer" onClick={() => handleBookClick(book.olid)}>
                  <h3 className="font-semibold hover:text-blue-600">{book.title}</h3>
                  <p className="text-sm text-gray-600">{book.authors?.join(', ')}</p>
                  <p className="text-sm text-blue-600">{statusLabels[book.status] || book.status}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <select
                    value={book.status}
                    onChange={(e) => handleStatusChange(book.olid, e.target.value)}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    <option value="want_to_read">📌 Want to Read</option>
                    <option value="reading">📖 Reading</option>
                    <option value="read">✅ Read</option>
                  </select>
                  <button
                    onClick={() => handleRemove(book.olid)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
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