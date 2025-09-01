import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardNotifications } from '../contexts/DashboardNotificationContext';
import { useToast } from '../contexts/ToastContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Link } from 'react-router-dom';


function DashboardPage() {
  const { currentUser, userProfile } = useAuth();
  const { notifications, dismissNotification, dismissAllNotifications, loading: notificationsLoading } = useDashboardNotifications();
  const { showToast } = useToast();
  const [teamDetails, setTeamDetails] = useState({});

  // Fetch team details for notifications that have teamIds
  useEffect(() => {
    if (notifications.length === 0) return;

    const fetchTeamDetails = async () => {
      const uniqueTeamIds = [...new Set(
        notifications
          .filter(n => n.teamId && !teamDetails[n.teamId])
          .map(n => n.teamId)
      )];

      for (const teamId of uniqueTeamIds) {
        try {
          const teamSnap = await getDoc(doc(db, 'teams', teamId));
          if (teamSnap.exists()) {
            setTeamDetails(prev => ({ ...prev, [teamId]: teamSnap.data() }));
          }
        } catch (error) {
          console.error('Error fetching team details:', error);
        }
      }
    };

    fetchTeamDetails();
  }, [notifications, teamDetails]);

  const handleJoinWhatsApp = (whatsappLink, teamName) => {
    if (whatsappLink) {
      window.open(whatsappLink, '_blank');
      showToast(`Opening WhatsApp group for ${teamName}`, 'success');
    } else {
      showToast('WhatsApp group link not available', 'error');
    }
  };

  const getNotificationStyle = (type) => {
    const styles = {
      accepted: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-800', icon: '' },
      application_accepted: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-800', icon: '' },
      rejected: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-800', icon: '' },
      application_rejected: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-800', icon: '' },
      new_application: { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-800', icon: '' },
      application_withdrawn: { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-800', icon: '' }
    };
    return styles[type] || { bg: 'bg-gray-50', border: 'border-gray-400', text: 'text-gray-800', icon: '' };
  };

  if (!currentUser || !userProfile) {
    return <div className="text-center p-8">Loading...</div>;
  }





  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-24">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Modern Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-8 shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-6 break-words px-4 leading-relaxed inter-bold">
            Welcome back, {userProfile.name}! <span className="inline-block text-4xl">👋</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed px-4 inter-regular">
            Here's what's happening in your CollaBase community
          </p>
        </div>

        {/* Modern Dashboard Notifications */}
        {!notificationsLoading && notifications.length > 0 && (
          <div className="mb-16">
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 hover:shadow-3xl transition-all duration-300">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-7h5v7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent inter-bold">
                    Team Updates
                  </h2>
                </div>
                {notifications.length > 1 && (
                  <button
                    onClick={dismissAllNotifications}
                    className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl inter-medium"
                  >
                    Dismiss All ({notifications.length})
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {notifications.map(notification => {
                  const style = getNotificationStyle(notification.type);
                  const team = teamDetails[notification.teamId];
                  
                  return (
                    <div key={notification.id} className={`p-6 rounded-2xl border-l-4 ${style.bg} ${style.border} hover:shadow-lg transition-all duration-300 group`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`font-semibold text-lg ${style.text} group-hover:scale-105 transition-transform duration-300 inter-semibold`}>
                            {style.icon} {notification.message}
                          </p>
                          <p className="text-sm mt-2 text-slate-500 inter-regular">
                            {notification.createdAt?.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3 ml-4">
                          {(notification.type === 'accepted' || notification.type === 'application_accepted') && (
                            <>
                              <Link to="/manage-teams?tab=member" className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inter-medium">
                                View My Teams
                              </Link>
                              {team?.whatsappLink && (
                                <button
                                  onClick={() => handleJoinWhatsApp(team.whatsappLink, team.title || team.name)}
                                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 inter-medium"
                                >
                                  Join WhatsApp
                                </button>
                              )}
                            </>
                          )}
                          {notification.type === 'new_application' && (
                            <Link to="/manage-teams?tab=created" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inter-medium">
                              Review Applications
                            </Link>
                          )}
                          {notification.type === 'rejected' && (
                            <Link to="/teams" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inter-medium">
                              Browse Teams
                            </Link>
                          )}
                          <button
                            onClick={() => dismissNotification(notification.id)}
                            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all duration-200"
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
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Modern Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 hover:shadow-3xl transition-all duration-300">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent inter-bold">Your Profile</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-50/50 rounded-xl p-4 hover:bg-slate-50 transition-colors duration-200">
                  <span className="font-semibold text-slate-700 text-sm uppercase tracking-wider inter-semibold">Email</span>
                  <p className="text-slate-600 mt-1 font-medium inter-medium">{currentUser.email}</p>
                </div>
                <div className="bg-slate-50/50 rounded-xl p-4 hover:bg-slate-50 transition-colors duration-200">
                  <span className="font-semibold text-slate-700 text-sm uppercase tracking-wider inter-semibold">Year</span>
                  <p className="text-slate-600 mt-1 font-medium inter-medium">{userProfile.year}</p>
                </div>
                <div className="bg-slate-50/50 rounded-xl p-4 hover:bg-slate-50 transition-colors duration-200">
                  <span className="font-semibold text-slate-700 text-sm uppercase tracking-wider inter-semibold">Branch</span>
                  <p className="text-slate-600 mt-1 font-medium inter-medium">{userProfile.branch}</p>
                </div>
                {userProfile.skills?.length > 0 && (
                  <div className="bg-slate-50/50 rounded-xl p-4 hover:bg-slate-50 transition-colors duration-200">
                    <span className="font-semibold text-slate-700 text-sm uppercase tracking-wider mb-3 block inter-semibold">Skills</span>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.skills.map((skill, index) => (
                        <span key={index} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inter-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {userProfile.interests?.length > 0 && (
                  <div className="bg-slate-50/50 rounded-xl p-4 hover:bg-slate-50 transition-colors duration-200">
                    <span className="font-semibold text-slate-700 text-sm uppercase tracking-wider mb-3 block inter-semibold">Interests</span>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.interests.map((interest, index) => (
                        <span key={index} className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inter-medium">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modern Quick Actions */}
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { 
                  to: "/teams", 
                  title: "Discover Teams", 
                  desc: "Browse projects and find teams to join", 
                  gradient: "from-blue-500 to-blue-600", 
                  hoverGradient: "hover:from-blue-600 hover:to-blue-700",
                  icon: (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )
                },
                { 
                  to: "/create-team", 
                  title: "Create Team", 
                  desc: "Start a new project and recruit teammates", 
                  gradient: "from-emerald-500 to-emerald-600", 
                  hoverGradient: "hover:from-emerald-600 hover:to-emerald-700",
                  icon: (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  )
                },
                { 
                  to: "/applications", 
                  title: "My Applications", 
                  desc: "Track your team application status", 
                  gradient: "from-amber-500 to-amber-600", 
                  hoverGradient: "hover:from-amber-600 hover:to-amber-700",
                  icon: (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )
                },
                { 
                  to: "/manage-teams", 
                  title: "My Teams", 
                  desc: "View and manage your teams", 
                  gradient: "from-purple-500 to-purple-600", 
                  hoverGradient: "hover:from-purple-600 hover:to-purple-700",
                  icon: (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  )
                },
                { 
                  to: "/profile", 
                  title: "Edit Profile", 
                  desc: "Update your profile and preferences", 
                  gradient: "from-pink-500 to-pink-600", 
                  hoverGradient: "hover:from-pink-600 hover:to-pink-700",
                  icon: (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )
                }
              ].map((action, index) => (
                <Link
                  key={index}
                  to={action.to}
                  className="group bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${action.gradient} ${action.hoverGradient} rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-all duration-300`}>
                    {action.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-slate-900 transition-colors duration-300 inter-bold">
                    {action.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300 inter-regular">
                    {action.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;