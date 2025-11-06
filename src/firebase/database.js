import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc,
  updateDoc,
  query, 
  where,
  addDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

// Get all golf buddies
export const getAllGolfBuddies = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const buddies = [];
    querySnapshot.forEach((doc) => {
      buddies.push({ id: doc.id, ...doc.data() });
    });
    return buddies;
  } catch (error) {
    throw error;
  }
};

// Get golf buddies by filters
export const getFilteredGolfBuddies = async (skillLevel = '', location = '') => {
  try {
    // Get all users first - avoid complex Firestore queries that need composite indexes
    const querySnapshot = await getDocs(collection(db, 'users'));
    let buddies = [];
    
    querySnapshot.forEach((doc) => {
      buddies.push({ id: doc.id, ...doc.data() });
    });
    
    // Apply filters client-side
    if (skillLevel) {
      buddies = buddies.filter(user => 
        user.skillLevel?.toLowerCase() === skillLevel.toLowerCase()
      );
    }
    
    if (location) {
      const searchTerm = location.toLowerCase();
      buddies = buddies.filter(user => 
        user.location?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort by createdAt if available, otherwise by displayName
    buddies.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return (a.displayName || '').localeCompare(b.displayName || '');
    });
    
    return buddies;
  } catch (error) {
    console.error('Filter error:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (uid, profileData) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    throw error;
  }
};

// Send buddy request
export const sendBuddyRequest = async (fromUserId, toUserId, message = '') => {
  try {
    const requestData = {
      fromUserId,
      toUserId,
      message,
      status: 'pending', // pending, accepted, rejected
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'buddyRequests'), requestData);
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

// Get buddy requests for a user
export const getBuddyRequests = async (userId) => {
  try {
    // Get requests sent to this user (remove orderBy to avoid composite index)
    const receivedQuery = query(
      collection(db, 'buddyRequests'),
      where('toUserId', '==', userId)
    );
    
    // Get requests sent by this user (remove orderBy to avoid composite index)
    const sentQuery = query(
      collection(db, 'buddyRequests'),
      where('fromUserId', '==', userId)
    );
    
    const [receivedSnapshot, sentSnapshot] = await Promise.all([
      getDocs(receivedQuery),
      getDocs(sentQuery)
    ]);
    
    const received = [];
    const sent = [];
    
    receivedSnapshot.forEach((doc) => {
      received.push({ id: doc.id, ...doc.data() });
    });
    
    sentSnapshot.forEach((doc) => {
      sent.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort client-side
    received.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
    
    sent.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
    
    return { received, sent };
  } catch (error) {
    console.error('Error getting buddy requests:', error);
    throw error;
  }
};

// Get sent buddy requests for a user
export const getSentRequests = async (userId) => {
  try {
    // Remove orderBy to avoid composite index requirement
    const sentQuery = query(
      collection(db, 'buddyRequests'),
      where('fromUserId', '==', userId)
    );
    
    const sentSnapshot = await getDocs(sentQuery);
    const sent = [];
    
    sentSnapshot.forEach((doc) => {
      sent.push({ id: doc.id, recipientId: doc.data().toUserId, ...doc.data() });
    });
    
    // Sort client-side
    sent.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
    
    return sent;
  } catch (error) {
    console.error('Error getting sent requests:', error);
    throw error;
  }
};

// Update buddy request status
export const updateBuddyRequestStatus = async (requestId, status) => {
  try {
    const requestRef = doc(db, 'buddyRequests', requestId);
    await updateDoc(requestRef, {
      status,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    throw error;
  }
};

// Get user profile by ID
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    throw error;
  }
};

// Create or update user profile
export const createUserProfile = async (uid, profileData) => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...profileData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    throw error;
  }
};

// Delete user profile
export const deleteUserProfile = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
    return true;
  } catch (error) {
    throw error;
  }
};

