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
<div className="flex items-center justify-center h-40">
  <nav className="bg-white shadow border border-blue-200 rounded-md w-[80vw]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        {/* Left Section: Logo */}
        <div className="flex items-center space-x-2">
          <Link
            to={currentUser ? "/dashboard" : "/"}
            className="text-2xl font-bold text-gray-800 italic hover:text-gray-600"
          >
            Collabase
          </Link>
        </div>
        {/* Middle Section: Links */}
        {currentUser && userProfile ? (
          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="text-gray-700 hover:text-gray-900 font-medium">
              Dashboard
            </Link>
            <Link to="/teams" className="text-gray-700 hover:text-gray-900 font-medium">
              Projects
            </Link>
            <Link to="/applications" className="text-gray-700 hover:text-gray-900 font-medium">
              My Applications
            </Link>
            <Link to="/create-team" className="text-gray-700 hover:text-gray-900 font-medium">
              SIH
            </Link>
            <Link to="/manage-teams" className="text-gray-700 hover:text-gray-900 font-medium">
              My Teams
            </Link>
          </div>
        ) : null}
        {/* Right Section */}
        {!currentUser ? (
          <div className="flex items-center space-x-4">
            <Link
              to="/signin"
              className="border border-gray-300 px-4 py-1 rounded-md text-gray-700 hover:bg-gray-100 transition"
            >
              Sign In
            </Link>
            <Link
              to="/unlock"
              className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 transition"
            >
              Unlock Tutorials
            </Link>
          </div>
        ) : (
          <div className="relative group">
  {/* Trigger (avatar or button) */}
  <button className="flex items-center space-x-2 px-3 py-1 rounded-md hover:bg-gray-100 cursor-pointer">
    <span className="text-gray-700">{userProfile?.name}</span>
    <svg
      className="w-4 h-4 text-gray-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {/* Dropdown */}
  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
    <Link
      to="/faqs"
      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
    >
      FAQs
    </Link>
    <button
      onClick={handleLogout}
      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
    >
      Logout
    </button>
  </div>
</div>

        )}
      </div>
    </div>
  </nav>
</div>


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