import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useDashboardNotifications } from '../contexts/DashboardNotificationContext';
import { useLocation } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, updateDoc, arrayRemove, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

function ManageTeamsPage() {
  const { currentUser, userProfile } = useAuth();
  const { showToast } = useToast();
  const { createDashboardNotification } = useDashboardNotifications();
  const location = useLocation();
  
  // Get tab from URL parameters, default to 'created'
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    return tab === 'member' ? 'member' : 'created';
  };
  
  const [myTeams, setMyTeams] = useState([]);
  const [memberTeams, setMemberTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [applicantProfiles, setApplicantProfiles] = useState({});
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [selectedTeamForWhatsApp, setSelectedTeamForWhatsApp] = useState(null);
  const [whatsappLinkInput, setWhatsappLinkInput] = useState('');

  // Listen for teams created by current user in real-time
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'teams'),
      where('createdBy', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teamsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMyTeams(teamsData);
      setLoading(false);
      console.log('My teams updated:', teamsData.length);
    });

    return unsubscribe;
  }, [currentUser]);

  // Listen for teams where current user is a member
  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, 'teams'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teamsWhereUserIsMember = [];
      
      snapshot.docs.forEach(doc => {
        const teamData = doc.data();
        // Check if current user is in the members array
        if (teamData.members && teamData.members.some(member => member.userId === currentUser.uid)) {
          // Only include if user is not the creator (avoid duplicates)
          if (teamData.createdBy !== currentUser.uid) {
            teamsWhereUserIsMember.push({
              id: doc.id,
              ...teamData
            });
          }
        }
      });
      
      setMemberTeams(teamsWhereUserIsMember);
      console.log('Member teams updated:', teamsWhereUserIsMember.length);
    });

    return unsubscribe;
  }, [currentUser]);

  // Fetch applicant profiles when team is expanded
  const fetchApplicantProfiles = async (applications) => {
    const profiles = {};
    for (const userId of applications) {
      if (!applicantProfiles[userId]) {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            profiles[userId] = userDoc.data();
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    }
    setApplicantProfiles(prev => ({ ...prev, ...profiles }));
  };

  const handleExpandTeam = async (teamId) => {
    if (expandedTeam === teamId) {
      setExpandedTeam(null);
    } else {
      setExpandedTeam(teamId);
      // Find team in either myTeams or memberTeams
      const team = myTeams.find(t => t.id === teamId) || memberTeams.find(t => t.id === teamId);
      if (team?.applications?.length > 0) {
        await fetchApplicantProfiles(team.applications);
      }
    }
  };

  // Accept an application
  const acceptApplication = async (teamId, applicantId, applicantProfile) => {
    setActionLoading(`accept-${teamId}-${applicantId}`);
    try {
      const teamRef = doc(db, 'teams', teamId);
      const team = myTeams.find(t => t.id === teamId);
      
      // Create new member object
      const newMember = {
        userId: applicantId,
        name: applicantProfile.name,
        role: 'Member',
        skills: applicantProfile.skills || [],
        joinedAt: new Date()
      };

      // Update team: remove from applications, add to members, increment currentMembers
      await updateDoc(teamRef, {
        applications: arrayRemove(applicantId),
        members: arrayUnion(newMember),
        currentMembers: team.currentMembers + 1
      });

      // Create dashboard notification for accepted applicant
      const message = team.whatsappLink 
        ? `Congratulations! You've been accepted to join "${team.title}". Welcome to the team! Join the WhatsApp group to start collaborating.`
        : `Congratulations! You've been accepted to join "${team.title}". Welcome to the team!`;
        
      await createDashboardNotification(
        applicantId,
        'accepted',
        teamId,
        team.title,
        message
      );

      // Show success toast
      showToast(`${applicantProfile.name} accepted to ${team.title}!`, 'success');

      console.log(`Accepted ${applicantProfile.name} to team`);
    } catch (error) {
      console.error('Error accepting application:', error);
      showToast('Failed to accept application. Please try again.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Reject an application
  const rejectApplication = async (teamId, applicantId, applicantProfile) => {
    setActionLoading(`reject-${teamId}-${applicantId}`);
    try {
      const teamRef = doc(db, 'teams', teamId);
      const team = myTeams.find(t => t.id === teamId);
      
      // Remove from applications
      await updateDoc(teamRef, {
        applications: arrayRemove(applicantId)
      });

      // Create dashboard notification for rejected applicant
      await createDashboardNotification(
        applicantId,
        'rejected',
        teamId,
        team.title,
        `Thank you for your interest in "${team.title}". Unfortunately, we've decided to go with other candidates this time. Keep exploring other amazing projects!`
      );

      // Show notification toast
      showToast(`Application from ${applicantProfile.name} was declined`, 'info');

      console.log(`Rejected ${applicantProfile.name} from team`);
    } catch (error) {
      console.error('Error rejecting application:', error);
      showToast('Failed to reject application. Please try again.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Remove team member
  const removeMember = async (teamId, memberId, memberName) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      return;
    }

    setActionLoading(`remove-${teamId}-${memberId}`);
    try {
      const team = myTeams.find(t => t.id === teamId);
      const memberToRemove = team.members.find(m => m.userId === memberId);
      
      const teamRef = doc(db, 'teams', teamId);
      
      // Remove member and decrement currentMembers
      await updateDoc(teamRef, {
        members: arrayRemove(memberToRemove),
        currentMembers: team.currentMembers - 1
      });

      // Show success toast
      showToast(`${memberName} removed from team`, 'info');

      console.log(`Removed ${memberName} from team`);
    } catch (error) {
      console.error('Error removing member:', error);
      showToast('Failed to remove member. Please try again.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // WhatsApp Group Functions
  const openWhatsAppModal = (team) => {
    setSelectedTeamForWhatsApp(team);
    setWhatsappLinkInput(team.whatsappLink || '');
    setShowWhatsAppModal(true);
  };

  const closeWhatsAppModal = () => {
    setShowWhatsAppModal(false);
    setSelectedTeamForWhatsApp(null);
    setWhatsappLinkInput('');
  };

  const saveWhatsAppLink = async () => {
    if (!selectedTeamForWhatsApp || !whatsappLinkInput.trim()) {
      showToast('Please enter a valid WhatsApp group link', 'error');
      return;
    }

    // Basic WhatsApp link validation
    if (!whatsappLinkInput.includes('whatsapp.com') && !whatsappLinkInput.includes('wa.me')) {
      showToast('Please enter a valid WhatsApp group link', 'error');
      return;
    }

    try {
      const teamRef = doc(db, 'teams', selectedTeamForWhatsApp.id);
      await updateDoc(teamRef, {
        whatsappLink: whatsappLinkInput.trim()
      });

      showToast('WhatsApp group link saved successfully!', 'success');
      closeWhatsAppModal();
    } catch (error) {
      console.error('Error saving WhatsApp link:', error);
      showToast('Failed to save WhatsApp link. Please try again.', 'error');
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
          <p className="text-gray-600">Loading your teams...</p>
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Modern Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl shadow-2xl mb-6">
            <span className="text-3xl"></span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl inter-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-900 bg-clip-text text-transparent leading-tight">
            My Teams
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto mt-4 leading-relaxed inter-regular">
            Manage teams you created and collaborate on projects you've joined
          </p>
          <div className="flex justify-center gap-6 text-sm text-slate-600 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              <span>{myTeams.length} {myTeams.length === 1 ? 'team' : 'teams'} created</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>{memberTeams.length} {memberTeams.length === 1 ? 'team' : 'teams'} joined</span>
            </div>
          </div>
        </div>

        {/* Modern Tabs */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-2 inline-flex">
            <button
              onClick={() => setActiveTab('created')}
              className={`px-6 py-3 rounded-xl inter-semibold text-sm transition-all duration-200 ${
                activeTab === 'created'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-700 hover:bg-white/50'
              }`}
            >
              Teams I Created ({myTeams.length})
            </button>
            <button
              onClick={() => setActiveTab('member')}
              className={`px-6 py-3 rounded-xl inter-semibold text-sm transition-all duration-200 ${
                activeTab === 'member'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-700 hover:bg-white/50'
              }`}
            >
              Teams I'm In ({memberTeams.length})
            </button>
          </div>
        </div>

      {/* Teams Content */}
      {activeTab === 'created' ? (
        // Teams created by user
        myTeams.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-slate-400 to-slate-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl inter-bold text-slate-800 mb-3">No Teams Created Yet</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed inter-regular">
              You haven't created any teams yet. Start a new project and build your amazing team!
            </p>
            <a
              href="/create-team"
              className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl inter-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Create Your First Team
            </a>
          </div>
      ) : (
        <div className="space-y-6">
          {myTeams.map((team) => (
            <div key={team.id} className="group bg-white/70 backdrop-blur-lg rounded-3xl overflow-hidden shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
              {/* Team Header */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 border-b border-white/20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl inter-bold text-slate-800 mb-3">{team.title}</h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs px-3 py-1 rounded-full inter-medium shadow-lg">
                        {team.category}
                      </span>
                      <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-3 py-1 rounded-full inter-medium shadow-lg">
                        Your Team
                      </span>
                      {team.applications?.length > 0 && (
                        <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs px-3 py-1 rounded-full inter-medium shadow-lg animate-pulse">
                          {team.applications.length} New Applications
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">
                      Created {formatDate(team.createdAt)}
                    </div>
                    <div className="text-sm inter-semibold text-slate-700">
                      {team.currentMembers}/{team.teamSize} members
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 mb-4 text-sm leading-relaxed">{team.description}</p>
              </div>

              {/* Team Content */}
              <div className="p-6">
                {/* Quick Stats */}
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl border border-blue-200">
                    <div className="text-lg inter-bold text-blue-600">{team.applications?.length || 0}</div>
                    <div className="text-xs text-blue-700 inter-medium">Pending Applications</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl border border-green-200">
                    <div className="text-lg inter-bold text-green-600">{team.currentMembers}</div>
                    <div className="text-xs text-green-700 inter-medium">Current Members</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-2xl border border-yellow-200">
                    <div className="text-lg inter-bold text-yellow-600">{team.teamSize - team.currentMembers}</div>
                    <div className="text-xs text-yellow-700 inter-medium">Spots Remaining</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl border border-purple-200">
                    <div className="text-lg inter-bold text-purple-600">{team.skillsNeeded.length}</div>
                    <div className="text-xs text-purple-700 inter-medium">Skills Needed</div>
                  </div>
                </div>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => handleExpandTeam(team.id)}
                  className="w-full bg-gray-50 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-100 transition-colors"
                >
                  {expandedTeam === team.id ? '🔼 Hide Details' : '🔽 Show Applications & Members'}
                </button>
              </div>

              {/* Expanded Details */}
              {expandedTeam === team.id && (
                <div className="border-t border-gray-200 p-6">
                  {/* WhatsApp Group Management */}
                  {activeTab === 'created' && (
                    <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="text-lg inter-semibold text-green-800 mb-3 flex items-center">
                        WhatsApp Group
                      </h4>
                      {team.whatsappLink ? (
                        <div>
                          <p className="text-green-700 mb-3">
                            WhatsApp group is set up! New members will get access when accepted.
                          </p>
                          <div className="flex items-center gap-3">
                            <a
                              href={team.whatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                              Open Group
                            </a>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(team.whatsappLink);
                                showToast('WhatsApp link copied!', 'success');
                              }}
                              className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                            >
                              Copy Link
                            </button>
                            <button
                              onClick={() => openWhatsAppModal(team)}
                              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                            >
                              Edit Link
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-green-700 mb-3">
                            Create a WhatsApp group and add the link to help team members communicate!
                          </p>
                          <button
                            onClick={() => openWhatsAppModal(team)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Add WhatsApp Group Link
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Applications Section */}
                  {team.applications?.length > 0 ? (
                    <div className="mb-8">
                      <h4 className="text-lg inter-semibold text-gray-900 mb-4">
                        Pending Applications ({team.applications.length})
                      </h4>
                      <div className="space-y-4">
                        {team.applications.map((applicantId) => {
                          const profile = applicantProfiles[applicantId];
                          if (!profile) return (
                            <div key={applicantId} className="bg-gray-50 p-4 rounded-lg">
                              <div className="animate-pulse">Loading applicant...</div>
                            </div>
                          );

                          return (
                            <div key={applicantId} className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h5 className="inter-semibold text-gray-900">{profile.name}</h5>
                                  <p className="text-sm text-gray-600">{profile.email}</p>
                                  <p className="text-sm text-gray-600">{profile.year} • {profile.branch}</p>
                                  
                                  {profile.skills?.length > 0 && (
                                    <div className="mt-2">
                                      <span className="text-sm inter-medium text-gray-700">Skills:</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {profile.skills.map((skill, index) => (
                                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                            {skill}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Skill Match Indicator */}
                                  <div className="mt-2">
                                    <span className="text-sm inter-medium text-gray-700">Skill Match:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {team.skillsNeeded.map((neededSkill, index) => {
                                        const hasSkill = profile.skills?.some(userSkill => 
                                          userSkill.toLowerCase().includes(neededSkill.toLowerCase()) ||
                                          neededSkill.toLowerCase().includes(userSkill.toLowerCase())
                                        );
                                        return (
                                          <span 
                                            key={index} 
                                            className={`text-xs px-2 py-1 rounded ${
                                              hasSkill 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-gray-100 text-gray-600'
                                            }`}
                                          >
                                            {neededSkill} {hasSkill ? '✓' : ''}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-2 ml-4">
                                  <button
                                    onClick={() => acceptApplication(team.id, applicantId, profile)}
                                    disabled={actionLoading === `accept-${team.id}-${applicantId}` || team.currentMembers >= team.teamSize}
                                    className={`px-4 py-2 text-sm rounded-md transition-colors ${
                                      team.currentMembers >= team.teamSize
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : actionLoading === `accept-${team.id}-${applicantId}`
                                        ? 'bg-green-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700'
                                    } text-white`}
                                  >
                                    {actionLoading === `accept-${team.id}-${applicantId}` ? 'Accepting...' : 
                                     team.currentMembers >= team.teamSize ? 'Team Full' : 'Accept'}
                                  </button>
                                  <button
                                    onClick={() => rejectApplication(team.id, applicantId, profile)}
                                    disabled={actionLoading === `reject-${team.id}-${applicantId}`}
                                    className={`px-4 py-2 text-sm rounded-md transition-colors ${
                                      actionLoading === `reject-${team.id}-${applicantId}`
                                        ? 'bg-red-400 cursor-not-allowed'
                                        : 'bg-red-600 hover:bg-red-700'
                                    } text-white`}
                                  >
                                    {actionLoading === `reject-${team.id}-${applicantId}` ? 'Rejecting...' : 'Reject'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-8 bg-yellow-50 p-4 rounded-lg">
                      <h4 className="text-lg inter-semibold text-yellow-800 mb-2">No Pending Applications</h4>
                      <p className="text-yellow-700">No one has applied to join this team yet.</p>
                    </div>
                  )}

                  {/* Current Members Section */}
                  <div>
                    <h4 className="text-lg inter-semibold text-gray-900 mb-4">
                      Current Members ({team.currentMembers})
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {team.members.map((member, index) => (
                        <div key={index} className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="inter-semibold text-gray-900">{member.name}</h5>
                              <p className="text-sm text-blue-600">{member.role}</p>
                              {member.joinedAt && (
                                <p className="text-xs text-gray-500">
                                  Joined {formatDate(member.joinedAt)}
                                </p>
                              )}
                              
                              {member.skills?.length > 0 && (
                                <div className="mt-2">
                                  <span className="text-sm inter-medium text-gray-700">Skills:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {member.skills.slice(0, 3).map((skill, skillIndex) => (
                                      <span key={skillIndex} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                        {skill}
                                      </span>
                                    ))}
                                    {member.skills.length > 3 && (
                                      <span className="text-xs text-gray-500">+{member.skills.length - 3} more</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {member.userId !== currentUser.uid && (
                              <button
                                onClick={() => removeMember(team.id, member.userId, member.name)}
                                disabled={actionLoading === `remove-${team.id}-${member.userId}`}
                                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                  actionLoading === `remove-${team.id}-${member.userId}`
                                    ? 'bg-red-400 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700'
                                } text-white`}
                              >
                                {actionLoading === `remove-${team.id}-${member.userId}` ? 'Removing...' : 'Remove'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )
      ) : (
        // Teams where user is a member
        memberTeams.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">👤</span>
            </div>
            <h3 className="text-2xl inter-bold text-slate-800 mb-3">No Teams Joined Yet</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
              You haven't been accepted to any teams yet. Browse available teams and apply to join amazing projects!
            </p>
            <a
              href="/teams"
              className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl inter-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Browse Teams
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {memberTeams.map((team) => (
              <div key={team.id} className="group bg-white/70 backdrop-blur-lg rounded-3xl overflow-hidden shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Team Header */}
                <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-100 border-b border-white/20">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">{team.name || team.title}</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                          {team.category}
                        </span>
                        <span className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                          Team Member
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">
                        Joined {formatDate(team.members?.find(m => m.userId === currentUser.uid)?.joinedAt || team.createdAt)}
                      </div>
                      <div className="text-sm font-semibold text-slate-700">
                        {team.currentMembers}/{team.maxMembers || team.teamSize} members
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-600 mb-4 text-sm leading-relaxed">{team.description}</p>
                </div>

                {/* Team Content */}
                <div className="p-6">
                  {/* Tech Stack */}
                  {(team.techStack || team.skillsNeeded) && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Tech Stack:</h4>
                      <div className="flex flex-wrap gap-2">
                        {(team.techStack || team.skillsNeeded)?.map((tech, index) => (
                          <span key={index} className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium border border-purple-200">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Team Members */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Team Members:</h4>
                    <div className="space-y-3">
                      {team.members?.map((member, index) => (
                        <div key={index} className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-2xl border border-slate-200">
                          <div>
                            <span className="font-semibold text-slate-800">{member.name}</span>
                            <span className="text-sm text-slate-600 ml-2">({member.role})</span>
                            {member.userId === currentUser.uid && (
                              <span className="text-xs text-blue-600 ml-2">(You)</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {member.skills?.slice(0, 3).map((skill, skillIndex) => (
                              <span key={skillIndex} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                                {skill}
                              </span>
                            ))}
                            {member.skills?.length > 3 && (
                              <span className="text-xs text-gray-500">+{member.skills.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* WhatsApp Group Access */}
                  {team.whatsappLink && (
                    <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                        Team WhatsApp Group
                      </h4>
                      <p className="text-green-700 text-sm mb-3">
                        Join the team's WhatsApp group to collaborate and stay updated!
                      </p>
                      <div className="flex gap-2">
                        <a
                          href={team.whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 flex items-center gap-2"
                        >
                          Join WhatsApp Group
                        </a>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(team.whatsappLink);
                            showToast('WhatsApp link copied!', 'success');
                          }}
                          className="px-4 py-2 bg-green-100 text-green-700 text-sm rounded-md hover:bg-green-200"
                        >
                          Copy Link
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Contact Team Lead */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Team Lead: <span className="font-medium">{team.members?.find(m => m.role === 'Team Lead')?.name}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Quick Actions */}
      {(myTeams.length > 0 || memberTeams.length > 0) && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="/create-team"
              className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border"
            >
              <h4 className="font-medium text-gray-900 mb-2">Create Another Team</h4>
              <p className="text-sm text-gray-600">Start a new project</p>
            </a>
            <a
              href="/teams"
              className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border"
            >
              <h4 className="font-medium text-gray-900 mb-2">Browse Teams</h4>
              <p className="text-sm text-gray-600">See what others are building</p>
            </a>
            <a
              href="/dashboard"
              className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border"
            >
              <h4 className="font-medium text-gray-900 mb-2">Dashboard</h4>
              <p className="text-sm text-gray-600">Back to overview</p>
            </a>
          </div>
        </div>
      )}

      {/* WhatsApp Group Link Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Add WhatsApp Group Link
            </h3>
            <p className="text-gray-600 mb-4">
              Paste your WhatsApp group invitation link below. Team members will be able to join the group when they're accepted.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Group Link
              </label>
              <input
                type="url"
                value={whatsappLinkInput}
                onChange={(e) => setWhatsappLinkInput(e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="text-xs text-gray-500 mb-4">
              To create a WhatsApp group: Open WhatsApp → New Group → Add members → Group Info → Invite to Group via Link → Copy Link
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeWhatsAppModal}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveWhatsAppLink}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export default ManageTeamsPage;