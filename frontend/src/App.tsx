import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Search } from './pages/Search';
import { BookDetails } from './pages/BookDetails';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Likes } from './pages/Likes';
import { ReadingList } from './pages/ReadingList';
import { Comments } from './pages/Comments';
import { SearchMyBooks } from './pages/SearchMyBooks';
import { Profile } from './pages/Profile';
import './index.css';

function App() {
  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="text-xl font-bold text-blue-600 hover:text-blue-800">
                📚 Online Library
              </Link>
              <div className="flex items-center gap-6">
                {user && (
                  <div className="flex items-center gap-4 text-sm">
                    <Link to="/likes" className="hover:text-blue-600">❤️ Likes</Link>
                    <Link to="/reading-list" className="hover:text-blue-600">📚 Reading</Link>
                    <Link to="/comments" className="hover:text-blue-600">💬 Comments</Link>
                    <Link to="/search-my-books" className="hover:text-blue-600">🔍 My Books</Link>
                    <Link to="/profile" className="hover:text-blue-600">👤 Profile</Link>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  {user ? (
                    <>
                      <span className="text-sm text-gray-600">
                        Welcome, <span className="font-semibold">{user.username}</span>
                      </span>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/book/:olid" element={<BookDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/likes" element={<Likes />} />
          <Route path="/reading-list" element={<ReadingList />} />
          <Route path="/comments" element={<Comments />} />
          <Route path="/search-my-books" element={<SearchMyBooks />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;