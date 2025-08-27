import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const ApplicationContext = createContext();

export function useApplications() {
  return useContext(ApplicationContext);
}

export function ApplicationProvider({ children }) {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listen for real-time updates on user's applications
  useEffect(() => {
    if (!currentUser) {
      setApplications([]);
      setLoading(false);
      return;
    }

    console.log('Setting up applications listener for user:', currentUser.uid);

    // Query teams where user has applied
    const q = query(
      collection(db, 'teams'),
      where('applications', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userApplications = [];

      snapshot.docs.forEach(doc => {
        const teamData = doc.data();
        
        // Check if user is in applications array
        if (teamData.applications.includes(currentUser.uid)) {
          let status = 'pending';
          
          // Check if user was accepted (moved to members)
          if (teamData.members && teamData.members.includes(currentUser.uid)) {
            status = 'accepted';
          }
          // Check if user was rejected (removed from applications but not in members)
          else if (!teamData.applications.includes(currentUser.uid)) {
            status = 'rejected';
          }

          userApplications.push({
            id: doc.id,
            teamName: teamData.name,
            teamDescription: teamData.description,
            status: status,
            appliedAt: teamData.appliedAt || teamData.createdAt,
            teamCreator: teamData.createdBy
          });
        }
      });

      setApplications(userApplications);
      setLoading(false);
      console.log('Applications updated:', userApplications.length);
    }, (error) => {
      console.error('Error listening to applications:', error);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up applications listener');
      unsubscribe();
    };
  }, [currentUser]);

  // Mark application status update as seen
  const markApplicationSeen = async (applicationId) => {
    try {
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, seen: true }
            : app
        )
      );
    } catch (error) {
      console.error('Error marking application as seen:', error);
    }
  };

  const value = {
    applications,
    loading,
    markApplicationSeen
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
}
