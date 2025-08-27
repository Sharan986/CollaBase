import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApplications } from '../contexts/ApplicationContext';
import { useDashboardNotifications } from '../contexts/DashboardNotificationContext';
import { useToast } from '../contexts/ToastContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Link } from 'react-router-dom';

function DashboardPage() {
  const { currentUser, userProfile } = useAuth();
  const { applications, loading: applicationsLoading } = useApplications();
  const { notifications, dismissNotification, dismissAllNotifications, loading: notificationsLoading } = useDashboardNotifications();
  const { showToast } = useToast();
  const [teamDetails, setTeamDetails] = useState({});

  // Fetch team details for notifications that have teamIds
  useEffect(() => {
    const fetchTeamDetails = async () => {
      const teamIds = notifications
        .filter(notification => notification.teamId)
        .map(notification => notification.teamId)
        .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates

      for (const teamId of teamIds) {
        if (!teamDetails[teamId]) {
          try {
            const teamRef = doc(db, 'teams', teamId);
            const teamSnap = await getDoc(teamRef);
            if (teamSnap.exists()) {
              setTeamDetails(prev => ({
                ...prev,
                [teamId]: teamSnap.data()
              }));
            }
          } catch (error) {
            console.error('Error fetching team details:', error);
          }
        }
      }
    };

    if (notifications.length > 0) {
      fetchTeamDetails();
    }
  }, [notifications, teamDetails]);

  const handleJoinWhatsApp = (whatsappLink, teamName) => {
    if (whatsappLink) {
      window.open(whatsappLink, '_blank');
      showToast('Opening WhatsApp group for ' + teamName, 'success');
    } else {
      showToast('WhatsApp group link not available', 'error');
    }
  };

  if (!currentUser || !userProfile) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userProfile.name}! 👋</h1>
        <p className="text-gray-600 mt-2">Here's what's happening in your CollaBase community</p>
      </div>

      {/* Dashboard Notifications */}
      {!notificationsLoading && notifications.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">📢 Team Updates</h2>
            {notifications.length > 1 && (
              <button
                onClick={dismissAllNotifications}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Dismiss All ({notifications.length})
              </button>
            )}
          </div>
          <div className="space-y-3">
            {notifications.map(notification => {
              const getNotificationStyle = (type) => {
                switch (type) {
                  case 'accepted':
                  case 'application_accepted':
                    return { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-800', icon: '🎉' };
                  case 'rejected':
                  case 'application_rejected':
                    return { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-800', icon: '😔' };
                  case 'new_application':
                    return { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-800', icon: '📝' };
                  case 'application_withdrawn':
                    return { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-800', icon: '⚠️' };
                  default:
                    return { bg: 'bg-gray-50', border: 'border-gray-400', text: 'text-gray-800', icon: 'ℹ️' };
                }
              };
              
              const style = getNotificationStyle(notification.type);
              
              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border-l-4 ${style.bg} ${style.border}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`font-medium ${style.text}`}>
                        {style.icon} {notification.message}
                      </p>
                      <p className="text-sm mt-1 text-gray-600">
                        {notification.createdAt?.toLocaleDateString()}
                      </p>
                    </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {/* Different buttons based on notification type */}
                    {(notification.type === 'accepted' || notification.type === 'application_accepted') && (
                      <>
                        <Link
                          to="/manage-teams?tab=member"
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          View My Teams
                        </Link>
                        {/* WhatsApp join button if team has WhatsApp link */}
                        {notification.teamId && teamDetails[notification.teamId]?.whatsappLink && (
                          <button
                            onClick={() => handleJoinWhatsApp(
                              teamDetails[notification.teamId].whatsappLink, 
                              teamDetails[notification.teamId].title || teamDetails[notification.teamId].name
                            )}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 flex items-center gap-1"
                          >
                            📱 Join WhatsApp
                          </button>
                        )}
                      </>
                    )}
                    {notification.type === 'new_application' && (
                      <Link
                        to="/manage-teams?tab=created"
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Review Applications
                      </Link>
                    )}
                    {notification.type === 'rejected' && (
                      <Link
                        to="/teams"
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Browse Teams
                      </Link>
                    )}
                    <button
                      onClick={() => dismissNotification(notification.id)}
                      className="text-gray-400 hover:text-gray-600 font-bold text-lg"
                      title="Dismiss notification"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">👥 My Teams</h3>
              <p className="text-gray-600">View and manage your teams</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;