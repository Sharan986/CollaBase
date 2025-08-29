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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center pt-24">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-12 text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/20 border-t-blue-500 mx-auto mb-6"></div>
          <p className="text-slate-600 text-lg font-medium">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-24">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Modern Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-3xl shadow-2xl mb-8 transform hover:scale-105 transition-all duration-300">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-purple-900 bg-clip-text text-transparent leading-tight mb-6">
            My Applications
          </h1>
          <p className="text-slate-600 text-xl sm:text-2xl mt-4 max-w-3xl mx-auto leading-relaxed font-light">
            Track your team applications and their status in real-time
          </p>
          <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 text-blue-700 px-6 py-3 rounded-full text-lg font-medium mt-6 shadow-lg">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
            {applications.length} {applications.length === 1 ? 'Active Application' : 'Active Applications'}
          </div>
        </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-16 text-center max-w-2xl mx-auto">
          <div className="w-32 h-32 bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mb-6">No Applications Yet</h3>
          <p className="text-slate-600 text-xl mb-10 max-w-lg mx-auto leading-relaxed">
            You haven't applied to any teams yet. Browse available teams to find exciting projects to join and start collaborating!
          </p>
          <a
            href="/teams"
            className="inline-flex items-center bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 text-white px-10 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 font-semibold shadow-xl text-lg"
          >
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Browse Teams
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {applications.map((team) => (
            <div key={team.id} className="group bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 border-l-8 border-l-gradient-to-b from-amber-400 to-orange-500 overflow-hidden relative">
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              
              {/* Application Header */}
              <div className="relative z-10 flex flex-col xl:flex-row xl:justify-between xl:items-start mb-8 gap-6">
                <div className="flex-grow">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-amber-400 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-sm font-semibold text-amber-600 uppercase tracking-wider">Application Pending</span>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 mb-6 group-hover:text-slate-900 transition-colors duration-300 leading-tight">{team.title}</h3>
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm px-5 py-2 rounded-full font-semibold shadow-lg">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      {team.category}
                    </span>
                  </div>
                </div>
                <div className="xl:text-right bg-gradient-to-br from-slate-50/80 to-slate-100/80 backdrop-blur-sm rounded-2xl p-6 min-w-[240px] border border-slate-200/50">
                  <div className="text-sm text-slate-500 mb-1 font-medium">Applied on</div>
                  <div className="text-xl font-bold text-slate-800 mb-3">{formatDate(team.createdAt)}</div>
                  <div className="flex items-center justify-center xl:justify-end">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      <span className="font-bold">{team.currentMembers}/{team.teamSize}</span> members
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Description */}
              <div className="relative z-10 mb-8 bg-gradient-to-br from-slate-50/80 to-slate-100/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
                <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Project Description
                </h4>
                <p className="text-slate-700 leading-relaxed text-lg font-medium">
                  {team.description}
                </p>
              </div>

              {/* Skills Needed */}
              <div className="relative z-10 mb-8">
                <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Skills Required
                </h4>
                <div className="flex flex-wrap gap-3">
                  {team.skillsNeeded.map((skill, index) => (
                    <span key={index} className="bg-gradient-to-r from-purple-100 via-blue-100 to-indigo-100 text-purple-800 text-sm px-5 py-3 rounded-full font-semibold border border-purple-200 shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Team Members */}
              <div className="relative z-10 mb-8">
                <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Current Team ({team.members.length})
                </h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {team.members.map((member, index) => (
                    <div key={index} className="flex items-center bg-gradient-to-r from-slate-50/80 to-slate-100/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/50 hover:shadow-lg transition-all duration-300">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                        {(member.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-grow">
                        <span className="font-bold text-slate-800 block text-lg">{member.name}</span>
                        <span className="text-slate-600 text-sm font-medium">{member.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Application Stats */}
              <div className="relative z-10 bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-purple-50/80 backdrop-blur-sm p-8 rounded-2xl mb-8 border border-blue-200/50 shadow-lg">
                <h4 className="text-lg font-bold text-slate-700 mb-6 text-center">Application Analytics</h4>
                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-slate-600 uppercase tracking-wider block mb-2">Total Applications</span>
                    <p className="text-3xl font-bold text-blue-600 mb-1">{team.applications?.length || 0}</p>
                    <p className="text-sm text-slate-500 font-medium">pending review</p>
                  </div>
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-slate-600 uppercase tracking-wider block mb-2">Spots Available</span>
                    <p className="text-3xl font-bold text-emerald-600 mb-1">{team.teamSize - team.currentMembers}</p>
                    <p className="text-sm text-slate-500 font-medium">positions open</p>
                  </div>
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-slate-600 uppercase tracking-wider block mb-2">Competition Level</span>
                    <p className="text-3xl font-bold text-purple-600 mb-1">
                      {team.applications?.length > 1 ? team.applications.length - 1 : 0}
                    </p>
                    <p className="text-sm text-slate-500 font-medium">
                      {team.applications?.length > 1 ? 'other candidates' : 'no competition'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="relative z-10 flex flex-col lg:flex-row lg:justify-between lg:items-center pt-8 border-t border-slate-200/50 gap-6">
                <div className="flex items-center bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 rounded-xl border border-amber-200/50 shadow-sm">
                  <div className="w-4 h-4 bg-amber-400 rounded-full mr-4 animate-pulse shadow-lg"></div>
                  <div>
                    <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Status:</span>
                    <span className="text-amber-600 font-bold ml-3 text-lg">Awaiting Team Response</span>
                  </div>
                </div>
                <button
                  onClick={() => withdrawApplication(team.id, team.title)}
                  disabled={actionLoading === team.id}
                  className={`px-8 py-4 text-sm font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl ${
                    actionLoading === team.id
                      ? 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:shadow-2xl'
                  } min-w-[200px]`}
                >
                  {actionLoading === team.id ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Withdrawing...
                    </div>
                  ) : (
                    'Withdraw Application'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Quick Actions */}
      {applications.length > 0 && (
        <div className="mt-16 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-10">
          <h3 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Quick Actions</h3>
          <div className="grid lg:grid-cols-2 gap-8">
            <a
              href="/teams"
              className="group block bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-purple-50/80 backdrop-blur-sm p-8 rounded-2xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-blue-200/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-slate-800 mb-3 text-xl">Discover More Teams</h4>
                <p className="text-slate-600 leading-relaxed text-lg">Explore exciting new projects and find the perfect team to match your skills and interests.</p>
              </div>
            </a>
            <a
              href="/create-team"
              className="group block bg-gradient-to-br from-emerald-50/80 via-green-50/80 to-teal-50/80 backdrop-blur-sm p-8 rounded-2xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-emerald-200/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-100/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h4 className="font-bold text-slate-800 mb-3 text-xl">Start Your Own Project</h4>
                <p className="text-slate-600 leading-relaxed text-lg">Create a new team, define your vision, and recruit talented individuals to bring your ideas to life.</p>
              </div>
            </a>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default ApplicationsPage;