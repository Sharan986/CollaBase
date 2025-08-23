import React, { useState } from 'react';

function ProfileSetup({ onProfileComplete }) {
  const [formData, setFormData] = useState({
    name: '',
    year: '',
    branch: '',
    skills: '',
    interests: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert comma-separated strings to arrays
    const profileData = {
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
      interests: formData.interests.split(',').map(s => s.trim()).filter(s => s)
    };
    
    onProfileComplete(profileData);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h3 className="text-xl font-bold mb-4">Complete Your Profile</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        
        <select
          name="year"
          value={formData.year}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Select Year</option>
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>
          <option value="3rd Year">3rd Year</option>
          <option value="4th Year">4th Year</option>
        </select>
        
        <input
          type="text"
          name="branch"
          placeholder="Branch (e.g., Computer Science)"
          value={formData.branch}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        
        <input
          type="text"
          name="skills"
          placeholder="Skills (comma separated: React, Python, Design)"
          value={formData.skills}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        
        <input
          type="text"
          name="interests"
          placeholder="Interests (comma separated: Web Dev, AI, Gaming)"
          value={formData.interests}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Complete Profile
        </button>
      </form>
    </div>
  );
}

export default ProfileSetup;