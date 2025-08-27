import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const DashboardNotificationContext = createContext();

export function useDashboardNotifications() {
  return useContext(DashboardNotificationContext);
}

export function DashboardNotificationProvider({ children }) {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listen for dashboard notifications in real-time
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    console.log('Setting up dashboard notifications listener for user:', currentUser.uid);

    const q = query(
      collection(db, 'dashboardNotifications'),
      where('userId', '==', currentUser.uid),
      where('dismissed', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      setNotifications(notificationList);
      setLoading(false);
      console.log('Dashboard notifications updated:', notificationList.length);
    }, (error) => {
      console.error('Error listening to dashboard notifications:', error);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up dashboard notifications listener');
      unsubscribe();
    };
  }, [currentUser]);

  // Clean up old notifications on mount
  useEffect(() => {
    if (currentUser) {
      cleanupOldNotifications();
    }
  }, [currentUser]);

  // Dismiss a notification
  const dismissNotification = async (notificationId) => {
    try {
      await deleteDoc(doc(db, 'dashboardNotifications', notificationId));
      console.log('Notification dismissed and deleted:', notificationId);
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  // Clean up old notifications (older than 30 days)
  const cleanupOldNotifications = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const q = query(
        collection(db, 'dashboardNotifications'),
        where('userId', '==', currentUser.uid)
      );

      const snapshot = await getDocs(q);
      const deletePromises = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        
        if (createdAt < thirtyDaysAgo) {
          deletePromises.push(deleteDoc(doc.ref));
        }
      });

      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
        console.log(`Cleaned up ${deletePromises.length} old notifications`);
      }
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
    }
  };

  // Create a dashboard notification (prevents duplicates)
  const createDashboardNotification = async (userId, type, teamId, teamName, message) => {
    try {
      // Use a composite ID to prevent duplicates
      const notificationId = `${userId}_${teamId}_${type}`;
      
      // Check if notification already exists
      const existingNotification = notifications.find(n => n.id === notificationId);
      if (existingNotification) {
        console.log('Notification already exists, skipping creation:', notificationId);
        return;
      }

      const notificationData = {
        userId,
        type, // 'accepted', 'rejected', or 'new_application'
        teamId,
        teamName,
        message,
        dismissed: false,
        createdAt: new Date()
      };
      
      await setDoc(doc(db, 'dashboardNotifications', notificationId), notificationData);
      console.log('Dashboard notification created:', type, teamName);
    } catch (error) {
      console.error('Error creating dashboard notification:', error);
    }
  };

  // Dismiss all notifications for the current user
  const dismissAllNotifications = async () => {
    try {
      const deletePromises = notifications.map(notification => 
        deleteDoc(doc(db, 'dashboardNotifications', notification.id))
      );
      
      await Promise.all(deletePromises);
      console.log(`Dismissed all ${notifications.length} notifications`);
    } catch (error) {
      console.error('Error dismissing all notifications:', error);
    }
  };

  const value = {
    notifications,
    loading,
    dismissNotification,
    dismissAllNotifications,
    createDashboardNotification
  };

  return (
    <DashboardNotificationContext.Provider value={value}>
      {children}
    </DashboardNotificationContext.Provider>
  );
}
