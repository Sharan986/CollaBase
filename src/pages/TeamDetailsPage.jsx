import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

function TeamDetailsPage() {
  const { teamId } = useParams();
  const { currentUser } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeam = async () => {
      if (!teamId) {
        setError('No team ID provided');
        setLoading(false);
        return;
      }

      try {
        const teamDoc = await getDoc(doc(db, 'teams', teamId));
        
        if (!teamDoc.exists()) {
          setError('Team not found');
          setLoading(false);
          return;
        }

        const teamData = { id: teamDoc.id, ...teamDoc.data() };
        
        // Check if user is a member of this team
        const isMember = teamData.members?.some(member => member.userId === currentUser.uid);
        
        if (!isMember) {
          setError('You are not a member of this team');
          setLoading(false);
          return;
        }

        setTeam(teamData);
      } catch (error) {
        console.error('Error fetching team:', error);
        setError('Failed to load team details');
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId, currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-medium text-red-800 mb-2">Error</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
            <p className="text-gray-600 mt-2">{team.description}</p>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Team Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Information</h2>
            <div className="space-y-4">
              <div>
                <span className="font-medium text-gray-700">Category:</span>
                <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {team.category}
                </span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Team Size:</span>
                <span className="ml-2 text-gray-900">
                  {team.currentMembers} / {team.maxMembers} members
                </span>
              </div>

              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`ml-2 px-3 py-1 rounded-full text-sm ${
                  team.status === 'recruiting' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {team.status === 'recruiting' ? 'Still Recruiting' : 'Team Complete'}
                </span>
              </div>

              <div>
                <span className="font-medium text-gray-700">Created:</span>
                <span className="ml-2 text-gray-900">
                  {team.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                </span>
              </div>

              {team.techStack && team.techStack.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Tech Stack:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {team.techStack.map((tech, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {team.requirements && (
                <div>
                  <span className="font-medium text-gray-700">Requirements:</span>
                  <p className="mt-2 text-gray-900 whitespace-pre-wrap">{team.requirements}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Members</h2>
            <div className="space-y-4">
              {team.members?.map((member, index) => (
                <div key={member.userId || index} className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {member.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{member.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        member.role === 'Team Lead' 
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                    {member.skills && member.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {member.skills.slice(0, 3).map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {member.skills.length > 3 && (
                          <span className="text-gray-500 text-xs">
                            +{member.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Joined {member.joinedAt?.toDate?.()?.toLocaleDateString() || 'recently'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default TeamDetailsPage;
