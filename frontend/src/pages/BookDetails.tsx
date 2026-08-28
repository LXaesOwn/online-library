import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { Book, Comment } from '../types';

export const BookDetails: React.FC = () => {
  const { olid } = useParams<{ olid: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [userLiked, setUserLiked] = useState<boolean>(false);
  const [readingStatus, setReadingStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!olid) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get(`/books/${olid}`);
        setBook(response.data);
        setComments(response.data.comments || []);
        setLikeCount(response.data.likeCount || 0);
        setUserLiked(response.data.userLiked || false);
        setReadingStatus(response.data.readingStatus || null);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load book details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [olid]);

  const handleLike = async () => {
    if (!token) {
      alert('Please login to like books');
      return;
    }

    try {
      const response = await api.post(
        `/books/${olid}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLikeCount(response.data.likeCount);
      setUserLiked(response.data.liked);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to toggle like');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('Please login to comment');
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await api.post(
        `/books/${olid}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReadingList = async (status: string) => {
    if (!token) {
      alert('Please login to add to reading list');
      return;
    }

    try {
      await api.post(
        `/books/${olid}/reading-list`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReadingStatus(status);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update reading list');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Book not found'}
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to search
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button
        onClick={() => navigate('/')}
        className="mb-6 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        ← Back to search
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3">
            <div className="h-96 bg-gray-100">
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No cover
                </div>
              )}
            </div>
          </div>
          <div className="md:w-2/3 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
            <p className="text-gray-600 mb-4">by {book.authors.join(', ')}</p>
            
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={handleLike}
                className={`px-4 py-2 rounded ${
                  userLiked
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                ❤️ {likeCount} {userLiked ? 'Unlike' : 'Like'}
              </button>

              <div className="flex gap-2">
                <select
                  value={readingStatus || ''}
                  onChange={(e) => handleReadingList(e.target.value)}
                  className="px-3 py-2 border rounded"
                >
                  <option value="">Add to reading list</option>
                  <option value="want_to_read">📌 Want to read</option>
                  <option value="reading">📖 Reading</option>
                  <option value="read">✅ Read</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{book.description || 'No description available'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comments section */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Comments</h2>
        
        <form onSubmit={handleAddComment} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No comments yet. Be the first!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold">{comment.username || 'Anonymous'}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-gray-700">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
