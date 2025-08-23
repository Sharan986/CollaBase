import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Listen for notifications in real-time
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const notificationsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          setNotifications(notificationsData);
          
          // Count unread notifications
          const unread = notificationsData.filter(notif => !notif.read).length;
          setUnreadCount(unread);
          
          setLoading(false);
          console.log('Notifications updated:', notificationsData.length, 'unread:', unread);
        },
        (error) => {
          console.error('Notification listener error:', error);
          if (error.code === 'failed-precondition') {
            console.log('⚠️ Firestore index missing. Please create the index in Firebase Console.');
            // Fallback: just show empty notifications for now
            setNotifications([]);
            setUnreadCount(0);
          }
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up notification listener:', error);
      setLoading(false);
    }
  }, [currentUser]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, {
        read: true,
        readAt: new Date()
      });
      console.log('Notification marked as read:', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(notif => !notif.read);
      const promises = unreadNotifications.map(notif => 
        updateDoc(doc(db, 'notifications', notif.id), {
          read: true,
          readAt: new Date()
        })
      );
      await Promise.all(promises);
      console.log('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Create a new notification
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

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      console.log('Notification deleted:', notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}