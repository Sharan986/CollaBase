import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, doc, updateDoc, arrayRemove, arrayUnion, getDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

function ManageTeamsPage() {
  const { currentUser, userProfile, createNotification } = useAuth();
  const [myTeams, setMyTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [applicantProfiles, setApplicantProfiles] = useState({});

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
      const team = myTeams.find(t => t.id === teamId);
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
        joinedAt: serverTimestamp()
      };

      // Update team: remove from applications, add to members, increment currentMembers
      await updateDoc(teamRef, {
        applications: arrayRemove(applicantId),
        members: arrayUnion(newMember),
        currentMembers: team.currentMembers + 1
      });

      // Create notification for accepted applicant
      await createNotification(
        applicantId,
        'application_accepted',
        'Application Accepted! 🎉',
        `Congratulations! You've been accepted to join "${team.title}". Welcome to the team!`,
        { teamId, teamTitle: team.title }
      );

      // Create notification for team owner
      await createNotification(
        currentUser.uid,
        'member_joined',
        'New Team Member! 👥',
        `${applicantProfile.name} has joined your team "${team.title}". Your team is growing!`,
        { teamId, teamTitle: team.title, memberName: applicantProfile.name }
      );

      console.log(`Accepted ${applicantProfile.name} to team`);
    } catch (error) {
      console.error('Error accepting application:', error);
      alert('Failed to accept application. Please try again.');
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

      // Create notification for rejected applicant
      await createNotification(
        applicantId,
        'application_rejected',
        'Application Update 📋',
        `Thank you for your interest in "${team.title}". Unfortunately, we've decided to go with other candidates this time. Keep exploring other amazing projects!`,
        { teamId, teamTitle: team.title }
      );

      console.log(`Rejected ${applicantProfile.name} from team`);
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject application. Please try again.');
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

      // Create notification for removed member
      await createNotification(
        memberId,
        'member_removed',
        'Team Update 👋',
        `You have been removed from the team "${team.title}". Thank you for your contributions!`,
        { teamId, teamTitle: team.title }
      );

      console.log(`Removed ${memberName} from team`);
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member. Please try again.');
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
          <p className="text-gray-600">Loading your teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage My Teams</h1>
        <p className="text-gray-600 mt-2">Review applications and manage your team members</p>
        <p className="text-sm text-blue-600 mt-1">
          {myTeams.length} {myTeams.length === 1 ? 'team' : 'teams'} created
        </p>
      </div>

      {/* Teams List */}
      {myTeams.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Created Yet</h3>
          <p className="text-gray-600 mb-6">
            You haven't created any teams yet. Start a new project and build your team!
          </p>
          <a
            href="/create-team"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Your First Team
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {myTeams.map((team) => (
            <div key={team.id} className="bg-white rounded-lg shadow-md border-l-4 border-green-500">
              {/* Team Header */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{team.title}</h3>
                    <div className="flex items-center gap-3">
                      <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                        {team.category}
                      </span>
                      <span className="inline-block bg-green-100 text-green-800 text-sm px-2 py-1 rounded">
                        Your Team
                      </span>
                      {team.applications?.length > 0 && (
                        <span className="inline-block bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
                          {team.applications.length} New Applications
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      Created {formatDate(team.createdAt)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {team.currentMembers}/{team.teamSize} members
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{team.description}</p>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-lg font-semibold text-blue-600">{team.applications?.length || 0}</div>
                    <div className="text-sm text-blue-800">Pending Applications</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-lg font-semibold text-green-600">{team.currentMembers}</div>
                    <div className="text-sm text-green-800">Current Members</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <div className="text-lg font-semibold text-yellow-600">{team.teamSize - team.currentMembers}</div>
                    <div className="text-sm text-yellow-800">Spots Remaining</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <div className="text-lg font-semibold text-purple-600">{team.skillsNeeded.length}</div>
                    <div className="text-sm text-purple-800">Skills Needed</div>
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
                  {/* Applications Section */}
                  {team.applications?.length > 0 ? (
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
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
                                  <h5 className="font-semibold text-gray-900">{profile.name}</h5>
                                  <p className="text-sm text-gray-600">{profile.email}</p>
                                  <p className="text-sm text-gray-600">{profile.year} • {profile.branch}</p>
                                  
                                  {profile.skills?.length > 0 && (
                                    <div className="mt-2">
                                      <span className="text-sm font-medium text-gray-700">Skills:</span>
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
                                    <span className="text-sm font-medium text-gray-700">Skill Match:</span>
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
                      <h4 className="text-lg font-semibold text-yellow-800 mb-2">No Pending Applications</h4>
                      <p className="text-yellow-700">No one has applied to join this team yet.</p>
                    </div>
                  )}

                  {/* Current Members Section */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Current Members ({team.currentMembers})
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {team.members.map((member, index) => (
                        <div key={index} className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-semibold text-gray-900">{member.name}</h5>
                              <p className="text-sm text-blue-600">{member.role}</p>
                              {member.joinedAt && (
                                <p className="text-xs text-gray-500">
                                  Joined {formatDate(member.joinedAt)}
                                </p>
                              )}
                              
                              {member.skills?.length > 0 && (
                                <div className="mt-2">
                                  <span className="text-sm font-medium text-gray-700">Skills:</span>
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
      )}

      {/* Quick Actions */}
      {myTeams.length > 0 && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="/create-team"
              className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border"
            >
              <h4 className="font-medium text-gray-900 mb-2">🚀 Create Another Team</h4>
              <p className="text-sm text-gray-600">Start a new project</p>
            </a>
            <a
              href="/teams"
              className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border"
            >
              <h4 className="font-medium text-gray-900 mb-2">🔍 Browse Teams</h4>
              <p className="text-sm text-gray-600">See what others are building</p>
            </a>
            <a
              href="/dashboard"
              className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border"
            >
              <h4 className="font-medium text-gray-900 mb-2">📊 Dashboard</h4>
              <p className="text-sm text-gray-600">Back to overview</p>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageTeamsPage;