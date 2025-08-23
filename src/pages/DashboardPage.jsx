import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

function DashboardPage() {
  const { currentUser, userProfile } = useAuth();

  if (!currentUser || !userProfile) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userProfile.name}! 👋</h1>
        <p className="text-gray-600 mt-2">Here's what's happening in your CollaBase community</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-gray-600">{currentUser.email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Year:</span>
                <p className="text-gray-600">{userProfile.year}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Branch:</span>
                <p className="text-gray-600">{userProfile.branch}</p>
              </div>
              {userProfile.skills.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {userProfile.skills.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {userProfile.interests.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Interests:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {userProfile.interests.map((interest, index) => (
                      <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              to="/teams"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🔍 Discover Teams</h3>
              <p className="text-gray-600">Browse projects and find teams to join</p>
            </Link>

            <Link
              to="/create-team"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🚀 Create Team</h3>
              <p className="text-gray-600">Start a new project and recruit teammates</p>
            </Link>

            <Link
              to="/applications"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-yellow-500"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📋 My Applications</h3>
              <p className="text-gray-600">Track your team application status</p>
            </Link>

            <Link
              to="/manage-teams"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-purple-500"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">👥 Manage Teams</h3>
              <p className="text-gray-600">Review applications and manage members</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;