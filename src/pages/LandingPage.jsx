import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

function LandingPage() {
  const { currentUser, userProfile } = useAuth();
  const [featuredTeams, setFeaturedTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [skillsModal, setSkillsModal] = useState({ isOpen: false, skills: [], teamTitle: '' });

  // Redirect to dashboard if already logged in
  if (currentUser && userProfile) {
    return <Navigate to="/dashboard" replace />;
  }

  // Fetch featured teams
  useEffect(() => {
    async function fetchFeaturedTeams() {
      try {
        console.log('🔄 Fetching teams from Firestore...');
        
        const querySnapshot = await getDocs(collection(db, 'teams'));
        console.log('✅ Query successful! Found', querySnapshot.size, 'teams');
        
        const teams = querySnapshot.docs.map(doc => {
          return {
            id: doc.id,
            ...doc.data()
          };
        });
        
        console.log('📊 Setting featured teams:', teams.length);
        // Take only first 6 teams for featured section
        setFeaturedTeams(teams.slice(0, 6));
      } catch (error) {
        console.log('⚠️ Using demo cards due to:', error.code);
        
        // If it's a permission error, we use demo cards (which are already great!)
        if (error.code === 'permission-denied') {
          console.log('🎨 Displaying beautiful demo project cards instead');
          setFeaturedTeams([]);
        }
      } finally {
        setLoading(false);
      }
    }

    // Only fetch once when component mounts
    fetchFeaturedTeams();
  }, []); // Removed currentUser dependency to prevent duplicate calls

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-24">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      {/* Hero Section - Responsive */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full min-h-screen items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 gap-8 lg:gap-12">
        {/* Text Content Section - Responsive */}
        <div className="flex-1 space-y-6 lg:space-y-8 text-center lg:text-left order-2 lg:order-1">
          <div className="space-y-4 lg:space-y-6">
            <div className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-2 lg:px-4 lg:py-2 rounded-full text-xs sm:text-sm mb-2 lg:mb-4 inter-medium">
              <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              The Future of Collaboration
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-900 bg-clip-text text-transparent leading-tight inter-bold">
              Welcome to<br /> 
              <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent pattaya-regular">CollaBase</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 inter-regular">
              Where brilliant minds come together to build the extraordinary. Connect with like-minded innovators, 
              form dream teams, and turn your ideas into reality through seamless collaboration.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 lg:gap-6 pt-2 lg:pt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full border-2 border-white"></div>
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full border-2 border-white"></div>
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-xs sm:text-sm text-slate-600 inter-medium">500+ Active Collaborators</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center lg:justify-start">
            <Link to="/teams" className="w-full sm:w-auto">
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center gap-2 text-sm lg:text-base inter-semibold">
                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Discover Projects
              </button>
            </Link>
            <Link to="/create-team" className="w-full sm:w-auto">
              <button className="w-full border-2 border-slate-800 hover:bg-slate-800 hover:text-white text-slate-800 px-6 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 text-sm lg:text-base inter-semibold">
                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Start Building
              </button>
            </Link>
          </div>
        </div>

        {/* Modern Illustration Section - Responsive */}
        <div className="flex-1 relative flex justify-center items-center order-1 lg:order-2">
          <div className="relative">
            {/* Main illustration container - Responsive */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
              {/* Background circles with gradients */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-600/20 backdrop-blur-lg rounded-full shadow-2xl border border-white/30"></div>
              
              {/* Floating collaboration elements - Responsive sizes */}
              <div className="absolute top-6 left-6 lg:top-8 lg:left-8 w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-xl transform rotate-12">
                <svg className="w-6 h-6 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              <div className="absolute top-12 right-8 lg:top-16 lg:right-12 w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg transform -rotate-6">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <div className="absolute bottom-8 left-8 lg:bottom-12 lg:left-12 w-11 h-11 lg:w-14 lg:h-14 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-xl transform rotate-6">
                <svg className="w-5 h-5 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              
              <div className="absolute bottom-6 right-6 lg:bottom-8 lg:right-8 w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded lg:rounded-lg flex items-center justify-center shadow-lg transform -rotate-12">
                <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              
              {/* Central logo/brand element - Responsive */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white pattaya-regular">CB</span>
                </div>
              </div>
            </div>
            
            {/* Animated connection lines - Responsive */}
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full opacity-30" viewBox="0 0 400 400">
                <path d="M100 100 L300 150" stroke="url(#grad1)" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse">
                  <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite"/>
                </path>
                <path d="M300 100 L100 300" stroke="url(#grad2)" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse">
                  <animate attributeName="stroke-dashoffset" values="0;10" dur="3s" repeatCount="indefinite"/>
                </path>
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#6366F1" stopOpacity="0.8"/>
                  </linearGradient>
                  <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.8"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Responsive */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-20 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          {/* Section Header - Responsive */}
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center bg-indigo-50 text-indigo-700 px-3 py-2 lg:px-4 lg:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 lg:mb-6 inter-medium">
              <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
              </svg>
              Why Choose CollaBase?
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-indigo-800 to-purple-900 bg-clip-text text-transparent mb-3 lg:mb-4 inter-bold">
              Built for Modern Collaboration
            </h2>
            <p className="text-slate-600 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed px-4 inter-regular">
              Experience the next generation of teamwork with features designed to bring out the best in every collaboration
            </p>
          </div>

          {/* Features Grid - Responsive */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                title: "Smart Matching",
                description: "Our AI-powered algorithm connects you with projects and teammates that perfectly match your skills and interests.",
                gradient: "from-blue-500 to-blue-600"
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: "Seamless Team Building",
                description: "Create diverse, high-performing teams with built-in collaboration tools and member management features.",
                gradient: "from-emerald-500 to-emerald-600"
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Real-time Collaboration",
                description: "Stay connected with instant messaging, file sharing, and project tracking all in one unified platform.",
                gradient: "from-purple-500 to-purple-600"
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                title: "Innovation Hub",
                description: "Turn your wildest ideas into reality with access to resources, mentorship, and a community of creators.",
                gradient: "from-amber-500 to-amber-600"
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: "Progress Tracking",
                description: "Monitor your team's progress with powerful analytics and milestone tracking to ensure project success.",
                gradient: "from-rose-500 to-rose-600"
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: "Secure & Private",
                description: "Your data and intellectual property are protected with enterprise-grade security and privacy controls.",
                gradient: "from-indigo-500 to-indigo-600"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-all duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-slate-900 transition-colors duration-300 inter-bold">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300 inter-regular">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center bg-emerald-50 text-emerald-700 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 inter-medium">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v2a2 2 0 002 2m0 0h14m-14 0a2 2 0 002 2v2a2 2 0 01-2 2M19 13a2 2 0 00-2-2v2a2 2 0 002 2v-2z" />
              </svg>
              Live Projects
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-emerald-800 to-blue-900 bg-clip-text text-transparent mb-3 sm:mb-4 inter-bold">
              Amazing Projects in Progress
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed px-4 inter-regular">
              Join a thriving community of innovators, builders, and dreamers who are creating the future, one project at a time
            </p>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white/70 backdrop-blur-lg rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl border border-white/50 animate-pulse"
                >
                  <div className="w-full h-48 sm:h-56 lg:h-64 bg-slate-200"></div>
                  <div className="p-4 sm:p-6 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : featuredTeams.length === 0 ? (
              // Fallback demo cards (no header message needed since we show demo projects)
              <>
                {/* Demo/Preview Cards - These look like real projects */}
                {[
                  {
                    title: "AI-Powered Study Assistant",
                    category: "AI/ML",
                    description: "Building an intelligent study companion that helps students learn more effectively using machine learning algorithms and personalized learning paths.",
                    skillsNeeded: ["Python", "TensorFlow", "React", "Node.js", "MongoDB"],
                    currentMembers: 3,
                    teamSize: 5,
                    applications: 12
                  },
                  {
                    title: "Sustainable Campus Initiative",
                    category: "Environment",
                    description: "Creating a comprehensive mobile app to track and reduce carbon footprint across university campuses with gamification and community challenges.",
                    skillsNeeded: ["React Native", "Firebase", "UI/UX Design", "Data Analytics"],
                    currentMembers: 4,
                    teamSize: 6,
                    applications: 18
                  },
                  {
                    title: "Virtual Reality Learning Platform",
                    category: "EdTech",
                    description: "Developing immersive VR experiences for education, making complex subjects like physics and chemistry accessible through virtual reality.",
                    skillsNeeded: ["Unity", "C#", "3D Modeling", "VR Development", "Educational Design"],
                    currentMembers: 2,
                    teamSize: 4,
                    applications: 9
                  },
                  {
                    title: "Smart City Traffic Optimizer",
                    category: "IoT",
                    description: "Building an intelligent traffic management system using IoT sensors and machine learning to reduce congestion and improve urban mobility.",
                    skillsNeeded: ["IoT", "Python", "Machine Learning", "Cloud Computing"],
                    currentMembers: 1,
                    teamSize: 5,
                    applications: 15
                  },
                  {
                    title: "Blockchain-Based Voting System",
                    category: "Blockchain",
                    description: "Creating a secure, transparent, and decentralized voting platform for student elections using blockchain technology and smart contracts.",
                    skillsNeeded: ["Solidity", "Web3", "React", "Cryptography", "Security"],
                    currentMembers: 2,
                    teamSize: 4,
                    applications: 22
                  },
                  {
                    title: "Mental Health Companion App",
                    category: "Healthcare",
                    description: "Developing a mobile application that provides mental health support through AI-powered chatbots, mood tracking, and peer support networks.",
                    skillsNeeded: ["React Native", "AI/NLP", "Psychology", "UX Design"],
                    currentMembers: 3,
                    teamSize: 5,
                    applications: 14
                  }
                ].slice(0, 6).map((demoTeam, index) => (
                  <div
                    key={`demo-${index}`}
                    className="group bg-white/70 backdrop-blur-lg rounded-3xl overflow-hidden shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full"
                  >
                    {/* Header Section */}
                    <div className="relative p-6 bg-gradient-to-br from-blue-50 to-indigo-100 border-b border-white/20 flex-shrink-0 h-40">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-sm shadow-lg flex-shrink-0">
                            {demoTeam.category.charAt(0)}
                          </div>
                          <div>
                            <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                              {demoTeam.category}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-slate-800">
                            {demoTeam.currentMembers}/{demoTeam.teamSize}
                          </div>
                          <div className="text-xs text-slate-500">members</div>
                        </div>
                      </div>
                      
                      {/* Title Section */}
                      <h3 className="text-xl font-bold text-slate-800 mb-6 line-clamp-2 h-14 overflow-hidden leading-tight inter-bold">
                        {demoTeam.title}
                      </h3>
                      
                      {/* Status Section */}
                      <div className="flex items-center gap-4 text-sm text-slate-600 h-5 mt-5 inter-medium">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                          <span>{demoTeam.applications} applications</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                          <span>{demoTeam.currentMembers >= demoTeam.teamSize ? 'Full' : 'Open'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="p-6 flex-grow flex flex-col mt-4">
                      {/* Description Section */}
                      <div className="mb-8 h-20">
                        <div className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide inter-semibold">
                          Description
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed h-12 overflow-hidden line-clamp-3 inter-regular">
                          {demoTeam.description}
                        </p>
                      </div>
                      
                      {/* Skills Section */}
                      <div className="mb-6 h-20">
                        <div className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide inter-semibold">
                          Skills Needed
                        </div>
                        <div className="flex flex-wrap gap-2 h-12 overflow-hidden">
                          {demoTeam.skillsNeeded.slice(0, 2).map((skill, skillIndex) => (
                            <span key={skillIndex} className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium border border-purple-200 h-fit inter-medium">
                              {skill}
                            </span>
                          ))}
                          {demoTeam.skillsNeeded.length > 2 && (
                            <span className="text-slate-500 text-xs bg-slate-100 px-3 py-1 rounded-full border border-slate-200 h-fit inter-medium">
                              +{demoTeam.skillsNeeded.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Section */}
                      <div className="mt-auto">
                        <Link to="/teams" className="block">
                          <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg h-12 flex items-center justify-center inter-semibold">
                            View Details
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              // Display actual teams
              featuredTeams.map((team) => (
                <div
                  key={team.id}
                  className="group bg-white/70 backdrop-blur-lg rounded-3xl overflow-hidden shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full"
                >
                  {/* Header Section - Consistent Height */}
                  <div className="relative p-6 bg-gradient-to-br from-blue-50 to-indigo-100 border-b border-white/20 flex-shrink-0 h-40">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg flex-shrink-0">
                          {team.category || 'Project'}
                        </div>
                        <div>
                          <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                            {team.category || 'Other'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-800">
                          {team.currentMembers || 0}/{team.teamSize || 0}
                        </div>
                        <div className="text-xs text-slate-500">members</div>
                      </div>
                    </div>
                    
                    {/* Title Section - Fixed Height */}
                    <h3 className="text-xl font-bold text-slate-800 mb-6 line-clamp-2 h-14 overflow-hidden leading-tight">
                      {team.title || 'Untitled Project'}
                    </h3>
                    
                    {/* Status Section - Fixed Height with more spacing */}
                    <div className="flex items-center gap-4 text-sm text-slate-600 h-5 mt-5">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        <span>{(team.applications || []).length} applications</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        <span>{team.currentMembers >= team.teamSize ? 'Full' : 'Open'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content Section - Consistent Layout */}
                  <div className="p-6 flex-grow flex flex-col mt-4">
                    {/* Description Section - Increased Spacing */}
                    <div className="mb-8 h-20">
                      <div className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                        Description
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed h-12 overflow-hidden line-clamp-3">
                        {team.description || 'No description available for this project.'}
                      </p>
                    </div>
                    
                    {/* Skills Section - Show only 2 skills */}
                    <div className="mb-6 h-20">
                      <div className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                        Skills Needed
                      </div>
                      <div className="flex flex-wrap gap-2 h-12 overflow-hidden">
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
                      </div>
                    </div>
                    
                    {/* Action Section - Fixed at Bottom */}
                    <div className="mt-auto">
                      <Link to={`/teams`} className="block">
                        <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg h-12 flex items-center justify-center">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Load More Button */}
          <div className="flex justify-center">
            <Link to="/teams">
              <button className="group bg-white/70 backdrop-blur-lg border border-white/50 hover:bg-white/90 text-slate-800 px-10 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl inter-semibold">
                <span className="flex items-center gap-2">
                  View All Projects
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-white/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl sm:rounded-2xl shadow-xl mb-4 sm:mb-6">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-purple-800 to-pink-900 bg-clip-text text-transparent mb-3 sm:mb-4 inter-bold">
              Got Questions? We've Got Answers
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-4 inter-regular">
              Everything you need to know about CollaBase and how to get started with your next big idea
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-12">
            {[
              {
                id: 1,
                question: "What makes CollaBase different from other collaboration platforms?",
                answer: "CollaBase is specifically designed for project-based collaboration with smart matching algorithms, integrated team management, and tools that adapt to how modern teams actually work together."
              },
              {
                id: 2,
                question: "How do I find the right team for my project?",
                answer: "Our smart discovery system helps you find teammates based on complementary skills, interests, and availability. You can also browse active projects and apply to join teams that match your expertise."
              },
              {
                id: 3,
                question: "Can I manage multiple projects simultaneously?",
                answer: "Absolutely! CollaBase is built for multi-project workflows. You can be part of several teams, track progress across all your projects, and manage your contributions from a unified dashboard."
              },
              {
                id: 4,
                question: "What collaboration tools are included?",
                answer: "CollaBase includes real-time messaging, file sharing, progress tracking, milestone management, and integrations with popular development and design tools to streamline your workflow."
              },
              {
                id: 5,
                question: "Is CollaBase suitable for both beginners and experienced teams?",
                answer: "Yes! Whether you're a student working on your first project or an experienced professional building complex solutions, CollaBase scales to meet your collaboration needs."
              },
              {
                id: 6,
                question: "How does CollaBase protect my intellectual property?",
                answer: "We take IP protection seriously with enterprise-grade security, granular privacy controls, and clear collaboration agreements to ensure your ideas and work remain protected."
              }
            ].map((faq) => (
              <div
                key={faq.id}
                className="bg-white/70 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-lg border border-white/50 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex items-center justify-between hover:bg-white/50 transition-all duration-200"
                >
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 pr-4 inter-semibold">
                    {faq.question}
                  </h3>
                  <svg
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-500 transition-transform duration-200 flex-shrink-0 ${
                      openFAQ === faq.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {openFAQ === faq.id && (
                  <div className="px-4 sm:px-6 pb-3 sm:pb-4 border-t border-white/20">
                    <div className="pt-3 sm:pt-4">
                      <p className="text-slate-600 text-sm sm:text-base leading-relaxed inter-regular">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* More FAQs Link */}
          <div className="text-center">
            <Link to="/faqs">
              <button className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-xl inter-semibold">
                <span className="flex items-center gap-2">
                  View All FAQs
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="relative z-10 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Brand Section */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-base sm:text-lg">CB</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold pattaya-regular">CollaBase</h3>
              </div>
              <p className="text-slate-300 mb-4 sm:mb-6 max-w-md leading-relaxed text-sm sm:text-base inter-regular">
                Empowering creators, innovators, and dreamers to build the extraordinary together. 
                Where collaboration meets innovation, and great ideas become reality.
              </p>
              <div className="flex space-x-3 sm:space-x-4">
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.341-.09.381-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378 0 0-.599 2.282-.744 2.840-.282 1.084-1.064 2.456-1.549 3.235C9.584 23.815 10.77 24.001 12.017 24.001c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Platform */}
            <div className="mt-8 sm:mt-0">
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 inter-semibold">Platform</h4>
              <ul className="space-y-1.5 sm:space-y-2">
                <li><Link to="/" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base inter-regular">Home</Link></li>
                <li><Link to="/teams" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base inter-regular">Discover Projects</Link></li>
                <li><Link to="/create-team" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base inter-regular">Start Building</Link></li>
                <li><Link to="/dashboard" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base inter-regular">Dashboard</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="mt-8 sm:mt-0">
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 inter-semibold">Resources</h4>
              <ul className="space-y-1.5 sm:space-y-2">
                <li><Link to="/faqs" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base inter-regular">Help Center</Link></li>
                <li><a href="mailto:hello@collabase.com" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base inter-regular">Contact Us</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base inter-regular">API Documentation</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base inter-regular">Community</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-slate-800 pt-6 sm:pt-8 mt-6 sm:mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-slate-400 text-xs sm:text-sm text-center sm:text-left inter-regular">
                © 2025 CollaBase. Crafted with ❤️ for creators everywhere.
              </div>
              <div className="flex flex-wrap justify-center sm:justify-end space-x-4 sm:space-x-6 text-xs sm:text-sm">
                <a href="#" className="text-slate-400 hover:text-white transition-colors inter-regular">Privacy Policy</a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors inter-regular">Terms of Service</a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors inter-regular">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Skills Modal */}
      {skillsModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 max-w-sm sm:max-w-md w-full max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-100 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 inter-bold">All Skills Required</h3>
                <button
                  onClick={() => setSkillsModal({ isOpen: false, skills: [], teamTitle: '' })}
                  className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center transition-colors"
                >
                  <span className="text-slate-600 text-base sm:text-lg">×</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed inter-regular">{skillsModal.teamTitle}</p>
            </div>
            
            {/* Modal Content */}
            <div className="p-4 sm:p-6 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {skillsModal.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium border border-purple-200 shadow-sm inter-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => setSkillsModal({ isOpen: false, skills: [], teamTitle: '' })}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 sm:py-3 px-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 inter-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;