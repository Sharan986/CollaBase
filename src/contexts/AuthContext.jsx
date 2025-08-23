import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false); // New state for profile loading

  // Enhanced signup function with user profile
  async function signup(email, password, userData) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send email verification
      await sendEmailVerification(result.user);
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        email: email,
        name: userData.name,
        year: userData.year,
        branch: userData.branch,
        skills: userData.skills || [],
        interests: userData.interests || [],
        role: 'student',
        createdAt: new Date(),
        emailVerified: false
      });
      
      console.log('User created with profile:', result.user.email);
      return result;
    } catch (error) {
      console.error('Signup error:', error.message);
      throw error;
    }
  }

  // Simple signup without profile (for initial account creation)
  async function createAccount(email, password) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(result.user);
      console.log('Account created:', result.user.email);
      return result;
    } catch (error) {
      console.error('Account creation error:', error.message);
      throw error;
    }
  }

  // Add profile to existing user
  async function addUserProfile(userData) {
    try {
      if (!currentUser) throw new Error('No user logged in');
      
      setProfileLoading(true);
      
      await setDoc(doc(db, 'users', currentUser.uid), {
        email: currentUser.email,
        name: userData.name,
        year: userData.year,
        branch: userData.branch,
        skills: userData.skills || [],
        interests: userData.interests || [],
        role: 'student',
        createdAt: new Date(),
        emailVerified: currentUser.emailVerified
      });
      
      // Refresh user profile
      const profile = await getUserProfile(currentUser.uid);
      setUserProfile(profile);
      setProfileLoading(false);
      
      console.log('Profile added for user:', currentUser.email);
    } catch (error) {
      console.error('Error adding profile:', error.message);
      setProfileLoading(false);
      throw error;
    }
  }

  // Login function
  async function login(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in:', result.user.email);
      return result;
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  }

  // Logout function
  async function logout() {
    try {
      await signOut(auth);
      console.log('User logged out');
    } catch (error) {
      console.error('Logout error:', error.message);
      throw error;
    }
  }

  // Get user profile from Firestore
  async function getUserProfile(uid) {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Listen for authentication state changes
  useEffect(() => {
    console.log('Setting up auth listener...');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('Auth state changed:', user.email);
        setCurrentUser(user);
        
        setProfileLoading(true);
        // Get user profile data from Firestore
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
        setProfileLoading(false);
        console.log('User profile loaded:', profile);
      } else {
        console.log('Auth state changed: No user');
        setCurrentUser(null);
        setUserProfile(null);
        setProfileLoading(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    profileLoading, // Add this to the context
    signup,
    createAccount,
    addUserProfile,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}