// Accept buddy request
export const acceptBuddyRequest = async (requestId, fromUserId, toUserId) => {
  try {
    // Update request status
    await updateBuddyRequestStatus(requestId, 'accepted');
    
    // Add to buddies collection for both users
    const buddyData = {
      createdAt: serverTimestamp()
    };
    
    // Add buddy relationship in both directions
    await Promise.all([
      setDoc(doc(db, 'users', fromUserId, 'buddies', toUserId), buddyData),
      setDoc(doc(db, 'users', toUserId, 'buddies', fromUserId), buddyData)
    ]);
    
    return true;
  } catch (error) {
    throw error;
  }
};

// Decline buddy request
export const declineBuddyRequest = async (requestId) => {
  try {
    await updateBuddyRequestStatus(requestId, 'declined');
    return true;
  } catch (error) {
    throw error;
  }
};

// Get user's buddies
export const getUserBuddies = async (userId) => {
  try {
    const buddiesRef = collection(db, 'users', userId, 'buddies');
    const querySnapshot = await getDocs(buddiesRef);
    
    const buddyIds = [];
    querySnapshot.forEach((doc) => {
      buddyIds.push(doc.id);
    });
    
    // Get full user profiles for each buddy
    if (buddyIds.length === 0) return [];
    
    const buddyProfiles = await Promise.all(
      buddyIds.map(id => getUserProfile(id))
    );
    
    return buddyProfiles.filter(profile => profile !== null);
  } catch (error) {
    throw error;
  }
};

// Remove buddy
export const removeBuddy = async (userId, buddyId) => {
  try {
    // Remove buddy relationship in both directions
    await Promise.all([
      deleteDoc(doc(db, 'users', userId, 'buddies', buddyId)),
      deleteDoc(doc(db, 'users', buddyId, 'buddies', userId))
    ]);
    return true;
  } catch (error) {
    throw error;
  }
};

// ============= FAVORITE COURSES FUNCTIONS =============

