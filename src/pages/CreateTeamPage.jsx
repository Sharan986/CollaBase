import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';

function CreateTeamPage() {
  const { currentUser, userProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    skillsNeeded: [],
    teamSize: 3,
    tags: [],
    requirements: '',
    whatsappLink: ''
  });
  
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentTag, setCurrentTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  const commonSkills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++',
    'HTML/CSS', 'TypeScript', 'Vue.js', 'Angular', 'Express.js',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'AWS',
    'React Native', 'Flutter', 'Swift', 'Kotlin',
    'Machine Learning', 'Data Analysis', 'TensorFlow', 'PyTorch',
    'UI/UX Design', 'Figma', 'Photoshop', 'Illustrator',
    'Game Development', 'Unity', 'Unreal Engine',
    'DevOps', 'Docker', 'Kubernetes', 'Git'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skillsNeeded.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skillsNeeded: [...prev.skillsNeeded, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skillsNeeded: prev.skillsNeeded.filter(skill => skill !== skillToRemove)
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim().toLowerCase()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser || !userProfile) {
      setMessage('Please log in to create a team');
      return;
    }

    if (!formData.title || !formData.description || !formData.category) {
      setMessage('Please fill in all required fields');
      return;
    }

    if (formData.skillsNeeded.length === 0) {
      setMessage('Please add at least one skill requirement');
      return;
    }

    setLoading(true);
    try {
      const teamData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        skillsNeeded: formData.skillsNeeded,
        teamSize: parseInt(formData.teamSize),
        currentMembers: 1,
        tags: formData.tags,
        requirements: formData.requirements,
        whatsappLink: formData.whatsappLink,
        status: 'recruiting',
        createdBy: currentUser.uid,
        createdAt: new Date(),
        members: [
          {
            userId: currentUser.uid,
            name: userProfile.name,
            role: 'Team Lead',
            skills: userProfile.skills || [],
            joinedAt: new Date()
          }
        ],
        applications: []
      };

      const docRef = await addDoc(collection(db, 'teams'), teamData);
      console.log('Team created with ID:', docRef.id);
      
      showToast(`Team "${formData.title}" created successfully!`, 'success');
      setTimeout(() => {
        navigate('/teams');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating team:', error);
      showToast('Error creating team. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-24">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Modern Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl shadow-2xl mb-6">
            <span className="text-3xl"></span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-slate-800 via-green-800 to-emerald-900 bg-clip-text text-transparent leading-tight inter-bold">
            Create New Team
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto mt-4 leading-relaxed inter-regular">
            Start an amazing project and recruit talented teammates to bring your vision to life
          </p>
        </div>

        {/* Modern Form */}
        <div className="bg-white/70 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-8 lg:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide inter-semibold">
              Project Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., AI-Powered Study Assistant"
              className="w-full p-4 bg-white/50 border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-200 text-slate-800 placeholder-slate-400"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide inter-semibold">
              Project Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Describe your project, its goals, and what you're trying to build..."
              className="w-full p-4 bg-white/50 border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-200 text-slate-800 placeholder-slate-400 resize-none"
              required
            />
            <p className="text-xs text-slate-500 mt-1 inter-regular">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Category and Team Size */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide inter-semibold">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 inter-medium">
                Team Size (including you) *
              </label>
              <select
                name="teamSize"
                value={formData.teamSize}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {[2, 3, 4, 5, 6, 7, 8].map(size => (
                  <option key={size} value={size}>{size} members</option>
                ))}
              </select>
            </div>
          </div>

          {/* Skills Needed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 inter-medium">
              Skills Needed *
            </label>
            <div className="flex gap-2 mb-3">
              <select
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a skill</option>
                {commonSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                placeholder="Or type a custom skill"
                className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
            </div>

            {formData.skillsNeeded.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.skillsNeeded.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-2 inter-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 inter-medium">
              Tags (optional)
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="e.g., hackathon, startup, assignment"
                className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Add Tag
              </button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Additional Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 inter-medium">
              Additional Requirements (optional)
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any specific requirements, time commitments, or expectations for team members..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* WhatsApp Group Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 inter-medium">
              WhatsApp Group Link (optional)
            </label>
            <input
              type="url"
              name="whatsappLink"
              value={formData.whatsappLink}
              onChange={handleInputChange}
              placeholder="https://chat.whatsapp.com/..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1 inter-regular">
              Create a WhatsApp group for your team and paste the invite link here. Accepted members will get access to join.
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-md text-sm ${
              message.includes('Error') || message.includes('Please')
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-4 px-8 rounded-2xl font-semibold transition-all duration-200 shadow-lg inter-semibold ${
                loading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-105'
              } text-white`}
            >
              {loading ? 'Creating Team...' : 'Create Amazing Team'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/teams')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 inter-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4 inter-medium">Tips for Creating a Great Team</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span className="inter-regular">Write a clear, compelling project description that explains the problem you're solving</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span className="inter-regular">Be specific about the skills you need - this helps attract the right teammates</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span className="inter-regular">Add relevant tags to make your project discoverable</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span className="inter-regular">Set realistic expectations about time commitment and project scope</span>
          </li>
        </ul>
      </div>
    </div>
    </div>
  );
}

export default CreateTeamPage;