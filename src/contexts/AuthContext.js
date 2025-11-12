import React, { createContext, useContext, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Check if running on native platform
const isNative = Capacitor.isNativePlatform();

// UNIFIED AUTH PROVIDER - Works on both web and native
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;

    const setupAuth = async () => {
      try {
        if (isNative) {
          // Use native Firebase authentication
          console.log('🔐 Setting up native Firebase authentication...');
          
          const { addAuthStateListenerNative, getCurrentUserNative } = await import('../firebase/nativeAuth');
          
          // Get current user immediately
          const user = await getCurrentUserNative();
          if (user) {
            console.log('✅ Found existing user session (native):', user.email);
            setCurrentUser(user);
            
            // Fetch full profile from Firestore on native
            try {
              console.log('📦 Fetching full Firestore profile for:', user.uid);
              const { getUserProfile } = await import('../firebase/platformDatabase');
              const profile = await getUserProfile(user.uid);
              console.log('✅ Firestore profile loaded (native):', profile);
              setUserProfile(profile);
            } catch (error) {
              console.error('❌ Error fetching Firestore profile, using basic:', error);
              // Fallback to basic profile if Firestore fetch fails
              const basicProfile = {
                uid: user.uid,
                id: user.uid,
                email: user.email,
                displayName: user.displayName || user.email?.split('@')[0] || 'User',
                photoURL: user.photoUrl || null,
                emailVerified: user.emailVerified || false
              };
              console.log('📝 Using fallback basic profile:', basicProfile);
              setUserProfile(basicProfile);
            }
          }
          
          // Listen for auth changes
          unsubscribe = addAuthStateListenerNative(async (user) => {
            console.log('🔄 Auth state changed (native):', user ? user.email : 'No user');
            setCurrentUser(user);
            
            if (user) {
              // Fetch full profile from Firestore on native too
              try {
                console.log('📦 Fetching full Firestore profile for:', user.uid);
                const { getUserProfile } = await import('../firebase/platformDatabase');
                const profile = await getUserProfile(user.uid);
                console.log('✅ Firestore profile loaded (native):', profile);
                setUserProfile(profile);
              } catch (error) {
                console.error('❌ Error fetching Firestore profile, using basic:', error);
                // Fallback to basic profile if Firestore fetch fails
                const basicProfile = {
                  uid: user.uid,
                  id: user.uid,
                  email: user.email,
                  displayName: user.displayName || user.email?.split('@')[0] || 'User',
                  photoURL: user.photoUrl || null,
                  emailVerified: user.emailVerified || false
                };
                console.log('📝 Using fallback basic profile:', basicProfile);
                setUserProfile(basicProfile);
              }
            } else {
              setUserProfile(null);
            }
            setLoading(false);
          });
          
          // Also set loading false immediately since we don't wait for Firestore
          setLoading(false);
        } else {
          // Use web Firebase authentication
          console.log('🔐 Setting up web Firebase authentication...');
          
          const { onAuthStateChange, getUserProfile } = await import('../firebase/auth');
          
          unsubscribe = onAuthStateChange(async (user) => {
            console.log('🔄 Auth state changed (web):', user ? user.email : 'No user');
            setCurrentUser(user);
            
            if (user) {
              try {
                const profile = await getUserProfile(user.uid);
                setUserProfile(profile);
              } catch (error) {
                console.error('Error fetching user profile:', error);
                setUserProfile(null);
              }
            } else {
              setUserProfile(null);
            }
            
            setLoading(false);
          });
        }
      } catch (error) {
        console.error('❌ Error setting up authentication:', error);
        setLoading(false);
      }
    };

    setupAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Function to reload user profile
  const updateProfile = async () => {
    if (!currentUser) return;
    
    try {
      // Use platform-aware database module
      const { getUserProfile } = await import('../firebase/platformDatabase');
      const profile = await getUserProfile(currentUser.uid);
      setUserProfile(profile);
      console.log('✅ Profile updated successfully in context');
    } catch (error) {
      console.error('❌ Error updating user profile in context:', error);
      throw error;
    }
  };

  // Function to sign in with Google
  const signInWithGoogle = async () => {
    if (isNative) {
      const { signInWithGoogleNative } = await import('../firebase/nativeAuth');
      return await signInWithGoogleNative();
    } else {
      const { signInWithGoogle: webSignIn } = await import('../firebase/auth');
      return await webSignIn();
    }
  };

  // Function to sign in with Apple
  const signInWithApple = async () => {
    if (isNative) {
      const { signInWithAppleNative } = await import('../firebase/nativeAuth');
      return await signInWithAppleNative();
    } else {
      throw new Error('Apple Sign-In is only available on native platforms');
    }
  };

  // Function to sign in with email/password
  const signInWithEmailPassword = async (email, password) => {
    if (isNative) {
      const { signInWithEmailPasswordNative } = await import('../firebase/nativeAuth');
      return await signInWithEmailPasswordNative(email, password);
    } else {
      const { signInWithEmail } = await import('../firebase/auth');
      return await signInWithEmail(email, password);
    }
  };

  // Function to create account with email/password
  const createUserWithEmailPassword = async (email, password) => {
    if (isNative) {
      const { createUserWithEmailPasswordNative } = await import('../firebase/nativeAuth');
      return await createUserWithEmailPasswordNative(email, password);
    } else {
      const { signUpWithEmail } = await import('../firebase/auth');
      return await signUpWithEmail(email, password);
    }
  };

  // Function to sign out
  const signOut = async () => {
    if (isNative) {
      const { signOutNative } = await import('../firebase/nativeAuth');
      await signOutNative();
    } else {
      const { signOut: webSignOut } = await import('../firebase/auth');
      await webSignOut();
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    updateProfile,
    signInWithGoogle,
    signInWithApple,
    signInWithEmailPassword,
    createUserWithEmailPassword,
    signOut,
    isNative
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
