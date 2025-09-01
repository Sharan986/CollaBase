import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useDashboardNotifications } from '../contexts/DashboardNotificationContext';
import { useNavigate, Link } from 'react-router-dom';
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
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [applyingTeams, setApplyingTeams] = useState(new Set());
  
  // Skills Modal State
  const [skillsModal, setSkillsModal] = useState({
    isOpen: false,
    skills: [],
    teamTitle: ''
  });

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
        setInitialLoad(false);
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
      showToast(`Application sent to ${teamName}!`, 'success');
      
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center pt-24">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-12 text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          {/* <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/20 border-t-blue-500 mx-auto mb-6"></div> */}
          <p className="text-slate-600 text-lg font-medium inter-medium">Loading projects...</p>
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
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Modern Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-3xl shadow-2xl mb-8 transform hover:scale-105 transition-all duration-300">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-purple-900 bg-clip-text text-transparent leading-tight mb-6 inter-bold">
            Discover Projects
          </h1>
          <p className="text-slate-600 text-xl sm:text-2xl mt-4 max-w-3xl mx-auto leading-relaxed font-light inter-light">
            Join exciting teams, collaborate on innovative projects, and bring ideas to life
          </p>
          <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 text-blue-700 px-6 py-3 rounded-full text-lg font-medium mt-6 shadow-lg inter-medium">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
            {filteredTeams.length} {filteredTeams.length === 1 ? 'Project Available' : 'Projects Available'}
          </div>
        </div>

        {/* Modern Search and Filters */}
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 mb-12">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
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
              <label className="text-sm font-semibold text-slate-700 inter-semibold">Category</label>
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
              <label className="text-sm font-semibold text-slate-700 inter-semibold">Skills</label>
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
              <label className="text-sm font-semibold text-slate-700 inter-semibold">Actions</label>
              <button
                onClick={clearFilters}
                className="w-full bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white px-6 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 font-medium shadow-lg inter-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || selectedCategory || selectedSkill) && (
            <div className="flex flex-wrap gap-3">
              {searchTerm && (
                <div className="flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium inter-medium">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search: "{searchTerm}"
                </div>
              )}
              {selectedCategory && (
                <div className="flex items-center bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium inter-medium">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0M8 5v4h8V5" />
                  </svg>
                  Category: {selectedCategory}
                </div>
              )}
              {selectedSkill && (
                <div className="flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium inter-medium">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
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
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4 inter-bold">No Teams Found</h3>
          <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto leading-relaxed inter-regular">
            {searchTerm || selectedCategory || selectedSkill
              ? 'Try adjusting your filters to find more teams.'
              : 'No teams available at the moment. Be the first to create one!'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {(searchTerm || selectedCategory || selectedSkill) && (
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 font-medium shadow-lg inter-medium"
              >
                Clear Filters
              </button>
            )}
            <a
              href="/create-team"
              className="inline-block bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 font-medium shadow-lg inter-medium"
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
              <div key={team.id} className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 p-6 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col h-auto min-h-[700px] overflow-visible relative">
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  {/* Header Section - Flexible height for title */}
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-slate-900 transition-colors duration-300 leading-tight pr-2 flex-1 inter-bold">
                        {team.title || 'Untitled Team'}
                      </h3>
                      <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full flex-shrink-0 font-medium shadow-lg ml-2 inter-medium">
                        {team.category || 'Other'}
                      </span>
                    </div>
                  </div>

                  {/* Description Section - Fixed height for consistency */}
                  <div className="mb-8 h-24">
                    <div className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide inter-semibold">Description</div>
                    <div className="h-16 overflow-hidden">
                      <p className="text-slate-600 text-sm leading-relaxed inter-regular">
                        {team.description || 'No description available for this project.'}
                      </p>
                    </div>
                  </div>

                  {/* Stats Section - Fixed Height */}
                  <div className="mb-4 grid grid-cols-2 gap-3 h-16">
                    <div className="bg-gradient-to-br from-slate-50/80 to-slate-100/80 backdrop-blur-sm rounded-xl p-3 border border-slate-200/50 flex flex-col justify-center">
                      <span className="text-xs font-bold text-slate-600 block">Team</span>
                      <p className="text-slate-800 font-bold text-sm">{team.currentMembers || 0}/{team.teamSize || 0}</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50/80 to-slate-100/80 backdrop-blur-sm rounded-xl p-3 border border-slate-200/50 flex flex-col justify-center">
                      <span className="text-xs font-bold text-slate-600 block">Apps</span>
                      <p className="text-slate-800 font-bold text-sm">{(team.applications || []).length}</p>
                    </div>
                  </div>

                  {/* Interactive Skills Section - Like Landing Page */}
                  <div className="mb-4 h-16">
                    <div className="text-xs font-bold text-slate-600 mb-2">Skills Required</div>
                    <div className="flex flex-wrap gap-2 h-10 overflow-hidden">
                      {(team.skillsNeeded || []).length > 0 ? (
                        <>
                          {(team.skillsNeeded || []).slice(0, 2).map((skill, index) => (
                            <span key={index} className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium border border-purple-200 h-fit">
                              {skill}
                            </span>
                          ))}
                          {(team.skillsNeeded || []).length > 2 && (
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                setSkillsModal({
                                  isOpen: true,
                                  skills: team.skillsNeeded,
                                  teamTitle: team.title || 'Untitled Project'
                                });
                              }}
                              className="text-slate-500 text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full border border-slate-200 h-fit transition-colors cursor-pointer"
                            >
                              +{(team.skillsNeeded || []).length - 2} more
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-slate-500 italic">No skills specified</span>
                      )}
                    </div>
                  </div>

                  {/* Team Members Section */}
                  <div className="mb-6 h-24">
                    <div className="text-xs font-bold text-slate-600 mb-2">Team Members</div>
                    <div className="space-y-2 h-18 overflow-hidden">
                      {team.members && team.members.length > 0 ? (
                        <>
                          {(team.members || []).slice(0, 2).map((member, index) => (
                            <div key={index} className="flex items-center text-xs">
                              <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs mr-2 flex-shrink-0 shadow-sm">
                                {(member.name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-grow min-w-0">
                                <span className="font-medium text-slate-800 block truncate text-xs">{member.name || 'Unknown'}</span>
                                <span className="text-slate-500 text-xs block truncate">{member.role || 'Member'}</span>
                              </div>
                            </div>
                          ))}
                          {(team.members || []).length > 2 && (
                            <div className="text-xs text-slate-500 pl-8">+{(team.members || []).length - 2} more members</div>
                          )}
                        </>
                      ) : (
                        <div className="text-xs text-slate-500 italic">No members yet</div>
                      )}
                    </div>
                  </div>

                  {/* Compact Action Button */}
                  <div className="mt-auto">
                    <button
                      onClick={() => handleButtonClick(team)}
                      disabled={buttonState.disabled}
                      className={`w-full py-2.5 px-4 rounded-xl text-white font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg text-sm ${buttonState.className}`}
                    >
                      {buttonState.text}
                    </button>

                    {/* Compact Created Info */}
                    <div className="mt-2 text-xs text-slate-500 text-center bg-gradient-to-br from-slate-50/80 to-slate-100/80 backdrop-blur-sm rounded-lg py-1 border border-slate-200/50">
                      {team.createdAt ? new Date(team.createdAt?.toDate?.() || team.createdAt).toLocaleDateString() : 'Unknown date'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Skills Modal */}
      {skillsModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800">Skills Required</h3>
              <button
                onClick={() => setSkillsModal({ isOpen: false, skills: [], teamTitle: '' })}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-slate-600 mb-6 text-lg">
              <span className="font-semibold text-slate-800">{skillsModal.teamTitle}</span> is looking for team members with these skills:
            </p>
            <div className="flex flex-wrap gap-3">
              {skillsModal.skills.map((skill, index) => (
                <span key={index} className="bg-gradient-to-r from-purple-100 via-blue-100 to-indigo-100 text-purple-800 text-sm px-4 py-3 rounded-full font-semibold border border-purple-200 shadow-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Skills Modal */}
      {skillsModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800">Skills Required</h3>
              <button
                onClick={() => setSkillsModal({ isOpen: false, skills: [], teamTitle: '' })}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-slate-600 mb-6 text-lg">
              <span className="font-semibold text-slate-800">{skillsModal.teamTitle}</span> is looking for team members with these skills:
            </p>
            <div className="flex flex-wrap gap-3">
              {skillsModal.skills.map((skill, index) => (
                <span key={index} className="bg-gradient-to-r from-purple-100 via-blue-100 to-indigo-100 text-purple-800 text-sm px-4 py-3 rounded-full font-semibold border border-purple-200 shadow-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Floating Action Button - Create Team Shortcut */}
      <Link to="/create-team">
        <button className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 z-50 flex items-center justify-center group">
          <svg 
            className="w-8 h-8 transition-transform duration-300 group-hover:rotate-90" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
          </svg>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
            <div className="bg-slate-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
              Create New Team
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
            </div>
          </div>
        </button>
      </Link>
      </div>
    </div>
  );
}

export default TeamsPage;