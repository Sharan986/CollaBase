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
      return { text: 'Login to Join', disabled: true, className: 'bg-gradient-to-r from-slate-400 to-slate-500 cursor-not-allowed' };
    }

    // Check if user created this team
    if (team.createdBy === currentUser.uid) {
      return { text: 'Your Team', disabled: true, className: 'bg-gradient-to-r from-emerald-500 to-emerald-600 cursor-not-allowed' };
    }

    // Check if user is already a member (fix the undefined error here)
    const isMember = (team.members || []).some(member => member.userId === currentUser.uid);
    if (isMember) {
      return { text: 'Already Member', disabled: true, className: 'bg-gradient-to-r from-blue-500 to-blue-600 cursor-not-allowed' };
    }

    // Check if team is full
    if (team.currentMembers >= team.teamSize) {
      return { text: 'Team Full', disabled: true, className: 'bg-gradient-to-r from-slate-400 to-slate-500 cursor-not-allowed' };
    }

    // Check if application is pending
    const hasApplied = (team.applications || []).includes(currentUser.uid);
    if (hasApplied) {
      return { text: 'View Application', disabled: false, className: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700' };
    }

    // Check if currently applying
    if (applyingTeams.has(team.id)) {
      return { text: 'Applying...', disabled: true, className: 'bg-gradient-to-r from-blue-400 to-blue-500 cursor-not-allowed' };
    }

    // Available to join
    return { text: 'Request to Join', disabled: false, className: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700' };
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="text-2xl">🔍</span>
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/20 border-t-blue-500 mx-auto mb-6"></div>
          <p className="text-slate-600 text-lg font-medium">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl shadow-2xl mb-6">
            <span className="text-3xl">🔍</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-900 bg-clip-text text-transparent leading-tight">
            Discover Teams
          </h1>
          <p className="text-slate-600 text-lg sm:text-xl mt-4 max-w-2xl mx-auto leading-relaxed">
            Find exciting projects and connect with talented teammates
          </p>
          <div className="inline-flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mt-4">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
            {filteredTeams.length} {filteredTeams.length === 1 ? 'team' : 'teams'} available
          </div>
        </div>

        {/* Modern Search and Filters */}
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 mb-12">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-slate-400 text-xl">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Search teams, projects, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-slate-700"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Skills</label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-slate-700"
              >
                <option value="">All Skills</option>
                {allSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Actions</label>
              <button
                onClick={clearFilters}
                className="w-full bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white px-6 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 font-medium shadow-lg"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || selectedCategory || selectedSkill) && (
            <div className="flex flex-wrap gap-3">
              {searchTerm && (
                <div className="flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                  <span className="mr-2">🔍</span>
                  Search: "{searchTerm}"
                </div>
              )}
              {selectedCategory && (
                <div className="flex items-center bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium">
                  <span className="mr-2">📁</span>
                  Category: {selectedCategory}
                </div>
              )}
              {selectedSkill && (
                <div className="flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                  <span className="mr-2">⚡</span>
                  Skill: {selectedSkill}
                </div>
              )}
            </div>
          )}
        </div>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-slate-400 to-slate-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔍</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">No Teams Found</h3>
          <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
            {searchTerm || selectedCategory || selectedSkill
              ? 'Try adjusting your filters to find more teams.'
              : 'No teams available at the moment. Be the first to create one!'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {(searchTerm || selectedCategory || selectedSkill) && (
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 font-medium shadow-lg"
              >
                Clear Filters
              </button>
            )}
            <a
              href="/create-team"
              className="inline-block bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 font-medium shadow-lg"
            >
              Create Team
            </a>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTeams.map((team) => {
            const buttonState = getButtonState(team);
            
            return (
              <div key={team.id} className="group bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full">
                {/* Team Header */}
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-slate-800 line-clamp-2 group-hover:text-slate-900 transition-colors duration-300 min-h-[3.5rem] flex items-start">
                      {team.title || 'Untitled Team'}
                    </h3>
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs px-3 py-2 rounded-full flex-shrink-0 ml-3 font-medium shadow-lg">
                      {team.category || 'Other'}
                    </span>
                  </div>
                  <div className="min-h-[4.5rem]">
                    <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                      {team.description || 'No description available'}
                    </p>
                  </div>
                </div>

                {/* Team Stats */}
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div className="bg-slate-50/50 rounded-2xl p-4">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Team Size</span>
                    <p className="text-slate-800 font-bold text-lg">{team.currentMembers || 0}/{team.teamSize || 0}</p>
                  </div>
                  <div className="bg-slate-50/50 rounded-2xl p-4">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Applications</span>
                    <p className="text-slate-800 font-bold text-lg">{(team.applications || []).length}</p>
                  </div>
                </div>

                {/* Skills Needed */}
                <div className="mb-6 flex-grow">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Skills Needed</span>
                  <div className="flex flex-wrap gap-2 items-start">
                    {(team.skillsNeeded || []).length > 0 ? (
                      <>
                        {(team.skillsNeeded || []).slice(0, 3).map((skill, index) => (
                          <span key={index} className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 text-xs px-3 py-2 rounded-full font-medium whitespace-nowrap">
                            {skill}
                          </span>
                        ))}
                        {(team.skillsNeeded || []).length > 3 && (
                          <span className="text-slate-500 text-xs bg-slate-100 px-3 py-2 rounded-full whitespace-nowrap">+{(team.skillsNeeded || []).length - 3} more</span>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-slate-500 italic flex items-center h-8">No skills specified</span>
                    )}
                  </div>
                </div>

                {/* Current Members Preview */}
                <div className="mb-6">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Team Members</span>
                  <div className="space-y-2 min-h-[5rem] flex flex-col justify-start">
                    {team.members && team.members.length > 0 ? (
                      <>
                        {(team.members || []).slice(0, 2).map((member, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium text-xs mr-3 flex-shrink-0">
                              {(member.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-grow min-w-0">
                              <span className="font-medium text-slate-800 block truncate">{member.name || 'Unknown'}</span>
                              <span className="text-slate-500 text-xs block truncate">{member.role || 'Member'}</span>
                            </div>
                          </div>
                        ))}
                        {(team.members || []).length > 2 && (
                          <div className="text-xs text-slate-500 pl-11 pt-1">+{(team.members || []).length - 2} more members</div>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-slate-500 italic flex items-center h-8">No members yet</div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Tags</span>
                  <div className="flex flex-wrap gap-2 min-h-[2.5rem] items-start">
                    {team.tags && team.tags.length > 0 ? (
                      team.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-xs px-3 py-2 rounded-full font-medium whitespace-nowrap">
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500 italic flex items-center h-8">No tags</span>
                    )}
                  </div>
                </div>

                {/* Spacer to push button to bottom */}
                <div className="flex-grow"></div>

                {/* Join Button - Always at the bottom */}
                <div className="mt-auto">
                  <button
                    onClick={() => handleButtonClick(team)}
                    disabled={buttonState.disabled}
                    className={`w-full py-4 px-6 rounded-2xl text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${buttonState.className}`}
                  >
                    {buttonState.text}
                  </button>

                  {/* Created by info */}
                  <div className="mt-4 text-xs text-slate-500 text-center bg-slate-50/50 rounded-xl py-2">
                    Created {team.createdAt ? new Date(team.createdAt?.toDate?.() || team.createdAt).toLocaleDateString() : 'Unknown date'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}

export default TeamsPage;