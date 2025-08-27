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
      
      showToast(`Team "${formData.title}" created successfully! 🎉`, 'success');
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Team</h1>
        <p className="text-gray-600 mt-2">Start a new project and recruit talented teammates</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., AI-Powered Study Assistant"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Describe your project, its goals, and what you're trying to build..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Category and Team Size */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-2"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <p className="text-sm text-gray-500 mt-1">
              💡 Create a WhatsApp group for your team and paste the invite link here. Accepted members will get access to join.
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
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 px-6 rounded-md font-medium transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {loading ? 'Creating Team...' : 'Create Team'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/teams')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">💡 Tips for Creating a Great Team</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Write a clear, compelling project description that explains the problem you're solving</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Be specific about the skills you need - this helps attract the right teammates</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Add relevant tags to make your project discoverable</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Set realistic expectations about time commitment and project scope</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default CreateTeamPage;