// Add course to favorites
export const addFavoriteCourse = async (userId, courseData) => {
  try {
    const favoritesRef = collection(db, 'users', userId, 'favoriteCourses');
    const courseRef = doc(favoritesRef, courseData.place_id || courseData.id);
    
    await setDoc(courseRef, {
      ...courseData,
      addedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error adding favorite course:', error);
    throw error;
  }
};

// Remove course from favorites
export const removeFavoriteCourse = async (userId, courseId) => {
  try {
    const courseRef = doc(db, 'users', userId, 'favoriteCourses', courseId);
    await deleteDoc(courseRef);
    return true;
  } catch (error) {
    console.error('Error removing favorite course:', error);
    throw error;
  }
};

// Get user's favorite courses
export const getFavoriteCourses = async (userId) => {
  try {
    const favoritesRef = collection(db, 'users', userId, 'favoriteCourses');
    const querySnapshot = await getDocs(favoritesRef);
    
    const favorites = [];
    querySnapshot.forEach((doc) => {
      favorites.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by addedAt
    favorites.sort((a, b) => {
      const aTime = a.addedAt?.toMillis?.() || 0;
      const bTime = b.addedAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
    
    return favorites;
  } catch (error) {
    console.error('Error getting favorite courses:', error);
    throw error;
  }
};

// Check if course is favorited
export const isFavoriteCourse = async (userId, courseId) => {
  try {
    const courseRef = doc(db, 'users', userId, 'favoriteCourses', courseId);
    const courseDoc = await getDoc(courseRef);
    return courseDoc.exists();
  } catch (error) {
    console.error('Error checking favorite course:', error);
    return false;
  }
};

// ============= PHOTO UPLOAD FUNCTIONS =============

// Upload profile picture
export const uploadProfilePicture = async (userId, file) => {
  try {
    console.log('uploadProfilePicture called with userId:', userId);
    console.log('Storage object:', storage);
    
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile_${userId}_${Date.now()}.${fileExtension}`;
    const storagePath = `profilePictures/${userId}/${fileName}`;
    
    console.log('Creating storage reference:', storagePath);
    const storageRef = ref(storage, storagePath);
    
    console.log('Uploading file...');
    await uploadBytes(storageRef, file);
    
    console.log('Getting download URL...');
    const downloadURL = await getDownloadURL(storageRef);
    console.log('Download URL:', downloadURL);
    
    // Update user profile with photo URL
    console.log('Updating user profile...');
    await updateUserProfile(userId, { photoURL: downloadURL });
    
    console.log('Profile picture upload complete!');
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

// Upload golf activity photo
export const uploadGolfPhoto = async (userId, file, metadata = {}) => {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `golf_${userId}_${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `golfPhotos/${userId}/${fileName}`);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Save photo metadata to Firestore
    const photoData = {
      url: downloadURL,
      userId,
      fileName,
      uploadedAt: serverTimestamp(),
      ...metadata
    };
    
    const photoRef = await addDoc(collection(db, 'golfPhotos'), photoData);
    
    return { id: photoRef.id, ...photoData, url: downloadURL };
  } catch (error) {
    console.error('Error uploading golf photo:', error);
    throw error;
  }
};

// Get user's golf photos
export const getUserGolfPhotos = async (userId) => {
  try {
    const photosQuery = query(
      collection(db, 'golfPhotos'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(photosQuery);
    const photos = [];
    
    querySnapshot.forEach((doc) => {
      photos.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by uploadedAt
    photos.sort((a, b) => {
      const aTime = a.uploadedAt?.toMillis?.() || 0;
      const bTime = b.uploadedAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
    
    return photos;
  } catch (error) {
    console.error('Error getting golf photos:', error);
    throw error;
  }
};

// Delete golf photo
export const deleteGolfPhoto = async (photoId, userId, fileName) => {
  try {
    // Delete from Storage
    const storageRef = ref(storage, `golfPhotos/${userId}/${fileName}`);
    await deleteObject(storageRef);
    
    // Delete from Firestore
    await deleteDoc(doc(db, 'golfPhotos', photoId));
    
    return true;
  } catch (error) {
    console.error('Error deleting golf photo:', error);
    throw error;
  }
};

// ============= CHAT FUNCTIONS =============

// Send a message
export const sendMessage = async (fromUserId, toUserId, messageText) => {
  try {
    // Create a consistent chat ID (sorted user IDs)
    const chatId = [fromUserId, toUserId].sort().join('_');
    
    const messageData = {
      fromUserId,
      toUserId,
      message: messageText,
      timestamp: serverTimestamp(),
      read: false
    };
    
    // Add message to messages subcollection
    await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);
    
    // Update chat metadata
    await setDoc(doc(db, 'chats', chatId), {
      participants: [fromUserId, toUserId],
      lastMessage: messageText,
      lastMessageTime: serverTimestamp(),
      lastMessageFrom: fromUserId,
      [`unreadCount_${toUserId}`]: serverTimestamp() // For sorting unread
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get messages between two users
export const getMessages = async (user1Id, user2Id) => {
  try {
    const chatId = [user1Id, user2Id].sort().join('_');
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const messagesQuery = query(messagesRef);
    
    const querySnapshot = await getDocs(messagesQuery);
    const messages = [];
    
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by timestamp
    messages.sort((a, b) => {
      const aTime = a.timestamp?.toMillis?.() || 0;
      const bTime = b.timestamp?.toMillis?.() || 0;
      return aTime - bTime;
    });
    
    return messages;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

// Get all chats for a user
export const getUserChats = async (userId) => {
  try {
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId)
    );
    
    const querySnapshot = await getDocs(chatsQuery);
    const chats = [];
    
    for (const docSnap of querySnapshot.docs) {
      const chatData = docSnap.data();
      const otherUserId = chatData.participants.find(id => id !== userId);
      
      // Get other user's profile
      try {
        const otherUserProfile = await getUserProfile(otherUserId);
        chats.push({
          id: docSnap.id,
          ...chatData,
          otherUser: otherUserProfile,
          otherUserId
        });
      } catch (err) {
        console.error('Error loading chat user profile:', err);
      }
    }
    
    // Sort by last message time
    chats.sort((a, b) => {
      const aTime = a.lastMessageTime?.toMillis?.() || 0;
      const bTime = b.lastMessageTime?.toMillis?.() || 0;
      return bTime - aTime;
    });
    
    return chats;
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (currentUserId, otherUserId) => {
  try {
    const chatId = [currentUserId, otherUserId].sort().join('_');
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const unreadQuery = query(
      messagesRef,
      where('toUserId', '==', currentUserId),
      where('read', '==', false)
    );
    
    const querySnapshot = await getDocs(unreadQuery);
    const updatePromises = [];
    
    querySnapshot.forEach((docSnap) => {
      updatePromises.push(
        updateDoc(doc(db, 'chats', chatId, 'messages', docSnap.id), {
          read: true
        })
      );
    });
    
    await Promise.all(updatePromises);
    
    // Clear unread count
    await updateDoc(doc(db, 'chats', chatId), {
      [`unreadCount_${currentUserId}`]: null
    });
    
    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Get unread message count
export const getUnreadMessageCount = async (userId) => {
  try {
    const chats = await getUserChats(userId);
    let unreadCount = 0;
    
    for (const chat of chats) {
      const messages = await getMessages(userId, chat.otherUserId);
      const unread = messages.filter(msg => 
        msg.toUserId === userId && !msg.read
      );
      unreadCount += unread.length;
    }
    
    return unreadCount;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

// ==================== TEE TIME FUNCTIONS ====================

// Create a new tee time event
export const createTeeTime = async (userId, teeTimeData) => {
  try {
    const teeTime = {
      creatorId: userId,
      courseName: teeTimeData.courseName,
      courseAddress: teeTimeData.courseAddress || '',
      date: teeTimeData.date,
      time: teeTimeData.time,
      maxPlayers: teeTimeData.maxPlayers || 4,
      notes: teeTimeData.notes || '',
      invitedBuddies: teeTimeData.invitedBuddies || [],
      rsvps: {
        [userId]: { status: 'accepted', timestamp: serverTimestamp() }
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'teeTimes'), teeTime);
    return { id: docRef.id, ...teeTime };
  } catch (error) {
    console.error('Error creating tee time:', error);
    throw error;
  }
};

// Get all tee times for a user (created by or invited to)
export const getUserTeeTimes = async (userId) => {
  try {
    // Get tee times where user is creator
    const creatorQuery = query(
      collection(db, 'teeTimes'),
      where('creatorId', '==', userId)
    );
    
    // Get tee times where user is invited
    const invitedQuery = query(
      collection(db, 'teeTimes'),
      where('invitedBuddies', 'array-contains', userId)
    );
    
    const [creatorSnapshot, invitedSnapshot] = await Promise.all([
      getDocs(creatorQuery),
      getDocs(invitedQuery)
    ]);
    
    const teeTimesMap = new Map();
    
    // Process creator tee times
    creatorSnapshot.forEach((doc) => {
      teeTimesMap.set(doc.id, { id: doc.id, ...doc.data() });
    });
    
    // Process invited tee times
    invitedSnapshot.forEach((doc) => {
      if (!teeTimesMap.has(doc.id)) {
        teeTimesMap.set(doc.id, { id: doc.id, ...doc.data() });
      }
    });
    
    // Convert to array and sort by date
    const teeTimes = Array.from(teeTimesMap.values());
    teeTimes.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA - dateB;
    });
    
    // Fetch user profiles for all participants
    const userIds = new Set();
    teeTimes.forEach(tt => {
      userIds.add(tt.creatorId);
      tt.invitedBuddies?.forEach(id => userIds.add(id));
    });
    
    const userProfiles = {};
    await Promise.all(
      Array.from(userIds).map(async (id) => {
        const userDoc = await getDoc(doc(db, 'users', id));
        if (userDoc.exists()) {
          userProfiles[id] = userDoc.data();
        }
      })
    );
    
    // Attach user profiles to tee times
    teeTimes.forEach(tt => {
      tt.creatorProfile = userProfiles[tt.creatorId];
      tt.participants = Object.keys(tt.rsvps || {}).map(userId => ({
        userId,
        profile: userProfiles[userId],
        status: tt.rsvps[userId].status
      }));
    });
    
    return teeTimes;
  } catch (error) {
    console.error('Error getting user tee times:', error);
    throw error;
  }
};

// Get a single tee time by ID
export const getTeeTime = async (teeTimeId) => {
  try {
    const teeTimeDoc = await getDoc(doc(db, 'teeTimes', teeTimeId));
    
    if (!teeTimeDoc.exists()) {
      throw new Error('Tee time not found');
    }
    
    const teeTimeData = { id: teeTimeDoc.id, ...teeTimeDoc.data() };
    
    // Fetch user profiles
    const userIds = new Set([teeTimeData.creatorId]);
    teeTimeData.invitedBuddies?.forEach(id => userIds.add(id));
    
    const userProfiles = {};
    await Promise.all(
      Array.from(userIds).map(async (id) => {
        const userDoc = await getDoc(doc(db, 'users', id));
        if (userDoc.exists()) {
          userProfiles[id] = userDoc.data();
        }
      })
    );
    
    teeTimeData.creatorProfile = userProfiles[teeTimeData.creatorId];
    teeTimeData.participants = Object.keys(teeTimeData.rsvps || {}).map(userId => ({
      userId,
      profile: userProfiles[userId],
      status: teeTimeData.rsvps[userId].status
    }));
    
    return teeTimeData;
  } catch (error) {
    console.error('Error getting tee time:', error);
    throw error;
  }
};

// Update RSVP status for a tee time
export const updateTeeTimeRSVP = async (teeTimeId, userId, status) => {
  try {
    const teeTimeRef = doc(db, 'teeTimes', teeTimeId);
    
    await updateDoc(teeTimeRef, {
      [`rsvps.${userId}`]: {
        status: status, // 'accepted', 'declined', 'pending'
        timestamp: serverTimestamp()
      },
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating RSVP:', error);
    throw error;
  }
};

// Update tee time details
export const updateTeeTime = async (teeTimeId, updates) => {
  try {
    const teeTimeRef = doc(db, 'teeTimes', teeTimeId);
    
    await updateDoc(teeTimeRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating tee time:', error);
    throw error;
  }
};

// Delete a tee time
export const deleteTeeTime = async (teeTimeId) => {
  try {
    await deleteDoc(doc(db, 'teeTimes', teeTimeId));
    return true;
  } catch (error) {
    console.error('Error deleting tee time:', error);
    throw error;
  }
};

// Get upcoming tee times (next 30 days)
export const getUpcomingTeeTimes = async (userId) => {
  try {
    const allTeeTimes = await getUserTeeTimes(userId);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    return allTeeTimes.filter(tt => {
      const teeTimeDate = new Date(`${tt.date} ${tt.time}`);
      return teeTimeDate >= now && teeTimeDate <= thirtyDaysFromNow;
    });
  } catch (error) {
    console.error('Error getting upcoming tee times:', error);
    throw error;
  }
};

// ============================================================================
// SCORECARD FUNCTIONS
// ============================================================================

// Create a new scorecard
export const createScorecard = async (userId, scorecardData) => {
  try {
    const scorecard = {
      userId,
      courseName: scorecardData.courseName,
      date: scorecardData.date,
      totalPar: scorecardData.totalPar || 72,
      holes: scorecardData.holes, // Array of 18 holes with par, score, putts
      totalScore: scorecardData.totalScore,
      totalPutts: scorecardData.totalPutts || 0,
      notes: scorecardData.notes || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'scorecards'), scorecard);
    return { id: docRef.id, ...scorecard };
  } catch (error) {
    console.error('Error creating scorecard:', error);
    throw error;
  }
};

// Get all scorecards for a user
export const getUserScorecards = async (userId) => {
  try {
    const scorecardsQuery = query(
      collection(db, 'scorecards'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(scorecardsQuery);
    const scorecards = [];
    
    querySnapshot.forEach((doc) => {
      scorecards.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by date descending (most recent first)
    scorecards.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });
    
    return scorecards;
  } catch (error) {
    console.error('Error getting user scorecards:', error);
    throw error;
  }
};

// Get a single scorecard by ID
export const getScorecard = async (scorecardId) => {
  try {
    const scorecardRef = doc(db, 'scorecards', scorecardId);
    const scorecardSnap = await getDoc(scorecardRef);
    
    if (scorecardSnap.exists()) {
      return { id: scorecardSnap.id, ...scorecardSnap.data() };
    } else {
      throw new Error('Scorecard not found');
    }
  } catch (error) {
    console.error('Error getting scorecard:', error);
    throw error;
  }
};

// Update a scorecard
export const updateScorecard = async (scorecardId, updates) => {
  try {
    const scorecardRef = doc(db, 'scorecards', scorecardId);
    
    await updateDoc(scorecardRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating scorecard:', error);
    throw error;
  }
};

// Delete a scorecard
export const deleteScorecard = async (scorecardId) => {
  try {
    await deleteDoc(doc(db, 'scorecards', scorecardId));
    return true;
  } catch (error) {
    console.error('Error deleting scorecard:', error);
    throw error;
  }
};

// Get recent scorecards (last N rounds)
export const getRecentScorecards = async (userId, limit = 5) => {
  try {
    const scorecards = await getUserScorecards(userId);
    return scorecards.slice(0, limit);
  } catch (error) {
    console.error('Error getting recent scorecards:', error);
    throw error;
  }
};

// Get scorecard statistics
export const getScorecardStats = async (userId) => {
  try {
    const scorecards = await getUserScorecards(userId);
    
    if (scorecards.length === 0) {
      return {
        totalRounds: 0,
        averageScore: 0,
        bestScore: 0,
        averagePutts: 0,
        scoreTrend: [],
        scoreDistribution: null
      };
    }
    
    const totalRounds = scorecards.length;
    const totalScore = scorecards.reduce((sum, sc) => sum + sc.totalScore, 0);
    const totalPutts = scorecards.reduce((sum, sc) => sum + (sc.totalPutts || 0), 0);
    const averageScore = Math.round(totalScore / totalRounds);
    const averagePutts = Math.round(totalPutts / totalRounds);
    const bestScore = Math.min(...scorecards.map(sc => sc.totalScore));
    
    // Get score trend (last 10 rounds)
    const scoreTrend = scorecards.slice(0, 10).reverse().map(sc => ({
      date: sc.date,
      score: sc.totalScore,
      course: sc.courseName
    }));
    
    // Calculate score distribution
    const scoreDistribution = {
      Eagles: 0,
      Birdies: 0,
      Pars: 0,
      Bogeys: 0,
      'Double+': 0
    };
    
    scorecards.forEach(scorecard => {
      if (scorecard.holes && Array.isArray(scorecard.holes)) {
        scorecard.holes.forEach(hole => {
          const diff = hole.score - hole.par;
          if (diff <= -2) scoreDistribution.Eagles++;
          else if (diff === -1) scoreDistribution.Birdies++;
          else if (diff === 0) scoreDistribution.Pars++;
          else if (diff === 1) scoreDistribution.Bogeys++;
          else if (diff >= 2) scoreDistribution['Double+']++;
        });
      }
    });
    
    return {
      totalRounds,
      averageScore,
      bestScore,
      averagePutts,
      scoreTrend,
      scoreDistribution
    };
  } catch (error) {
    console.error('Error getting scorecard stats:', error);
    throw error;
  }
};
