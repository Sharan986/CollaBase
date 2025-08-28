// List of common college email domains
const collegeEmailDomains = [
  // 'edu',
  // 'ac.in',
  // 'student.ac.in',
  // 'stu.ac.in',
  // 'edu.in'
  'aju.ac.in'
];

export function isCollegeEmail(email) {
  const domain = email.split('@')[1];
  if (!domain) return false;
  
  // Check if it's a college email
  return collegeEmailDomains.some(collegeDomain => 
    domain.endsWith(collegeDomain) 
    // || 
    // domain.includes('.edu') ||
    // domain.includes('university') ||
    // domain.includes('college')
  );
}

// For testing purposes, let's be less strict for now
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}