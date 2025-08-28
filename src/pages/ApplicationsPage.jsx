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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="text-2xl">📋</span>
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/20 border-t-blue-500 mx-auto mb-6"></div>
          <p className="text-slate-600 text-lg font-medium">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl shadow-2xl mb-6">
            <span className="text-3xl">📋</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-900 bg-clip-text text-transparent leading-tight">
            My Applications
          </h1>
          <p className="text-slate-600 text-lg sm:text-xl mt-4 max-w-2xl mx-auto leading-relaxed">
            Track your team applications and their status
          </p>
          <div className="inline-flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mt-4">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
            {applications.length} {applications.length === 1 ? 'application' : 'applications'}
          </div>
        </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-slate-400 to-slate-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📋</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">No Applications Yet</h3>
          <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
            You haven't applied to any teams yet. Browse available teams to find exciting projects to join!
          </p>
          <a
            href="/teams"
            className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 font-medium shadow-lg"
          >
            Browse Teams
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {applications.map((team) => (
            <div key={team.id} className="group bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 border-l-8 border-l-amber-400">
              {/* Application Header */}
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6 gap-4">
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-slate-900 transition-colors duration-300">{team.title}</h3>
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm px-4 py-2 rounded-full font-medium shadow-lg">
                      <span className="mr-2">📁</span>
                      {team.category}
                    </span>
                    <span className="inline-flex items-center bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm px-4 py-2 rounded-full font-medium shadow-lg animate-pulse">
                      <span className="mr-2">📋</span>
                      Application Pending
                    </span>
                  </div>
                </div>
                <div className="lg:text-right bg-slate-50/50 rounded-2xl p-4 min-w-[200px]">
                  <div className="text-sm text-slate-500 mb-1">Applied on</div>
                  <div className="text-lg font-semibold text-slate-800 mb-2">{formatDate(team.createdAt)}</div>
                  <div className="text-sm text-slate-600">
                    <span className="font-medium">{team.currentMembers}/{team.teamSize}</span> members
                  </div>
                </div>
              </div>

              {/* Team Description */}
              <div className="mb-6 bg-slate-50/50 rounded-2xl p-6">
                <p className="text-slate-700 leading-relaxed text-lg">
                  {team.description}
                </p>
              </div>

              {/* Skills Needed */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Skills Needed</h4>
                <div className="flex flex-wrap gap-3">
                  {team.skillsNeeded.map((skill, index) => (
                    <span key={index} className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 text-sm px-4 py-2 rounded-full font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Team Members */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Current Team</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {team.members.map((member, index) => (
                    <div key={index} className="flex items-center bg-slate-50/50 p-4 rounded-2xl">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm mr-4">
                        {(member.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 block">{member.name}</span>
                        <span className="text-slate-600 text-sm">{member.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Application Stats */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl mb-6 border border-blue-100">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-white text-xl">📋</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider block">Applications</span>
                    <p className="text-2xl font-bold text-blue-600">{team.applications?.length || 0}</p>
                    <p className="text-sm text-slate-500">pending</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-white text-xl">🎯</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider block">Spots Left</span>
                    <p className="text-2xl font-bold text-emerald-600">{team.teamSize - team.currentMembers}</p>
                    <p className="text-sm text-slate-500">available</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-white text-xl">🏆</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider block">Competition</span>
                    <p className="text-2xl font-bold text-purple-600">
                      {team.applications?.length > 1 ? team.applications.length - 1 : 0}
                    </p>
                    <p className="text-sm text-slate-500">
                      {team.applications?.length > 1 ? 'other applicants' : 'no competition'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-6 border-t border-slate-200 gap-4">
                <div className="flex items-center bg-amber-50 px-4 py-3 rounded-xl">
                  <div className="w-3 h-3 bg-amber-400 rounded-full mr-3 animate-pulse"></div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Status:</span>
                    <span className="text-amber-600 font-semibold ml-2">Waiting for team response</span>
                  </div>
                </div>
                <button
                  onClick={() => withdrawApplication(team.id, team.title)}
                  disabled={actionLoading === team.id}
                  className={`px-6 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    actionLoading === team.id
                      ? 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
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
        <div className="mt-12 bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">Quick Actions</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <a
              href="/teams"
              className="group block bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-blue-100"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-xl">🔍</span>
              </div>
              <h4 className="font-bold text-slate-800 mb-2 text-lg">Browse More Teams</h4>
              <p className="text-slate-600 leading-relaxed">Find more exciting projects to join and expand your opportunities</p>
            </a>
            <a
              href="/create-team"
              className="group block bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-emerald-100"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-xl">🚀</span>
              </div>
              <h4 className="font-bold text-slate-800 mb-2 text-lg">Create Your Own Team</h4>
              <p className="text-slate-600 leading-relaxed">Start a new project and recruit talented teammates</p>
            </a>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default ApplicationsPage;