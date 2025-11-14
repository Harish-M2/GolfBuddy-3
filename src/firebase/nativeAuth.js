/**
 * Native Authentication Implementation
 * Uses Capacitor Firebase Authentication for iOS/Android
 */

import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { addDocumentNative, getDocumentNative, setDocumentNative } from './nativeFirestore';

/**
 * Add auth state change listener for native platforms
 */
export const addAuthStateListenerNative = (callback) => {
  return FirebaseAuthentication.addListener('authStateChange', (change) => {
    callback(change.user);
  });
};

/**
 * Get current user for native platforms
 */
export const getCurrentUserNative = async () => {
  try {
    const result = await FirebaseAuthentication.getCurrentUser();
    return result.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Sign in with Google on native platforms
 */
export const signInWithGoogleNative = async () => {
  try {
    const result = await FirebaseAuthentication.signInWithGoogle();
    
    // Create or update user profile in Firestore
    if (result.user) {
      const userDoc = await getDocumentNative('users', result.user.uid);
      
      if (!userDoc) {
        // Create new user profile
        await setDocumentNative('users', result.user.uid, {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || '',
          skillLevel: 'Beginner',
          location: '',
          bio: '',
          available: true,
          createdAt: new Date().toISOString(),
          profileImage: result.user.photoURL || null
        });
      }
    }
    
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

/**
 * Sign in with Apple on native platforms
 */
export const signInWithAppleNative = async () => {
  try {
    const result = await FirebaseAuthentication.signInWithApple();
    
    // Create or update user profile in Firestore
    if (result.user) {
      const userDoc = await getDocumentNative('users', result.user.uid);
      
      if (!userDoc) {
        // Create new user profile
        await setDocumentNative('users', result.user.uid, {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || '',
          skillLevel: 'Beginner',
          location: '',
          bio: '',
          available: true,
          createdAt: new Date().toISOString(),
          profileImage: result.user.photoURL || null
        });
      }
    }
    
    return result.user;
  } catch (error) {
    console.error('Error signing in with Apple:', error);
    throw error;
  }
};

/**
 * Sign in with email and password on native platforms
 */
export const signInWithEmailPasswordNative = async (email, password) => {
  try {
    const result = await FirebaseAuthentication.signInWithEmailAndPassword({
      email,
      password
    });
    
    return result.user;
  } catch (error) {
    console.error('Error signing in with email/password:', error);
    throw error;
  }
};

/**
 * Create user with email and password on native platforms
 */
export const createUserWithEmailPasswordNative = async (email, password, displayName) => {
  try {
    const result = await FirebaseAuthentication.createUserWithEmailAndPassword({
      email,
      password
    });
    
    // Update profile with display name
    if (result.user && displayName) {
      await FirebaseAuthentication.updateProfile({
        displayName
      });
    }
    
    // Create user document in Firestore
    if (result.user) {
      await setDocumentNative('users', result.user.uid, {
        uid: result.user.uid,
        email: result.user.email,
        displayName: displayName || '',
        skillLevel: 'Beginner',
        location: '',
        bio: '',
        available: true,
        createdAt: new Date().toISOString(),
        profileImage: null
      });
    }
    
    return result.user;
  } catch (error) {
    console.error('Error creating user with email/password:', error);
    throw error;
  }
};

/**
 * Sign out on native platforms
 */
export const signOutNative = async () => {
  try {
    await FirebaseAuthentication.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};
