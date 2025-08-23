import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { isValidEmail, isCollegeEmail } from './utils/validation'
import ProfileSetup from './components/Profile'

function AuthTest() {
  const { currentUser, userProfile, loading, profileLoading, createAccount, addUserProfile, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  async function handleSignup() {
    // Basic validation
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

  async function handleLogout() {
    try {
      await logout();
      setMessage('Logged out successfully!');
      setShowProfileSetup(false);
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  }

  // Show loading while auth is initializing
  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  // Show loading while profile is being fetched after login
  if (currentUser && profileLoading) {
    return <div className="text-center p-8">Loading your profile...</div>;
  }

  // Show profile setup ONLY if:
  // 1. User is logged in AND
  // 2. No profile exists AND
  // 3. Not currently loading profile AND
  // 4. Explicitly showing profile setup
  if (currentUser && !userProfile && !profileLoading && showProfileSetup) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className='bg-yellow-500 text-3xl p-4 text-center mb-6'>CollaBase - Complete Your Profile</h1>
        <ProfileSetup onProfileComplete={handleProfileComplete} />
        {message && (
          <p className="mt-4 p-2 bg-gray-100 rounded text-sm text-center">{message}</p>
        )}
      </div>
    );
  }

  // Auto-show profile setup if user exists but no profile (only for new signups)
  if (currentUser && !userProfile && !profileLoading && !showProfileSetup) {
    setShowProfileSetup(true);
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        {currentUser && userProfile ? 'Dashboard' : 'Login / Sign Up'}
      </h2>
      
      {currentUser && userProfile ? (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded border">
            <h3 className="font-bold text-lg mb-2">Welcome, {userProfile.name}! 👋</h3>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Year:</strong> {userProfile.year}</p>
            <p><strong>Branch:</strong> {userProfile.branch}</p>
            <p><strong>Email verified:</strong> {currentUser.emailVerified ? '✅ Yes' : '❌ No'}</p>
            {userProfile.skills.length > 0 && (
              <p><strong>Skills:</strong> {userProfile.skills.join(', ')}</p>
            )}
            {userProfile.interests.length > 0 && (
              <p><strong>Interests:</strong> {userProfile.interests.join(', ')}</p>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <div>
          <input
            type="email"
            placeholder="College Email (e.g., student@university.edu)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
          <div className="space-x-2">
            <button 
              onClick={handleSignup}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Sign Up
            </button>
            <button 
              onClick={handleLogin}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Login
            </button>
          </div>
        </div>
      )}
      
      {message && (
        <p className="mt-4 p-2 bg-gray-100 rounded text-sm">{message}</p>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <div>
        <h1 className='bg-yellow-500 text-5xl p-4 text-center'>CollaBase</h1>
        <AuthTest />
      </div>
    </AuthProvider>
  )
}

export default App