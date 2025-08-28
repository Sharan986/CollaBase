import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isValidEmail, isCollegeEmail } from '../utils/validation';
import ProfileSetup from '../components/Profile';
import { Navigate } from 'react-router-dom';

function AuthPage() {
  const { currentUser, userProfile, loading, profileLoading, createAccount, addUserProfile, login, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);

  // Load remembered password on component mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedPassword = localStorage.getItem('rememberedPassword');
    if (rememberedEmail && rememberedPassword) {
      setEmail(rememberedEmail);
      setPassword(rememberedPassword);
      setRememberPassword(true);
    }
  }, []);

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
      setMessage('Please use your University email address (example@aju.ac.in)');
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
      
      // Handle remember password
      if (rememberPassword) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedPassword', password);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }
      
      setMessage('Logged in successfully!');
      setEmail('');
      setPassword('');
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setMessage('Please enter your email address first');
      return;
    }

    if (!isValidEmail(email)) {
      setMessage('Please enter a valid email address');
      return;
    }

    try {
      await resetPassword(email);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  }

  // ✅ FRONTEND UPDATE AREA: Loading Screen Styling
  // You can modify: background colors, animation styles, text styling, layout
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto mb-6"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-gray-700 font-medium text-lg">Loading your experience...</p>
        </div>
      </div>
    );
  }

  // ✅ FRONTEND UPDATE AREA: Profile Setup Page Styling
  // You can modify: background, container styling, spacing, shadows, colors
  // ⚠️ DO NOT MODIFY: ProfileSetup component or handleProfileComplete function
  if (showProfileSetup || (currentUser && !userProfile)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 backdrop-blur-sm">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">Complete Your Profile</h2>
              <p className="text-gray-600">Just a few more details to get you started</p>
            </div>
            <ProfileSetup onProfileComplete={handleProfileComplete} />
            {message && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl text-blue-800 text-center font-medium">
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    // ✅ FRONTEND UPDATE AREA: Main Container & Background
    // You can modify: background gradients, patterns, colors, layout structure
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Modern background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
      </div>
      
      {/* ✅ FRONTEND UPDATE AREA: Form Container Width & Spacing */}
      {/* You can modify: max-width, spacing, positioning */}
      <div className="max-w-md w-full space-y-8 relative z-10">
        
        {/* ✅ FRONTEND UPDATE AREA: Header Section Styling */}
        {/* You can modify: text styling, spacing, alignment, add logos/icons */}
        <div className="text-center">
          {/* Logo/Brand Section */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
            {isLoginMode ? 'Welcome back' : 'Join CollaBase'}
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            {isLoginMode ? 'Sign in to continue your collaboration journey' : 'Create your account and start collaborating'}
          </p>
          <p className="text-sm text-gray-500">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            {/* ⚠️ DO NOT MODIFY: onClick function - keeps toggle functionality */}
            <button
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setMessage('');
                // Clear form when switching modes
                if (isLoginMode) {
                  // Switching to signup mode
                  setEmail('');
                  setPassword('');
                  setRememberPassword(false);
                }
              }}
              className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              {isLoginMode ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
        
        {/* ✅ FRONTEND UPDATE AREA: Form Card Styling */}
        {/* You can modify: background, shadows, borders, rounded corners */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-300">
          
          {/* ✅ FRONTEND UPDATE AREA: Form Layout & Spacing */}
          {/* You can modify: spacing between elements, layout direction */}
          <div className="space-y-6">
            
            {/* ✅ FRONTEND UPDATE AREA: Email Input Styling */}
            {/* You can modify: styling, but keep type, value, onChange, placeholder */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                type="email"
                placeholder="College Email (e.g., student@university.edu)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white text-gray-800 placeholder-gray-500"
                required
              />
            </div>
            
            {/* ✅ FRONTEND UPDATE AREA: Password Input Styling */}
            {/* You can modify: styling, but keep type, value, onChange, placeholder */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white text-gray-800 placeholder-gray-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Remember Password Checkbox - Only show in login mode */}
            {isLoginMode && (
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberPassword}
                      onChange={(e) => setRememberPassword(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 border-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
                      rememberPassword 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-500' 
                        : 'border-gray-300 group-hover:border-gray-400 bg-white'
                    }`}>
                      {rememberPassword && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-200 select-none">
                    Remember password
                  </span>
                </label>
                
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}
            
            {/* ✅ FRONTEND UPDATE AREA: Submit Button Styling */}
            {/* You can modify: colors, hover effects, size, but keep onClick function */}
            <button
              onClick={isLoginMode ? handleLogin : handleSignup}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 focus:ring-4 focus:ring-blue-500/50"
            >
              {isLoginMode ? 'Sign In' : 'Create Account'}
            </button>
          </div>
          
          {/* ✅ FRONTEND UPDATE AREA: Message Display Styling */}
          {/* You can modify: colors, styling, positioning, but keep conditional logic */}
          {message && (
            <div className={`mt-6 p-4 rounded-2xl text-sm font-medium text-center transition-all duration-300 ${
              message.includes('Error') 
                ? 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700' 
                : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;