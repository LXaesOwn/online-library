import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { Book } from '../types';
import BookCard from '../components/BookCard';

export const SearchMyBooks: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'likes' | 'reading' | 'both'>('both');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleSearch = async () => {
    if (!query.trim()) {
      setBooks([]);
      setSearched(false);
      return;
    }

    if (!token) {
      setError('Please login to search your books');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);
    
    try {
      const response = await api.get('/user/books/search', {
        params: { q: query, category, page: 1, limit: 20 },
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooks(response.data.books || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to search your books');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (olid: string) => {
    navigate(`/book/${olid}`);
  };

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Please login to search your books
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">🔍 Search My Books</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by title or author..."
            className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="px-4 py-2 border rounded"
          >
            <option value="both">Both Likes & Reading List</option>
            <option value="likes">Liked Books</option>
            <option value="reading">Reading List</option>
          </select>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!loading && !error && searched && books.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No books found matching "{query}" in your {category === 'both' ? 'books' : category}
        </div>
      )}

      {!loading && !error && books.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard
              key={book.olid}
              book={book}
              onClick={() => handleBookClick(book.olid)}
            />
          ))}
        </div>
      )}

      {!loading && !error && !searched && (
        <div className="text-center text-gray-500 py-8">
          Enter a search term to find books in your collection
        </div>
      )}
    </div>
  );
};