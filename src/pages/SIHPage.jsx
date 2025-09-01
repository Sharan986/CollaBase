import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  fetchProblemStatements, 
  getCategories, 
  getThemes,
  uploadProblemStatements,
  isCollectionEmpty 
} from '../services/sihService';
import problemStatementsData from '../data/sihProblemStatements.json';

const SIHPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [problemStatements, setProblemStatements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamFormData, setTeamFormData] = useState({
    name: '',
    description: '',
    requiredSkills: '',
    maxMembers: 6
  });

  // Load data from Firebase on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Check if data exists, if not, offer to upload
        const isEmpty = await isCollectionEmpty();
        if (isEmpty) {
          setLoading(false);
          return;
        }

        // Fetch problem statements
        const problemsResult = await fetchProblemStatements();
        if (problemsResult.success) {
          setProblemStatements(problemsResult.data);
          toast.success(`Loaded ${problemsResult.data.length} problem statements!`);
        } else {
          toast.error('Failed to load SIH data');
        }

        // Fetch categories and themes
        const categoriesResult = await getCategories();
        if (categoriesResult.success) {
          setCategories(categoriesResult.data);
        }

        const themesResult = await getThemes();
        if (themesResult.success) {
          setThemes(themesResult.data);
        }

      } catch (error) {
        console.error('Error loading SIH data:', error);
        toast.error('Failed to load SIH data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Manual upload function
  const handleUploadData = async () => {
    setLoading(true);
    try {
      toast.loading('Uploading SIH 2025 data...', { duration: 5000 });
      
      const result = await uploadProblemStatements(problemStatementsData);
      
      if (result.success) {
        toast.success(`✅ ${result.message}`);
        
        // Reload data after upload
        const problemsResult = await fetchProblemStatements();
        if (problemsResult.success) {
          setProblemStatements(problemsResult.data);
        }
        
        const categoriesResult = await getCategories();
        if (categoriesResult.success) {
          setCategories(categoriesResult.data);
        }

        const themesResult = await getThemes();
        if (themesResult.success) {
          setThemes(themesResult.data);
        }
      } else {
        toast.error(`❌ Upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  // Clean duplicates function (kept for future use if needed)
  // const handleCleanDuplicates = async () => {
  //   if (!confirm('This will remove ALL existing data and upload fresh SIH 2025 data. Continue?')) {
  //     return;
  //   }
  //   
  //   setLoading(true);
  //   try {
  //     toast.loading('Cleaning database and uploading fresh data...', { duration: 5000 });
  //     
  //     const result = await uploadProblemStatements(problemStatementsData, true);
  //     
  //     if (result.success) {
  //       toast.success('✅ Database cleaned! Only SIH 2025 data remains.');
  //       
  //       const problemsResult = await fetchProblemStatements();
  //       if (problemsResult.success) {
  //         console.log('Fetched problems count after cleanup:', problemsResult.data.length);
  //         setProblemStatements(problemsResult.data);
  //       }
  //       
  //       const categoriesResult = await getCategories();
  //       if (categoriesResult.success) {
  //         setCategories(categoriesResult.data);
  //       }

  //       const themesResult = await getThemes();
  //       if (themesResult.success) {
  //         setThemes(themesResult.data);
  //       }
  //     } else {
  //       toast.error(`❌ Cleanup failed: ${result.error}`);
  //     }
  //   } catch (error) {
  //     console.error('Cleanup error:', error);
  //     toast.error(`Cleanup failed: ${error.message}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Filter problems based on search and filters
  useEffect(() => {
    let filtered = problemStatements;

    if (searchTerm) {
      filtered = filtered.filter(ps => 
        ps.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ps.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ps.psNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ps.theme.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(ps => ps.category === selectedCategory);
    }

    if (selectedTheme) {
      filtered = filtered.filter(ps => ps.theme === selectedTheme);
    }

    setFilteredProblems(filtered);
  }, [searchTerm, selectedCategory, selectedTheme, problemStatements]);

  const openModal = (problem) => {
    setSelectedProblem(problem);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProblem(null);
  };

  const getThemeColor = (theme) => {
    const colors = {
      'MedTech / BioTech / HealthTech': 'from-emerald-500 to-green-600',
      'Travel & Tourism': 'from-blue-500 to-cyan-600',
      'Transportation & Logistics': 'from-purple-500 to-indigo-600',
      'Agriculture, FoodTech & Rural Development': 'from-orange-500 to-amber-600',
      'Smart Education': 'from-pink-500 to-rose-600',
      'Disaster Management': 'from-red-500 to-pink-600',
      'Clean & Green Technology': 'from-green-500 to-emerald-600',
      'Smart Automation': 'from-indigo-500 to-purple-600',
      'Blockchain & Cybersecurity': 'from-gray-500 to-slate-600',
      'Renewable / Sustainable Energy': 'from-yellow-500 to-orange-600',
      'Heritage & Culture': 'from-violet-500 to-purple-600',
      'Miscellaneous': 'from-slate-500 to-gray-600',
      'Fitness & Sports': 'from-cyan-500 to-blue-600',
      'Robotics and Drones': 'from-teal-500 to-cyan-600'
    };
    return colors[theme] || 'from-gray-500 to-slate-600';
  };

  const handleCreateTeam = (problemId) => {
    if (!currentUser) {
      toast.error('Please login to create a team');
      return;
    }
    setSelectedProblem(problemStatements.find(p => p.id === problemId));
    setShowTeamForm(true);
    setShowModal(false);
  };

  const handleTeamFormSubmit = async (e) => {
    e.preventDefault();
    setIsCreatingTeam(true);

    try {
      // Simulate API call for team creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Team created successfully! Redirecting to manage teams...');
      
      // Reset form
      setTeamFormData({
        name: '',
        description: '',
        requiredSkills: '',
        maxMembers: 6
      });
      setShowTeamForm(false);
      
      // Redirect to manage teams page after a delay
      setTimeout(() => {
        navigate('/manage-teams');
      }, 1500);
      
    } catch (error) {
      toast.error('Failed to create team. Please try again.');
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleBookmarkProblem = (problemId) => {
    if (!currentUser) {
      toast.error('Please login to bookmark problems');
      return;
    }
    
    // Get existing bookmarks from localStorage
    const bookmarks = JSON.parse(localStorage.getItem('sihBookmarks') || '[]');
    
    if (bookmarks.includes(problemId)) {
      // Remove bookmark
      const updatedBookmarks = bookmarks.filter(id => id !== problemId);
      localStorage.setItem('sihBookmarks', JSON.stringify(updatedBookmarks));
      toast.success('Problem removed from bookmarks');
    } else {
      // Add bookmark
      bookmarks.push(problemId);
      localStorage.setItem('sihBookmarks', JSON.stringify(bookmarks));
      toast.success('Problem bookmarked successfully');
    }
  };

  const isBookmarked = (problemId) => {
    const bookmarks = JSON.parse(localStorage.getItem('sihBookmarks') || '[]');
    return bookmarks.includes(problemId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 rounded-3xl shadow-2xl mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-2xl inter-bold text-gray-900 mb-2">Loading SIH 2025 Data</h2>
          <p className="text-gray-600 inter-regular">Please wait while we fetch the problem statements...</p>
        </div>
      </div>
    );
  }

  // Show upload prompt if no data
  if (problemStatements.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-24 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto p-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 rounded-3xl shadow-2xl mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-3xl inter-bold text-gray-900 mb-4">SIH 2025 Data Not Found</h2>
          <p className="text-gray-600 inter-regular text-lg mb-8 leading-relaxed">
            No problem statements found in the database. Click the button below to upload all 101 SIH 2025 problem statements to Firebase.
          </p>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-left">
                <h3 className="text-lg inter-bold text-blue-900 mb-2">What will be uploaded:</h3>
                <ul className="text-blue-800 inter-regular space-y-1 text-sm">
                  <li>✓ 101 Official SIH 2025 Problem Statements</li>
                  <li>✓ All categories: Software & Hardware</li>
                  <li>✓ 15+ themes from various ministries</li>
                  <li>✓ Complete organization and PS number data</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleUploadData}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-4 px-8 rounded-2xl inter-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload SIH 2025 Data
            </div>
          </button>
          
          <p className="text-gray-500 inter-regular text-sm mt-4">
            This is a one-time setup that will populate your Firebase database.
          </p>
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
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 rounded-3xl shadow-2xl mb-8 transform hover:scale-105 transition-all duration-300">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl inter-bold bg-gradient-to-r from-slate-800 via-orange-800 to-red-900 bg-clip-text text-transparent leading-tight mb-6">
            Smart India Hackathon 2025
          </h1>
          <p className="text-slate-600 text-xl sm:text-2xl mt-4 max-w-3xl mx-auto leading-relaxed inter-regular">
            Explore innovative problem statements and join the nation's biggest hackathon
          </p>
          
          {/* Important Guidelines */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-2xl p-6 mt-8 max-w-4xl mx-auto shadow-lg">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg inter-bold text-blue-900 mb-3">Important Team Formation Guidelines</h3>
                <ul className="text-blue-800 inter-regular space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Team Size:</strong> 2-6 members per team</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Gender Diversity:</strong> At least one female member is mandatory in every team</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Technology Stack:</strong> No specific technology compulsion - teams can choose their preferred approach</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span><strong>Registration:</strong> Only one team can register per problem statement from each institute</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="inline-flex items-center bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 text-orange-700 px-6 py-3 rounded-full text-lg inter-medium mt-6 shadow-lg">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-3 animate-pulse"></div>
            {filteredProblems.length} Problem Statements Available
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 mb-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="text-sm inter-semibold text-gray-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Problem Statements
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, organization, or theme..."
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 inter-regular bg-white shadow-lg hover:shadow-xl group-hover:border-orange-300"
                />
                <svg className="absolute left-4 top-4.5 h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-4 h-6 w-6 text-gray-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="group">
              <label className="text-sm inter-semibold text-gray-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Category
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 inter-regular bg-white shadow-lg hover:shadow-xl group-hover:border-blue-300 appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <svg className="absolute right-4 top-4.5 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Theme Filter */}
            <div className="group">
              <label className="text-sm inter-semibold text-gray-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Theme
              </label>
              <div className="relative">
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 inter-regular bg-white shadow-lg hover:shadow-xl group-hover:border-purple-300 appearance-none cursor-pointer"
                >
                  <option value="">All Themes</option>
                  {themes.map(theme => (
                    <option key={theme} value={theme}>{theme}</option>
                  ))}
                </select>
                <svg className="absolute right-4 top-4.5 h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors duration-200 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Filter Summary */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {searchTerm && (
              <span className="inline-flex items-center bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 text-orange-700 px-4 py-2 rounded-xl text-sm inter-medium">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search: "{searchTerm}"
                <button 
                  onClick={() => setSearchTerm('')}
                  className="ml-2 text-orange-600 hover:text-red-600 transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200 text-blue-700 px-4 py-2 rounded-xl text-sm inter-medium">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {selectedCategory}
                <button 
                  onClick={() => setSelectedCategory('')}
                  className="ml-2 text-blue-600 hover:text-red-600 transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {selectedTheme && (
              <span className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 text-purple-700 px-4 py-2 rounded-xl text-sm inter-medium">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {selectedTheme}
                <button 
                  onClick={() => setSelectedTheme('')}
                  className="ml-2 text-purple-600 hover:text-red-600 transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedCategory || selectedTheme) && (
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedTheme('');
                }}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-2xl transition-all duration-300 inter-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear All Filters
                <span className="ml-3 bg-white text-gray-600 px-2 py-1 rounded-lg text-xs inter-medium">
                  {[searchTerm, selectedCategory, selectedTheme].filter(Boolean).length} active
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Problem Statements Grid */}
        <div className="space-y-6">
          {filteredProblems.map((problem, index) => (
            <div key={problem.firebaseId || problem.id || `problem-${index}`} className="group bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden relative">
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-50/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              
              <div className="relative z-10">
                {/* Problem Header */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-flex items-center bg-gradient-to-r from-slate-100 to-gray-200 text-slate-700 px-4 py-2 rounded-full text-sm inter-semibold shadow-md">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {problem.psNumber}
                      </span>
                      <span className={`inline-flex items-center bg-gradient-to-r ${getThemeColor(problem.theme)} text-white px-4 py-2 rounded-full text-sm inter-semibold shadow-lg`}>
                        <div className="w-2 h-2 bg-white rounded-full mr-2 opacity-80"></div>
                        {problem.theme}
                      </span>
                    </div>
                    <h3 className="text-2xl lg:text-3xl inter-bold text-gray-900 mb-4 leading-tight group-hover:text-orange-800 transition-colors duration-300">
                      {problem.title}
                    </h3>
                    <p className="text-gray-600 inter-regular text-lg mb-4 leading-relaxed">
                      <span className="inter-semibold">Organization:</span> {problem.organization}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:items-end">
                    <div className="text-center lg:text-right">
                      <p className="text-sm text-gray-500 inter-medium mb-1">Category</p>
                      <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-xl inter-semibold shadow-md">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {problem.category}
                      </div>
                    </div>
                    <div className="text-center lg:text-right">
                      <p className="text-sm text-gray-500 inter-medium mb-1">Submitted Ideas</p>
                      <p className="text-blue-800 inter-bold text-2xl">{problem.submittedIdeas}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200/50">
                  <button
                    onClick={() => openModal(problem)}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-4 px-6 rounded-2xl inter-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Details
                  </button>
                  <button
                    onClick={() => handleBookmarkProblem(problem.id)}
                    className={`flex items-center justify-center px-6 py-4 rounded-2xl inter-semibold transition-all duration-300 transform hover:scale-105 ${
                      isBookmarked(problem.id)
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg'
                        : 'border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white'
                    }`}
                  >
                    <svg className="w-5 h-5" fill={isBookmarked(problem.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                  {currentUser && (
                    <button
                      onClick={() => handleCreateTeam(problem.id)}
                      className="flex-1 border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white py-4 px-6 rounded-2xl inter-semibold transition-all duration-300 transform hover:scale-105"
                    >
                      <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Create Team
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredProblems.length === 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-16 text-center">
            <div className="w-32 h-32 bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-3xl inter-bold text-gray-900 mb-4">No Problem Statements Found</h3>
            <p className="text-gray-600 inter-regular text-lg mb-8 max-w-md mx-auto">
              Try adjusting your search criteria or clear the filters to see more results.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedTheme('');
              }}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-2xl inter-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Problem Details Modal */}
      {showModal && selectedProblem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl border border-white/60 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl inter-bold text-gray-900">Problem Statement Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Problem Info */}
                <div className="bg-gradient-to-r from-slate-50 to-gray-100 rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center bg-white text-slate-700 px-4 py-2 rounded-full text-sm inter-semibold shadow-md">
                      {selectedProblem.psNumber}
                    </span>
                    <span className={`inline-flex items-center bg-gradient-to-r ${getThemeColor(selectedProblem.theme)} text-white px-4 py-2 rounded-full text-sm inter-semibold shadow-lg`}>
                      {selectedProblem.theme}
                    </span>
                  </div>
                  <h3 className="text-2xl inter-bold text-gray-900 mb-4">{selectedProblem.title}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 inter-medium mb-1">Organization</p>
                      <p className="text-gray-800 inter-semibold">{selectedProblem.organization}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 inter-medium mb-1">Category</p>
                      <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-lg inter-semibold">
                        {selectedProblem.category}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 text-center border border-blue-200">
                    <h4 className="text-sm text-blue-600 inter-medium mb-2">Problem Statement Number</h4>
                    <p className="text-blue-800 inter-bold text-2xl">{selectedProblem.psNumber}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 text-center border border-green-200">
                    <h4 className="text-sm text-green-600 inter-medium mb-2">Submitted Ideas</h4>
                    <p className="text-green-800 inter-bold text-2xl">{selectedProblem.submittedIdeas}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
                  <button
                    onClick={() => handleBookmarkProblem(selectedProblem.id)}
                    className={`flex items-center justify-center px-6 py-4 rounded-2xl inter-semibold transition-all duration-300 transform hover:scale-105 ${
                      isBookmarked(selectedProblem.id)
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg'
                        : 'border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-2" fill={isBookmarked(selectedProblem.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    {isBookmarked(selectedProblem.id) ? 'Bookmarked' : 'Bookmark'}
                  </button>
                  {currentUser && (
                    <button 
                      onClick={() => handleCreateTeam(selectedProblem.id)}
                      className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-4 px-6 rounded-2xl inter-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Create Team for This Problem
                    </button>
                  )}
                  <button
                    onClick={closeModal}
                    className="flex-1 border-2 border-slate-300 text-slate-700 hover:bg-slate-100 py-4 px-6 rounded-2xl inter-semibold transition-all duration-300"
                  >
                    <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Creation Form Modal */}
      {showTeamForm && selectedProblem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl border border-white/60 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl inter-bold text-gray-900">Create Team</h2>
                <button
                  onClick={() => setShowTeamForm(false)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Problem Info */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 mb-6 border border-orange-200">
                <h3 className="inter-semibold text-gray-800 mb-2">Problem Statement</h3>
                <p className="text-sm text-gray-600 inter-regular mb-1">{selectedProblem.psNumber}</p>
                <p className="text-gray-800 inter-medium">{selectedProblem.title}</p>
              </div>

              {/* Team Form */}
              <form onSubmit={handleTeamFormSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm inter-semibold text-gray-700 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={teamFormData.name}
                    onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                    placeholder="Enter your team name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 inter-regular"
                  />
                </div>

                <div>
                  <label className="block text-sm inter-semibold text-gray-700 mb-2">
                    Team Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={teamFormData.description}
                    onChange={(e) => setTeamFormData({ ...teamFormData, description: e.target.value })}
                    placeholder="Describe your team's vision and approach for this problem"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 inter-regular resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm inter-semibold text-gray-700 mb-2">
                    Required Skills
                  </label>
                  <input
                    type="text"
                    value={teamFormData.requiredSkills}
                    onChange={(e) => setTeamFormData({ ...teamFormData, requiredSkills: e.target.value })}
                    placeholder="e.g., React, Node.js, Machine Learning, UI/UX Design"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 inter-regular"
                  />
                </div>

                <div>
                  <label className="block text-sm inter-semibold text-gray-700 mb-2">
                    Maximum Team Members
                  </label>
                  <select
                    value={teamFormData.maxMembers}
                    onChange={(e) => setTeamFormData({ ...teamFormData, maxMembers: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 inter-regular"
                  >
                    <option value={2}>2 Members</option>
                    <option value={3}>3 Members</option>
                    <option value={4}>4 Members</option>
                    <option value={5}>5 Members</option>
                    <option value={6}>6 Members</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowTeamForm(false)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 py-4 px-6 rounded-2xl inter-semibold transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingTeam}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-2xl inter-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isCreatingTeam ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Team...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Create Team
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SIHPage;
