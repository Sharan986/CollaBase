import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { collection, query, where, getDocs, doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/firebase';

function ApplicationsPage() {
  const { currentUser, getUserApplications } = useAuth();
  const { showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch user's applications
  useEffect(() => {
    async function fetchApplications() {
      try {
        const userApplications = await getUserApplications();
        setApplications(userApplications);
        console.log('User applications:', userApplications);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) {
      fetchApplications();
    }
  }, [currentUser, getUserApplications]);

  // Withdraw application
  const withdrawApplication = async (teamId, teamTitle) => {
    if (!currentUser) return;

    setActionLoading(teamId);
    try {
      const teamRef = doc(db, 'teams', teamId);
      await updateDoc(teamRef, {
        applications: arrayRemove(currentUser.uid)
      });

      // Remove from local state
      setApplications(prev => prev.filter(app => app.id !== teamId));
      
      // Show success toast
      showToast(`Application to "${teamTitle}" withdrawn successfully`, 'info');
      
      console.log(`Withdrew application from ${teamTitle}`);
    } catch (error) {
      console.error('Error withdrawing application:', error);
      showToast('Failed to withdraw application. Please try again.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date) => {
    if (date?.toDate) {
      return date.toDate().toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600 mt-2">Track your team applications and their status</p>
        <p className="text-sm text-blue-600 mt-1">
          {applications.length} {applications.length === 1 ? 'application' : 'applications'}
        </p>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
          <p className="text-gray-600 mb-6">
            You haven't applied to any teams yet. Browse available teams to find exciting projects to join!
          </p>
          <a
            href="/teams"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Teams
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((team) => (
            <div key={team.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              {/* Application Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{team.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                      {team.category}
                    </span>
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded">
                      📋 Application Pending
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    Applied on {formatDate(team.createdAt)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {team.currentMembers}/{team.teamSize} members
                  </div>
                </div>
              </div>

              {/* Team Description */}
              <p className="text-gray-600 mb-4">
                {team.description}
              </p>

              {/* Skills Needed */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Needed:</h4>
                <div className="flex flex-wrap gap-2">
                  {team.skillsNeeded.map((skill, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Team Members */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Team:</h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {team.members.map((member, index) => (
                    <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <span className="font-medium">{member.name}</span> - {member.role}
                    </div>
                  ))}
                </div>
              </div>

              {/* Application Stats */}
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Applications:</span>
                    <p className="text-blue-600">{team.applications?.length || 0} pending</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Spots Left:</span>
                    <p className="text-green-600">{team.teamSize - team.currentMembers} available</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Competition:</span>
                    <p className="text-purple-600">
                      {team.applications?.length > 1 
                        ? `${team.applications.length - 1} other applicants` 
                        : 'No other applicants'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Status: <span className="font-medium text-yellow-600">Waiting for team response</span>
                </div>
                <button
                  onClick={() => withdrawApplication(team.id, team.title)}
                  disabled={actionLoading === team.id}
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    actionLoading === team.id
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {actionLoading === team.id ? 'Withdrawing...' : 'Withdraw Application'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {applications.length > 0 && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="/teams"
              className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border"
            >
              <h4 className="font-medium text-gray-900 mb-2">🔍 Browse More Teams</h4>
              <p className="text-sm text-gray-600">Find more exciting projects to join</p>
            </a>
            <a
              href="/create-team"
              className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border"
            >
              <h4 className="font-medium text-gray-900 mb-2">🚀 Create Your Own Team</h4>
              <p className="text-sm text-gray-600">Start a new project and recruit teammates</p>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicationsPage;