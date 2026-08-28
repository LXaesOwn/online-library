import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-xl font-bold text-blue-600">
                📚 Online Library
              </Link>
              <Link to="/" className="hover:text-blue-600">Search</Link>
              {user && (
                <>
                  <Link to="/likes" className="hover:text-blue-600">Likes</Link>
                  <Link to="/reading-list" className="hover:text-blue-600">Reading List</Link>
                  <Link to="/comments" className="hover:text-blue-600">Comments</Link>
                  <Link to="/search-my-books" className="hover:text-blue-600">My Books</Link>
                  <Link to="/profile" className="hover:text-blue-600">Profile</Link>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">
                    Welcome, <span className="font-semibold">{user.username}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                    Login
                  </Link>
                  <Link to="/register" className="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  );
};
