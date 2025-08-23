import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function TeamCard({ team, onTeamUpdate }) {
  const { currentUser, applyToTeam } = useAuth();
  const [isApplying, setIsApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  
  const spotsRemaining = team.teamSize - team.currentMembers;
  const isTeamFull = spotsRemaining <= 0;
  const isOwnTeam = currentUser && team.createdBy === currentUser.uid;
  const hasApplied = currentUser && team.applications?.includes(currentUser.uid);

  const handleJoinRequest = async () => {
    if (!currentUser) {
      setApplicationStatus({ type: 'error', message: 'Please log in to apply' });
      return;
    }

    setIsApplying(true);
    try {
      await applyToTeam(team.id);
      setApplicationStatus({ 
        type: 'success', 
        message: 'Application sent! The team will review your request.' 
      });
      
      // Update the team in parent component if callback provided
      if (onTeamUpdate) {
        onTeamUpdate();
      }
      
      // Clear message after 3 seconds
      setTimeout(() => setApplicationStatus(null), 3000);
    } catch (error) {
      setApplicationStatus({ 
        type: 'error', 
        message: error.message 
      });
      setTimeout(() => setApplicationStatus(null), 3000);
    } finally {
      setIsApplying(false);
    }
  };

  const formatDate = (date) => {
    if (date?.toDate) {
      return date.toDate().toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{team.title}</h3>
          <div className="flex items-center gap-2">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
              {team.category}
            </span>
            <span className="text-xs text-gray-500">
              Created {formatDate(team.createdAt)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">
            {team.currentMembers}/{team.teamSize} members
          </div>
          <div className={`text-sm font-medium ${isTeamFull ? 'text-red-600' : 'text-green-600'}`}>
            {isTeamFull ? 'Team Full' : `${spotsRemaining} spots left`}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4 line-clamp-3">
        {team.description}
      </p>

      {/* Skills Needed */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Needed:</h4>
        <div className="flex flex-wrap gap-2">
          {team.skillsNeeded.slice(0, 4).map((skill, index) => (
            <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              {skill}
            </span>
          ))}
          {team.skillsNeeded.length > 4 && (
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              +{team.skillsNeeded.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {team.tags.map((tag, index) => (
            <span key={index} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Members Preview */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Team Members:</h4>
        <div className="space-y-1">
          {team.members.slice(0, 2).map((member, index) => (
            <div key={index} className="text-sm text-gray-600">
              <span className="font-medium">{member.name}</span> - {member.role}
            </div>
          ))}
          {team.members.length > 2 && (
            <div className="text-sm text-gray-500">
              +{team.members.length - 2} more members
            </div>
          )}
        </div>
      </div>

      {/* Application Status Message */}
      {applicationStatus && (
        <div className={`mb-4 p-3 rounded text-sm ${
          applicationStatus.type === 'success' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {applicationStatus.message}
        </div>
      )}

      {/* Action Button */}
      <div className="pt-4 border-t border-gray-200">
        {isOwnTeam ? (
          <button className="w-full bg-gray-500 text-white py-2 px-4 rounded-md cursor-not-allowed">
            Your Team
          </button>
        ) : hasApplied ? (
          <button className="w-full bg-yellow-500 text-white py-2 px-4 rounded-md cursor-not-allowed">
            Application Pending
          </button>
        ) : isTeamFull ? (
          <button className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-md cursor-not-allowed">
            Team Full
          </button>
        ) : (
          <button
            onClick={handleJoinRequest}
            disabled={isApplying}
            className={`w-full py-2 px-4 rounded-md transition-colors ${
              isApplying 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isApplying ? 'Applying...' : 'Request to Join'}
          </button>
        )}
      </div>
    </div>
  );
}

export default TeamCard;