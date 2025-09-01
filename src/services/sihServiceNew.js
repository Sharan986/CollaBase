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
import { db } from '../firebase/firebase';

const COLLECTION_NAME = 'sihProblemStatements';

// Fetch all problem statements from Firebase
export const fetchProblemStatements = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTION_NAME), orderBy('sNo'))
    );
    
    const problems = [];
    querySnapshot.forEach((doc) => {
      problems.push({
        firebaseId: doc.id,
        ...doc.data()
      });
    });

    console.log(`✅ Fetched ${problems.length} problem statements from Firebase`);
    return { success: true, data: problems };
  } catch (error) {
    console.error('❌ Error fetching problem statements:', error);
    return { success: false, error: error.message };
  }
};

// Upload problem statements to Firebase (manual upload)
export const uploadProblemStatements = async (problemStatements) => {
  try {
    const batch = writeBatch(db);
    const collectionRef = collection(db, COLLECTION_NAME);

    problemStatements.forEach((problem) => {
      const docRef = doc(collectionRef);
      batch.set(docRef, {
        ...problem,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    await batch.commit();
    console.log(`✅ Uploaded ${problemStatements.length} problem statements to Firebase`);
    return { success: true, message: `${problemStatements.length} problem statements uploaded successfully` };
  } catch (error) {
    console.error('❌ Error uploading problem statements:', error);
    return { success: false, error: error.message };
  }
};

// Get unique categories
export const getCategories = async () => {
  try {
    const result = await fetchProblemStatements();
    if (result.success) {
      const categories = [...new Set(result.data.map(ps => ps.category))];
      return { success: true, data: categories };
    }
    return { success: false, error: 'Failed to fetch problem statements' };
  } catch (error) {
    console.error('❌ Error getting categories:', error);
    return { success: false, error: error.message };
  }
};

// Get unique themes
export const getThemes = async () => {
  try {
    const result = await fetchProblemStatements();
    if (result.success) {
      const themes = [...new Set(result.data.map(ps => ps.theme))];
      return { success: true, data: themes };
    }
    return { success: false, error: 'Failed to fetch problem statements' };
  } catch (error) {
    console.error('❌ Error getting themes:', error);
    return { success: false, error: error.message };
  }
};

// Search problem statements
export const searchProblemStatements = async (searchTerm) => {
  try {
    const result = await fetchProblemStatements();
    if (result.success) {
      const filtered = result.data.filter(ps => 
        ps.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ps.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ps.psNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ps.theme.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return { success: true, data: filtered };
    }
    return { success: false, error: 'Failed to fetch problem statements' };
  } catch (error) {
    console.error('❌ Error searching problem statements:', error);
    return { success: false, error: error.message };
  }
};

// Filter by category
export const filterByCategory = async (category) => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTION_NAME), where('category', '==', category), orderBy('sNo'))
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
    console.error('❌ Error filtering by category:', error);
    return { success: false, error: error.message };
  }
};

// Filter by theme
export const filterByTheme = async (theme) => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTION_NAME), where('theme', '==', theme), orderBy('sNo'))
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
    console.error('❌ Error filtering by theme:', error);
    return { success: false, error: error.message };
  }
};

// Bookmark/Unbookmark a problem statement
export const toggleBookmark = async (firebaseId, isBookmarked) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, firebaseId);
    await updateDoc(docRef, {
      isBookmarked: !isBookmarked,
      updatedAt: new Date()
    });
    
    console.log(`✅ Problem statement ${isBookmarked ? 'unbookmarked' : 'bookmarked'}`);
    return { success: true, message: `Problem statement ${isBookmarked ? 'unbookmarked' : 'bookmarked'}` };
  } catch (error) {
    console.error('❌ Error toggling bookmark:', error);
    return { success: false, error: error.message };
  }
};

// Get bookmarked problem statements
export const getBookmarkedProblems = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, COLLECTION_NAME), where('isBookmarked', '==', true), orderBy('sNo'))
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
    console.error('❌ Error getting bookmarked problems:', error);
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

// Get collection stats
export const getCollectionStats = async () => {
  try {
    const result = await fetchProblemStatements();
    if (result.success) {
      const problems = result.data;
      const stats = {
        total: problems.length,
        software: problems.filter(p => p.category === 'Software').length,
        hardware: problems.filter(p => p.category === 'Hardware').length,
        bookmarked: problems.filter(p => p.isBookmarked).length,
        themes: [...new Set(problems.map(p => p.theme))].length
      };
      return { success: true, data: stats };
    }
    return { success: false, error: 'Failed to fetch problem statements' };
  } catch (error) {
    console.error('❌ Error getting stats:', error);
    return { success: false, error: error.message };
  }
};
