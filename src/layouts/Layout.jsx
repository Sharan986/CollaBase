import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-yellow-500 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={currentUser ? "/dashboard" : "/"} className="text-2xl font-bold text-gray-900 hover:text-gray-700">
              CollaBase
            </Link>
          </div>
          
          {currentUser && userProfile && (
            <div className="flex items-center space-x-6">
              <Link to="/dashboard" className="text-gray-700 hover:text-gray-900 font-medium">
                Dashboard
              </Link>
              <Link to="/teams" className="text-gray-700 hover:text-gray-900 font-medium">
                Teams
              </Link>
              <Link to="/applications" className="text-gray-700 hover:text-gray-900 font-medium">
                My Applications
              </Link>
              <Link to="/create-team" className="text-gray-700 hover:text-gray-900 font-medium">
                Create Team
              </Link>
              <Link to="/manage-teams" className="text-gray-700 hover:text-gray-900 font-medium">
                My Teams
              </Link>
              
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, {userProfile.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-6">
        {children}
      </main>
    </div>
  );
}

export default Layout;