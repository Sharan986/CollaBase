import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useDashboardNotifications } from '../contexts/DashboardNotificationContext';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

function TeamsPage() {
  const { currentUser, userProfile, applyToTeam } = useAuth();
  const { showToast } = useToast();
  const { createDashboardNotification } = useDashboardNotifications();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [applyingTeams, setApplyingTeams] = useState(new Set());

  const categories = [
    'Web App',
    'Mobile App', 
    'Data Science',
    'AI/ML',
    'Gaming',
    'IoT',
    'Blockchain',
    'E-commerce',
    'Social Platform',
    'Education',
    'Healthcare',
    'Fintech',
    'Other'
  ];

  const allSkills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++',
    'HTML/CSS', 'TypeScript', 'Vue.js', 'Angular', 'Express.js',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'AWS',
    'React Native', 'Flutter', 'Swift', 'Kotlin',
    'Machine Learning', 'Data Analysis', 'TensorFlow', 'PyTorch',
    'UI/UX Design', 'Figma', 'Photoshop', 'Illustrator',
    'Game Development', 'Unity', 'Unreal Engine',
    'DevOps', 'Docker', 'Kubernetes', 'Git'
  ];

  // Fetch teams from Firestore
  useEffect(() => {
    async function fetchTeams() {
      try {
        const querySnapshot = await getDocs(collection(db, 'teams'));
        const teamsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTeams(teamsData);
        setFilteredTeams(teamsData);
        console.log('Fetched teams:', teamsData.length);
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTeams();
  }, []);

  // Filter teams based on search and filters
  useEffect(() => {
    let filtered = teams;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(team =>
        team.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (team.skillsNeeded || []).some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(team => team.category === selectedCategory);
    }

    // Skill filter
    if (selectedSkill) {
      filtered = filtered.filter(team =>
        (team.skillsNeeded || []).some(skill =>
          skill.toLowerCase().includes(selectedSkill.toLowerCase())
        )
      );
    }

    setFilteredTeams(filtered);
  }, [teams, searchTerm, selectedCategory, selectedSkill]);

  // Get button state for a team
  const getButtonState = (team) => {
    if (!currentUser || !userProfile) {
      return { text: 'Login to Join', disabled: true, className: 'bg-gray-400 cursor-not-allowed' };
    }

    // Check if user created this team
    if (team.createdBy === currentUser.uid) {
      return { text: 'Your Team', disabled: true, className: 'bg-green-600 cursor-not-allowed' };
    }

    // Check if user is already a member (fix the undefined error here)
    const isMember = (team.members || []).some(member => member.userId === currentUser.uid);
    if (isMember) {
      return { text: 'Already Member', disabled: true, className: 'bg-blue-600 cursor-not-allowed' };
    }

    // Check if team is full
    if (team.currentMembers >= team.teamSize) {
      return { text: 'Team Full', disabled: true, className: 'bg-gray-400 cursor-not-allowed' };
    }

    // Check if application is pending
    const hasApplied = (team.applications || []).includes(currentUser.uid);
    if (hasApplied) {
      return { text: 'View Application', disabled: false, className: 'bg-yellow-500 hover:bg-yellow-600' };
    }

    // Check if currently applying
    if (applyingTeams.has(team.id)) {
      return { text: 'Applying...', disabled: true, className: 'bg-blue-400 cursor-not-allowed' };
    }

    // Available to join
    return { text: 'Request to Join', disabled: false, className: 'bg-blue-600 hover:bg-blue-700' };
  };

  const handleApplyToTeam = async (teamId) => {
    try {
      setApplyingTeams(prev => new Set([...prev, teamId]));
      await applyToTeam(teamId);
      
      // Find team for notifications
      const team = teams.find(t => t.id === teamId);
      const teamName = team?.title || 'team';
      
      // Create dashboard notification for team owner
      if (team?.createdBy) {
        await createDashboardNotification(
          team.createdBy,
          'new_application',
          teamId,
          teamName,
          `${userProfile.name} has applied to join "${teamName}". Review their application in My Teams.`
        );
      }
      
      // Show success toast
      showToast(`Application sent to ${teamName}! 🎉`, 'success');
      
      // Update the team in local state to reflect the application
      setTeams(prevTeams => prevTeams.map(team => 
        team.id === teamId 
          ? {
              ...team,
              applications: [...(team.applications || []), currentUser.uid]
            }
          : team
      ));
      
    } catch (error) {
      console.error('Error applying to team:', error);
      showToast(error.message, 'error');
    } finally {
      setApplyingTeams(prev => {
        const newSet = new Set(prev);
        newSet.delete(teamId);
        return newSet;
      });
    }
  };

  const handleButtonClick = (team) => {
    const buttonState = getButtonState(team);
    
    // If user has already applied, redirect to applications page
    if (buttonState.text === 'View Application') {
      showToast('Redirecting to your applications...', 'info');
      navigate('/applications');
      return;
    }
    
    // If button is disabled or user is applying, do nothing
    if (buttonState.disabled) {
      return;
    }
    
    // Otherwise, apply to the team
    handleApplyToTeam(team.id);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSkill('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Discover Teams</h1>
        <p className="text-gray-600 mt-2">Find exciting projects and connect with talented teammates</p>
        <p className="text-sm text-blue-600 mt-1">
          {filteredTeams.length} {filteredTeams.length === 1 ? 'team' : 'teams'} available
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search teams, projects, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Skills</option>
            {allSkills.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>

          <button
            onClick={clearFilters}
            className="bg-gray-500 text-white px-4 py-3 rounded-md hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || selectedCategory || selectedSkill) && (
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                Search: "{searchTerm}"
              </span>
            )}
            {selectedCategory && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                Category: {selectedCategory}
              </span>
            )}
            {selectedSkill && (
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                Skill: {selectedSkill}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory || selectedSkill
              ? 'Try adjusting your filters to find more teams.'
              : 'No teams available at the moment. Be the first to create one!'
            }
          </p>
          <div className="space-x-4">
            {(searchTerm || selectedCategory || selectedSkill) && (
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
            <a
              href="/create-team"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
            >
              Create Team
            </a>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => {
            const buttonState = getButtonState(team);
            
            return (
              <div key={team.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                {/* Team Header */}
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                      {team.title || 'Untitled Team'}
                    </h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex-shrink-0 ml-2">
                      {team.category || 'Other'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {team.description || 'No description available'}
                  </p>
                </div>

                {/* Team Stats */}
                <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Team Size:</span>
                    <p className="text-gray-600">{team.currentMembers || 0}/{team.teamSize || 0} members</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Applications:</span>
                    <p className="text-gray-600">{(team.applications || []).length} pending</p>
                  </div>
                </div>

                {/* Skills Needed */}
                <div className="mb-4">
                  <span className="font-medium text-gray-700 text-sm">Skills Needed:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(team.skillsNeeded || []).slice(0, 3).map((skill, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                    {(team.skillsNeeded || []).length > 3 && (
                      <span className="text-gray-500 text-xs">+{(team.skillsNeeded || []).length - 3} more</span>
                    )}
                  </div>
                </div>

                {/* Current Members Preview */}
                {team.members && team.members.length > 0 && (
                  <div className="mb-4">
                    <span className="font-medium text-gray-700 text-sm">Team Members:</span>
                    <div className="mt-1">
                      {(team.members || []).slice(0, 2).map((member, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          <span className="font-medium">{member.name || 'Unknown'}</span> - {member.role || 'Member'}
                        </div>
                      ))}
                      {(team.members || []).length > 2 && (
                        <div className="text-xs text-gray-500">+{(team.members || []).length - 2} more members</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {team.tags && team.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {(team.tags || []).slice(0, 3).map((tag, index) => (
                        <span key={index} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Join Button */}
                <button
                  onClick={() => handleButtonClick(team)}
                  disabled={buttonState.disabled}
                  className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${buttonState.className}`}
                >
                  {buttonState.text}
                </button>

                {/* Created by info */}
                <div className="mt-3 text-xs text-gray-500 text-center">
                  Created {team.createdAt ? new Date(team.createdAt?.toDate?.() || team.createdAt).toLocaleDateString() : 'Unknown date'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TeamsPage;