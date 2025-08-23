import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  arrayRemove,
  arrayUnion,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Create notification helper function
  const createNotification = async (userId, type, title, message, data = {}) => {
    try {
      const notification = {
        userId,
        type,
        title,
        message,
        data,
        read: false,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'notifications'), notification);
      console.log('Notification created:', title);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

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
      
      // Create welcome notification
      await createNotification(
        result.user.uid,
        'welcome',
        'Welcome to CollaBase! 🎉',
        'Start by browsing teams or creating your own project. Connect with fellow students and build amazing things together!'
      );
      
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
      
      // Create welcome notification
      await createNotification(
        currentUser.uid,
        'welcome',
        'Profile Setup Complete! 🎉',
        'Your profile is now ready. Start exploring teams and projects that match your skills!'
      );
      
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

  // Apply to join a team
  async function applyToTeam(teamId) {
    try {
      if (!currentUser || !userProfile) throw new Error('No user logged in');
      
      const teamRef = doc(db, 'teams', teamId);
      const teamDoc = await getDoc(teamRef);
      
      if (!teamDoc.exists()) {
        throw new Error('Team not found');
      }
      
      const teamData = teamDoc.data();
      const currentApplications = teamData.applications || [];
      
      // Check if user already applied
      if (currentApplications.includes(currentUser.uid)) {
        throw new Error('You have already applied to this team');
      }
      
      // Add user to applications array
      await updateDoc(teamRef, {
        applications: [...currentApplications, currentUser.uid]
      });

      // Create notification for team owner
      await createNotification(
        teamData.createdBy,
        'application_received',
        'New Team Application! 📝',
        `${userProfile.name} has applied to join your team "${teamData.title}". Review their profile and skills to make a decision.`,
        { teamId, teamTitle: teamData.title, applicantId: currentUser.uid, applicantName: userProfile.name }
      );

      // Create notification for applicant
      await createNotification(
        currentUser.uid,
        'application_sent',
        'Application Sent! ✅',
        `Your application to join "${teamData.title}" has been sent. The team lead will review your profile and get back to you soon.`,
        { teamId, teamTitle: teamData.title }
      );
      
      console.log('Applied to team successfully');
      return true;
    } catch (error) {
      console.error('Error applying to team:', error);
      throw error;
    }
  }

  // Get teams user has applied to
  async function getUserApplications() {
    try {
      if (!currentUser) return [];
      
      const teamsQuery = query(
        collection(db, 'teams'), 
        where('applications', 'array-contains', currentUser.uid)
      );
      const querySnapshot = await getDocs(teamsQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching user applications:', error);
      return [];
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
    profileLoading,
    signup,
    createAccount,
    addUserProfile,
    login,
    logout,
    applyToTeam,
    getUserApplications,
    createNotification
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}