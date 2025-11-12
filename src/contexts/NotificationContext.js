import React, { createContext, useContext, useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

const isNative = Capacitor.isNativePlatform();

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false); // Start false for mock

  useEffect(() => {
    if (!currentUser || isNative) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      if (isNative) {
        console.log('ℹ️ Running in native mode with mock notifications');
      }
      return;
    }

    // Only load Firebase on web
    const loadFirebaseNotifications = async () => {
      setLoading(true);
      try {
        const { collection, query, where, onSnapshot, orderBy } = await import('firebase/firestore');
        const { db } = await import('../firebase/config');
        
        // Listen for real-time buddy requests
        const q = query(
          collection(db, 'buddyRequests'),
          where('toUserId', '==', currentUser.uid),
          where('status', '==', 'pending'),
          orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const newNotifications = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            newNotifications.push({
              id: doc.id,
              type: 'buddy_request',
              title: 'New Buddy Request',
              message: data.message || 'Someone wants to be your golf buddy!',
              fromUserId: data.fromUserId,
              createdAt: data.createdAt,
              read: false
            });
          });

          setNotifications(newNotifications);
          setUnreadCount(newNotifications.filter(n => !n.read).length);
          setLoading(false);
        }, (error) => {
          console.error('Error listening to notifications:', error);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error loading Firebase notifications:', error);
        setLoading(false);
      }
    };
    
    const unsubscribePromise = loadFirebaseNotifications();
    
    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe && unsubscribe());
    };
  }, [currentUser]);

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => {
      const notification = notifications.find(n => n.id === notificationId);
      return notification && !notification.read ? Math.max(0, prev - 1) : prev;
    });
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
