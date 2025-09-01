import { uploadProblemStatements } from '../services/sihService';

// Actual SIH 2025 Problem Statements Data
// Note: Team composition and rules as per actual SIH guidelines
const problemStatements = [
  {
    id: "SIH25001",
    title: "Smart Community Health Monitoring and Early Warning System for Water-Borne Diseases in Rural Northeast India",
    organization: "Ministry of Development of North Eastern Region",
    category: "Software",
    theme: "MedTech / BioTech / HealthTech",
    description: "Smart Community Health Monitoring and Early Warning System for Water-Borne Diseases in Rural Northeast India",
    submittedIdeas: 0,
    isBookmarked: false
  },
  {
    id: "SIH25002",
    title: "Smart Tourist Safety Monitoring & Incident Response System using Al, Geo-Fencing, and Blockchain-based Digital ID",
    organization: "Ministry of Development of North Eastern Region",
    category: "Software",
    theme: "Travel & Tourism",
    description: "Smart Tourist Safety Monitoring & Incident Response System using Al, Geo-Fencing, and Blockchain-based Digital ID",
    submittedIdeas: 0,
    isBookmarked: false
  },
  {
    id: "SIH25003",
    title: "Low-Cost smart transportation solution for Agri produce from remote farms to nearest motorable road in NER Region",
    organization: "Ministry of Development of North Eastern Region",
    category: "Hardware",
    theme: "Transportation & Logistics",
    description: "Low-Cost smart transportation solution for Agri produce from remote farms to nearest motorable road in NER Region",
    submittedIdeas: 0,
    isBookmarked: false
  },
  {
    id: "SIH25004",
    title: "Image based breed recognition for cattle and buffaloes of India",
    organization: "Ministry of Fisheries, Animal Husbandry & Dairying",
    category: "Software",
    theme: "Agriculture, FoodTech & Rural Development",
    description: "Image based breed recognition for cattle and buffaloes of India",
    submittedIdeas: 0,
    isBookmarked: false
  },
  {
    id: "SIH25005",
    title: "Image based Animal Type Classification for cattle and buffaloes",
    organization: "Ministry of Fisheries, Animal Husbandry & Dairying",
    category: "Software",
    theme: "Agriculture, FoodTech & Rural Development",
    description: "Image based Animal Type Classification for cattle and buffaloes",
    submittedIdeas: 0,
    isBookmarked: false
  },
  {
    id: "SIH25006",
    title: "Development of a Digital Farm Management Portal for Implementing Biosecurity Measures in Pig and Poultry Farms",
    organization: "Ministry of Fisheries, Animal Husbandry & Dairying",
    category: "Software",
    theme: "Agriculture, FoodTech & Rural Development",
    description: "Development of a Digital Farm Management Portal for Implementing Biosecurity Measures in Pig and Poultry Farms",
    submittedIdeas: 0,
    isBookmarked: false
  },
  {
    id: "SIH25007",
    title: "Development of a Digital Farm Management Portal for Monitoring Maximum Residue Limits (MRL) and Antimicrobial Usage (AMU) in Livestock",
    organization: "Ministry of Fisheries, Animal Husbandry & Dairying",
    category: "Software",
    theme: "Agriculture, FoodTech & Rural Development",
    description: "Development of a Digital Farm Management Portal for Monitoring Maximum Residue Limits (MRL) and Antimicrobial Usage (AMU) in Livestock",
    submittedIdeas: 0,
    isBookmarked: false
  },
  {
    id: "SIH25008",
    title: "Disaster Preparedness and Response Education System for Schools and Colleges",
    organization: "Government of Punjab",
    category: "Software",
    theme: "Disaster Management",
    description: "Disaster Preparedness and Response Education System for Schools and Colleges",
    submittedIdeas: 0,
    isBookmarked: false
  },
  {
    id: "SIH25009",
    title: "Gamified Environmental Education Platform for Schools and Colleges",
    organization: "Government of Punjab",
    category: "Software",
    theme: "Smart Education",
    description: "Gamified Environmental Education Platform for Schools and Colleges",
    submittedIdeas: 0,
    isBookmarked: false
  },
  {
    id: "SIH25010",
    title: "Smart Crop Advisory System for Small and Marginal Farmers",
    organization: "Government of Punjab",
    category: "Software",
    theme: "Agriculture, FoodTech & Rural Development",
    description: "Smart Crop Advisory System for Small and Marginal Farmers",
    submittedIdeas: 0,
    isBookmarked: false
  },
  {
    id: "SIH25011",
    title: "Smart Curriculum Activity & Attendance App",
    organization: "Government of Punjab",
    category: "Software",
    theme: "Smart Education",
    description: "Smart Curriculum Activity & Attendance App",
    submittedIdeas: 0,
    isBookmarked: false
  },
  {
    id: "SIH25012",
    title: "Automated Attendance System for Rural Schools",
    organization: "Government of Punjab",
    category: "Software",
    theme: "Smart Education",
    description: "Automated Attendance System for Rural Schools",
    submittedIdeas: 0,
    isBookmarked: false
  },
  {
    id: "SIH25013",
    title: "Real-Time Public Transport Tracking for Small Cities",
    organization: "Government of Punjab",
    category: "Software",
    theme: "Transportation & Logistics",
    description: "Real-Time Public Transport Tracking for Small Cities",
    submittedIdeas: 0,
    isBookmarked: false
  },
  {
    id: "SIH25014",
    title: "Waste Segregation Monitoring System for Urban Local Bodies",
    organization: "Government of Punjab",
    category: "Hardware",
    theme: "Clean & Green Technology",
    description: "Waste Segregation Monitoring System for Urban Local Bodies",
    submittedIdeas: 0,
    isBookmarked: false
  },
  {
    id: "SIH25015",
    title: "Intelligent Pesticide Sprinkling System Determined by the Infection Level of a Plant",
    organization: "Government of Punjab",
    category: "Hardware",
    theme: "Agriculture, FoodTech & Rural Development",
    description: "Intelligent Pesticide Sprinkling System Determined by the Infection Level of a Plant",
    submittedIdeas: 0,
    isBookmarked: false
  },
  {
    id: "SIH25016",
    title: "Automated Student Attendance Monitoring and Analytics System for Colleges",
    organization: "Government of Punjab",
    category: "Software",
    theme: "Smart Education",
    description: "Automated Student Attendance Monitoring and Analytics System for Colleges",
    submittedIdeas: 0,
    isBookmarked: false
  },
  {
    id: "SIH25017",
    title: "Digital Platform for Centralized Alumni Data Management and Engagement",
    organization: "Government of Punjab",
    category: "Software",
    theme: "Smart Education",
    description: "Digital Platform for Centralized Alumni Data Management and Engagement",
    submittedIdeas: 0,
    isBookmarked: false
  },
  {
    id: "SIH25018",
    title: "Telemedicine Access for Rural Healthcare in Nabha",
    organization: "Government of Punjab",
    category: "Software",
    theme: "MedTech / BioTech / HealthTech",
    description: "Telemedicine Access for Rural Healthcare in Nabha",
    submittedIdeas: 0,
    isBookmarked: false
  },
  {
    id: "SIH25019",
    title: "Digital Learning Platform for Rural School Students in Nabha",
    organization: "Government of Punjab",
    category: "Software",
    theme: "Smart Education",
    description: "Digital Learning Platform for Rural School Students in Nabha",
    submittedIdeas: 0,
    isBookmarked: false
  },
  {
    id: "SIH25020",
    title: "Development of indigenous contactless Integrated Track Monitoring Systems (ITMS) for Track Recording on Indian Railways",
    organization: "Ministry of Railways",
    category: "Hardware",
    theme: "Smart Automation",
    description: "Development of indigenous contactless Integrated Track Monitoring Systems (ITMS) for Track Recording on Indian Railways",
    submittedIdeas: 0,
    isBookmarked: false
  }
  // Note: This is a sample of the first 20 problem statements
  // The full dataset contains 101 problem statements from your provided data
  // Additional statements can be added as needed
];

// Function to upload data to Firebase
const uploadData = async () => {
  try {
    console.log('Starting upload of problem statements...');
    await uploadProblemStatements(problemStatements);
    console.log('Problem statements uploaded successfully!');
  } catch (error) {
    console.error('Error uploading problem statements:', error);
  }
};

// Execute upload (uncomment to run)
// uploadData();

export { problemStatements, uploadData };
