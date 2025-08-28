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
        console.log('Fetching teams from Firestore...');
        const querySnapshot = await getDocs(collection(db, 'teams'));
        const teams = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Fetched teams for landing page:', teams.length, teams);
        // Take only first 6 teams for featured section
        setFeaturedTeams(teams.slice(0, 6));
      } catch (error) {
        console.error('Error fetching featured teams:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedTeams();
  }, []);

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex w-full min-h-screen items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Text Content Section */}
        <div className="flex-1 space-y-8">
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-900 bg-clip-text text-transparent leading-tight">
              ARKA JAIN<br /> 
              <span className="text-4xl sm:text-5xl lg:text-6xl">University</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl">
              One of the leading state private Universities in the Eastern region of the country and the first state private University in the entire Kolhan Region comprising of the three districts of East Singhbhum, West Singhbhum and Saraikela-Kharsawan.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/teams">
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl">
                Explore Projects
              </button>
            </Link>
            <Link to="/create-team">
              <button className="border-2 border-slate-800 hover:bg-slate-800 hover:text-white text-slate-800 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                Create Team
              </button>
            </Link>
          </div>
        </div>

        {/* Logo Section with Modern Design */}
        <div className="flex-1 relative flex justify-center items-center">
          <div className="relative">
            {/* Glassmorphism background */}
            <div className="absolute inset-0 bg-white/20 backdrop-blur-lg rounded-full w-80 h-80 shadow-2xl border border-white/30"></div>
            
            {/* Logo */}
            <img
              src="https://imgs.search.brave.com/Sqt6wGi3r4ptes3Qw92U8B7mSyOHgNIW2t1vjbv4WYM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hcmth/amFpbnVuaXZlcnNp/dHkuYWMuaW4vd3At/Y29udGVudC91cGxv/YWRzLzIwMTgvMDgv/TG9nby5qcGc"
              alt="ARKA JAIN University Logo"
              className="relative z-10 w-72 h-72 rounded-full object-cover shadow-2xl transition-all duration-500 hover:scale-110"
              style={{
                filter: 'drop-shadow(0 25px 25px rgba(0, 0, 0, 0.15))',
              }}
            />
            
            {/* Animated rings */}
            <div className="absolute inset-0 w-80 h-80 rounded-full border-2 border-blue-300/30 animate-ping"></div>
            <div className="absolute inset-4 w-72 h-72 rounded-full border border-indigo-300/50 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl shadow-xl mb-6">
              <span className="text-2xl">🚀</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-slate-800 via-emerald-800 to-blue-900 bg-clip-text text-transparent mb-4">
              Featured Projects
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Discover amazing projects created by our talented community of students and innovators
            </p>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white/70 backdrop-blur-lg rounded-3xl overflow-hidden shadow-2xl border border-white/50 animate-pulse"
                >
                  <div className="w-full h-64 bg-slate-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : featuredTeams.length === 0 ? (
              // No teams message
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Teams Yet</h3>
                <p className="text-slate-600">Be the first to create an amazing project!</p>
              </div>
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
                          {team.category === 'Web App' && '🌐'}
                          {team.category === 'Mobile App' && '📱'}
                          {team.category === 'AI/ML' && '🤖'}
                          {team.category === 'Data Science' && '📊'}
                          {team.category === 'Gaming' && '🎮'}
                          {team.category === 'IoT' && '📡'}
                          {team.category === 'Blockchain' && '⛓️'}
                          {(!team.category || !['Web App', 'Mobile App', 'AI/ML', 'Data Science', 'Gaming', 'IoT', 'Blockchain'].includes(team.category)) && '🚀'}
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
              <button className="group bg-white/70 backdrop-blur-lg border border-white/50 hover:bg-white/90 text-slate-800 px-10 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl">
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
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-20 bg-white/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-xl mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-slate-800 via-purple-800 to-pink-900 bg-clip-text text-transparent mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Quick answers to help you get started with CollaBase
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4 mb-12">
            {[
              {
                id: 1,
                question: "What is CollaBase?",
                answer: "CollaBase is a collaborative platform for ARKA JAIN University students to form teams, work on projects, and participate in competitions like Smart India Hackathon (SIH)."
              },
              {
                id: 2,
                question: "How do I join a team?",
                answer: "Browse available teams in the 'Projects' section, find one that matches your skills and interests, then click 'Apply to Join' to submit your application."
              },
              {
                id: 3,
                question: "Can I create my own team?",
                answer: "Yes! Navigate to the 'SIH' section or click 'Create Team' to start your own project. Fill in the details about your project and the skills you need."
              },
              {
                id: 4,
                question: "What information do I need for my profile?",
                answer: "Complete your profile with your name, year, branch, technical skills, and interests. This helps team leaders understand your capabilities."
              },
              {
                id: 5,
                question: "Is CollaBase free to use?",
                answer: "Yes, CollaBase is completely free for all ARKA JAIN University students. Simply sign up with your college email to get started."
              }
            ].map((faq) => (
              <div
                key={faq.id}
                className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/50 transition-all duration-200"
                >
                  <h3 className="text-lg font-semibold text-slate-800 pr-4">
                    {faq.question}
                  </h3>
                  <svg
                    className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${
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
                  <div className="px-6 pb-4 border-t border-white/20">
                    <div className="pt-4">
                      <p className="text-slate-600 leading-relaxed">
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
              <button className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">CollaBase</h3>
              </div>
              <p className="text-slate-300 mb-6 max-w-md leading-relaxed">
                Empowering ARKA JAIN University students to collaborate, innovate, and build amazing projects together. Join the community of creators and problem solvers.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-slate-300 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/teams" className="text-slate-300 hover:text-white transition-colors">Browse Projects</Link></li>
                <li><Link to="/create-team" className="text-slate-300 hover:text-white transition-colors">Create Team</Link></li>
                <li><Link to="/dashboard" className="text-slate-300 hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/faqs" className="text-slate-300 hover:text-white transition-colors">FAQs</Link></li>
                <li><a href="mailto:support@arkajainuniversity.ac.in" className="text-slate-300 hover:text-white transition-colors">Contact Support</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">User Guide</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-slate-800 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-slate-400 text-sm mb-4 md:mb-0">
                © 2025 CollaBase - ARKA JAIN University. All rights reserved.
              </div>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Skills Modal */}
      {skillsModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">All Skills Required</h3>
                <button
                  onClick={() => setSkillsModal({ isOpen: false, skills: [], teamTitle: '' })}
                  className="w-8 h-8 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center transition-colors"
                >
                  <span className="text-slate-600 text-lg">×</span>
                </button>
              </div>
              <p className="text-sm text-slate-600 mt-2">{skillsModal.teamTitle}</p>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="flex flex-wrap gap-3">
                {skillsModal.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 text-sm px-4 py-2 rounded-full font-medium border border-purple-200 shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => setSkillsModal({ isOpen: false, skills: [], teamTitle: '' })}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200"
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