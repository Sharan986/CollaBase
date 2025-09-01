import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '../firebase/firebase.js';

const COLLECTION_NAME = 'sihProblemStatements';

// SIH Problem Statements Data
const problemStatementsData = [
  {
    id: 1,
    organization: "Ministry of Development of North Eastern Region",
    title: "Smart Community Health Monitoring and Early Warning System for Water-Borne Diseases in Rural Northeast India",
    category: "Software",
    psNumber: "SIH25001",
    submittedIdeas: 0,
    theme: "MedTech / BioTech / HealthTech"
  },
  {
    id: 2,
    organization: "Ministry of Development of North Eastern Region",
    title: "Smart Tourist Safety Monitoring & Incident Response System using AI, Geo-Fencing, and Blockchain-based Digital ID",
    category: "Software",
    psNumber: "SIH25002",
    submittedIdeas: 0,
    theme: "Travel & Tourism"
  },
  {
    id: 3,
    organization: "Ministry of Development of North Eastern Region",
    title: "Low-Cost smart transportation solution for Agri produce from remote farms to nearest motorable road in NER Region",
    category: "Hardware",
    psNumber: "SIH25003",
    submittedIdeas: 0,
    theme: "Transportation & Logistics"
  },
  {
    id: 4,
    organization: "Ministry of Fisheries, Animal Husbandry & Dairying",
    title: "Image based breed recognition for cattle and buffaloes of India",
    category: "Software",
    psNumber: "SIH25004",
    submittedIdeas: 0,
    theme: "Agriculture, FoodTech & Rural Development"
  },
  {
    id: 5,
    organization: "Ministry of Fisheries, Animal Husbandry & Dairying",
    title: "AI enabled livestock monitoring using computer vision technology",
    category: "Software",
    psNumber: "SIH25005",
    submittedIdeas: 0,
    theme: "Agriculture, FoodTech & Rural Development"
  },
  {
    id: 6,
    organization: "Ministry of Fisheries, Animal Husbandry & Dairying",
    title: "AI based Disease Prediction for Livestock and Companion Animals",
    category: "Software",
    psNumber: "SIH25006",
    submittedIdeas: 0,
    theme: "MedTech / BioTech / HealthTech"
  },
  {
    id: 7,
    organization: "Ministry of Fisheries, Animal Husbandry & Dairying",
    title: "Intelligent Feed Formulation for Aquaculture",
    category: "Software",
    psNumber: "SIH25007",
    submittedIdeas: 0,
    theme: "Agriculture, FoodTech & Rural Development"
  },
  {
    id: 8,
    organization: "Ministry of Fisheries, Animal Husbandry & Dairying",
    title: "Smart Fish Farming Solution",
    category: "Hardware",
    psNumber: "SIH25008",
    submittedIdeas: 0,
    theme: "Agriculture, FoodTech & Rural Development"
  },
  {
    id: 9,
    organization: "Ministry of Education",
    title: "AI-powered personalized learning platform for students with learning disabilities",
    category: "Software",
    psNumber: "SIH25009",
    submittedIdeas: 0,
    theme: "Smart Education"
  },
  {
    id: 10,
    organization: "Ministry of Education",
    title: "Virtual Reality based immersive learning experiences for historical and cultural education",
    category: "Software",
    psNumber: "SIH25010",
    submittedIdeas: 0,
    theme: "Smart Education"
  }
];

