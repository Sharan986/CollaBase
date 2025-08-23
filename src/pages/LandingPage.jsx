import React from 'react';
import { Link, Navigate } from 'react-router-dom'; // Add Navigate import
import { useAuth } from '../contexts/AuthContext';

function LandingPage() {
  const { currentUser, userProfile } = useAuth();

  // Redirect to dashboard if already logged in
  if (currentUser && userProfile) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          CollaBase
        </h1>
        <p className="text-xl text-gray-800 mb-8 max-w-2xl mx-auto">
          Connect with fellow college students, discover exciting projects, 
          and build amazing teams for hackathons, assignments, and startup ideas.
        </p>
        
        <div className="space-y-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">🎓 For College Students Only</h3>
            <p className="text-gray-700">Sign up with your college email to join the community</p>
          </div>
          
          <Link
            to="/auth"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8 text-left">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h4 className="font-bold text-lg mb-2">🔍 Discover Teams</h4>
            <p className="text-gray-800">Browse projects and teams looking for collaborators</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h4 className="font-bold text-lg mb-2">🚀 Create Projects</h4>
            <p className="text-gray-800">Start your own team and find skilled teammates</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h4 className="font-bold text-lg mb-2">💬 Collaborate</h4>
            <p className="text-gray-800">Communicate and work together on exciting projects</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;