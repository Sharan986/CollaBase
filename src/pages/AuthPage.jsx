import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isValidEmail, isCollegeEmail } from '../utils/validation';
import ProfileSetup from '../components/Profile';
import { Navigate } from 'react-router-dom';

function AuthPage() {
  const { currentUser, userProfile, loading, profileLoading, createAccount, addUserProfile, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Redirect if user is already logged in with profile
  if (currentUser && userProfile && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSignup() {
    if (!isValidEmail(email)) {
      setMessage('Please enter a valid email address');
      return;
    }
    
    if (!isCollegeEmail(email)) {
      setMessage('Please use your college email address (.edu, .ac.in, etc.)');
      return;
    }
    
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    try {
      await createAccount(email, password);
      setMessage('Account created! Please complete your profile.');
      setShowProfileSetup(true);
      setEmail('');
      setPassword('');
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  }

  async function handleProfileComplete(profileData) {
    try {
      await addUserProfile(profileData);
      setMessage('Profile completed! Welcome to CollaBase!');
      setShowProfileSetup(false);
    } catch (error) {
      setMessage('Error saving profile: ' + error.message);
    }
  }

  async function handleLogin() {
    if (!email || !password) {
      setMessage('Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
      setMessage('Logged in successfully!');
      setEmail('');
      setPassword('');
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  }

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (showProfileSetup || (currentUser && !userProfile)) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-center mb-6">Complete Your Profile</h2>
            <ProfileSetup onProfileComplete={handleProfileComplete} />
            {message && (
              <p className="mt-4 p-3 bg-blue-100 text-blue-700 rounded text-sm text-center">{message}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLoginMode ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setMessage('');
              }}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {isLoginMode ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-4">
            <input
              type="email"
              placeholder="College Email (e.g., student@university.edu)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
            
            <button
              onClick={isLoginMode ? handleLogin : handleSignup}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              {isLoginMode ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
          
          {message && (
            <p className={`mt-4 p-3 rounded text-sm text-center ${
              message.includes('Error') 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;