// Upload problem statements to Firebase (accepts data as parameter)
export const uploadProblemStatements = async (dataToUpload = null, clearFirst = false) => {
  try {
    const collectionRef = collection(db, COLLECTION_NAME);
    
    // Clear existing data if requested
    if (clearFirst) {
      console.log('🧹 Clearing existing data...');
      const querySnapshot = await getDocs(collectionRef);
      const deletePromises = [];
      
      querySnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      
      await Promise.all(deletePromises);
      console.log(`🗑️ Deleted ${deletePromises.length} existing documents`);
    }
    
    const batch = writeBatch(db);
    
    // Use provided data or fallback to hardcoded data
    const data = dataToUpload || problemStatementsData;

    data.forEach((problem) => {
      const docRef = doc(collectionRef);
      batch.set(docRef, {
        ...problem,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    await batch.commit();
    console.log(`✅ ${data.length} problem statements uploaded successfully`);
    return { success: true, message: `${data.length} problem statements uploaded successfully` };
  } catch (error) {
    console.error('❌ Error uploading problem statements:', error);
    return { success: false, error: error.message };
  }
};

// Check if collection is empty
export const isCollectionEmpty = async () => {
  try {
    const querySnapshot = await getDocs(query(collection(db, COLLECTION_NAME), limit(1)));
    return querySnapshot.empty;
  } catch (error) {
    console.error('❌ Error checking collection:', error);
    return true; // Assume empty on error
  }
};

// Fetch all problem statements
export const fetchProblemStatements = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTION_NAME), orderBy('psNumber'))
    );
    
    const problems = [];
    querySnapshot.forEach((doc) => {
      problems.push({
        firebaseId: doc.id,
        ...doc.data()
      });
    });

    return { success: true, data: problems };
  } catch (error) {
    console.error('❌ Error fetching problem statements:', error);
    return { success: false, error: error.message };
  }
};

// Fetch problem statements by category
export const fetchProblemsByCategory = async (category) => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTION_NAME),
        where('category', '==', category),
        orderBy('psNumber')
      )
    );
    
    const problems = [];
    querySnapshot.forEach((doc) => {
      problems.push({
        firebaseId: doc.id,
        ...doc.data()
      });
    });

    return { success: true, data: problems };
  } catch (error) {
    console.error('❌ Error fetching problems by category:', error);
    return { success: false, error: error.message };
  }
};

// Fetch problem statements by theme
export const fetchProblemsByTheme = async (theme) => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, COLLECTION_NAME),
        where('theme', '==', theme),
        orderBy('psNumber')
      )
    );
    
    const problems = [];
    querySnapshot.forEach((doc) => {
      problems.push({
        firebaseId: doc.id,
        ...doc.data()
      });
    });

    return { success: true, data: problems };
  } catch (error) {
    console.error('❌ Error fetching problems by theme:', error);
    return { success: false, error: error.message };
  }
};

// Search problem statements
export const searchProblemStatements = async (searchTerm) => {
  try {
    // Note: Firestore doesn't support full-text search natively
    // For now, we'll fetch all and filter client-side
    // For production, consider using Algolia or similar service
    const result = await fetchProblemStatements();
    
    if (result.success) {
      const filteredProblems = result.data.filter(problem =>
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.psNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.theme.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      return { success: true, data: filteredProblems };
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error searching problem statements:', error);
    return { success: false, error: error.message };
  }
};

// Update submitted ideas count
export const updateSubmittedIdeas = async (firebaseId, count) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, firebaseId);
    await updateDoc(docRef, {
      submittedIdeas: count,
      updatedAt: new Date()
    });

    return { success: true, message: 'Submitted ideas count updated' };
  } catch (error) {
    console.error('❌ Error updating submitted ideas:', error);
    return { success: false, error: error.message };
  }
};

// Get unique categories
export const getCategories = async () => {
  try {
    const result = await fetchProblemStatements();
    if (result.success) {
      const categories = [...new Set(result.data.map(problem => problem.category))];
      return { success: true, data: categories.sort() };
    }
    return result;
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    return { success: false, error: error.message };
  }
};

// Get unique themes
export const getThemes = async () => {
  try {
    const result = await fetchProblemStatements();
    if (result.success) {
      const themes = [...new Set(result.data.map(problem => problem.theme))];
      return { success: true, data: themes.sort() };
    }
    return result;
  } catch (error) {
    console.error('❌ Error fetching themes:', error);
    return { success: false, error: error.message };
  }
};

// Add a new problem statement (admin function)
export const addProblemStatement = async (problemData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...problemData,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return { success: true, id: docRef.id, message: 'Problem statement added successfully' };
  } catch (error) {
    console.error('❌ Error adding problem statement:', error);
    return { success: false, error: error.message };
  }
};

// Delete a problem statement (admin function)
export const deleteProblemStatement = async (firebaseId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, firebaseId));
    return { success: true, message: 'Problem statement deleted successfully' };
  } catch (error) {
    console.error('❌ Error deleting problem statement:', error);
    return { success: false, error: error.message };
  }
};
