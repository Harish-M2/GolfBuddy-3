/**
 * Native Database Implementation
 * Uses Capacitor Firebase Firestore for iOS/Android
 * Implements the same API as database.js but for native platforms
 */

import {
  addDocumentNative,
  getDocumentNative,
  updateDocumentNative,
  deleteDocumentNative,
  queryCollectionNative,
  getCollectionNative,
  setDocumentNative,
  addCollectionListenerNative
} from './nativeFirestore';

import {
  uploadFile,
  deleteFile
} from './nativeStorage';

// ==================== USER PROFILES ====================

export const getUserProfile = async (userId) => {
  try {
    return await getDocumentNative('users', userId);
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId, data) => {
  try {
    console.log('📝 Updating user profile for:', userId);
    console.log('📝 Raw data to update:', JSON.stringify(data, null, 2));
    
    // Get existing profile first
    const existingProfile = await getDocumentNative('users', userId);
    console.log('📝 Existing profile:', JSON.stringify(existingProfile, null, 2));
    
    if (!existingProfile) {
      console.log('📝 Profile not found, creating new profile...');
      // Create new profile with all data
      await setDocumentNative('users', userId, {
        uid: userId,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, false);
      console.log('✅ Profile created successfully');
      return true;
    }
    
    // Profile exists - merge carefully
    // Only include fields that have actual values (not empty strings)
    // But allow boolean false and number 0
    const updateData = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        // For strings, only include if not empty OR if it's intentionally clearing a field
        if (typeof value === 'string') {
          // Always include displayName and email even if empty
          if (key === 'displayName' || key === 'email' || value.trim() !== '') {
            updateData[key] = value;
          }
          // For other string fields, only include if they have content
        } else {
          // Include booleans, numbers, objects, arrays
          updateData[key] = value;
        }
      }
    }
    
    // Always add updatedAt
    updateData.updatedAt = new Date().toISOString();
    
    console.log('📝 Filtered update data:', JSON.stringify(updateData, null, 2));
    
    // Merge with existing profile
    await setDocumentNative('users', userId, updateData, true);
    console.log('✅ Profile updated successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    console.error('❌ Error details:', error.message);
    throw error;
  }
};

export const createUserProfile = async (uid, profileData) => {
  try {
    await setDocumentNative('users', uid, {
      ...profileData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const deleteUserProfile = async (uid) => {
  try {
    await deleteDocumentNative('users', uid);
    return true;
  } catch (error) {
    console.error('Error deleting user profile:', error);
    throw error;
  }
};

export const uploadProfilePicture = async (userId, file) => {
  try {
    console.log('📦 Uploading profile picture for user:', userId);
    console.log('📦 File:', file?.name || file);
    
    if (!file) {
      throw new Error('No file provided');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name?.split('.').pop() || 'jpg';
    const fileName = `profile_${timestamp}.${extension}`;
    const storagePath = `profilePictures/${userId}/${fileName}`;

    // Upload to Firebase Storage
    const downloadUrl = await uploadFile(storagePath, file);
    console.log('✅ Profile picture uploaded:', downloadUrl);

    // Update user profile with new photoURL
    await updateDocumentNative('users', userId, {
      photoURL: downloadUrl,
      updatedAt: new Date().toISOString()
    });
    console.log('✅ Profile updated with new photo URL');

    return downloadUrl;
  } catch (error) {
    console.error('❌ Error uploading profile picture:', error);
    throw error;
  }
};

// ==================== GOLF BUDDIES ====================

export const getAllGolfBuddies = async () => {
  try {
    console.log('📥 Fetching all users from Firestore...');
    const allUsers = await getCollectionNative('users');
    console.log('📦 Raw users data:', JSON.stringify(allUsers, null, 2));
    console.log(`📦 Total users fetched: ${allUsers.length}`);
    
    // Filter out invalid/deleted user profiles
    const validUsers = allUsers.filter(user => {
      console.log(`🔍 Checking user:`, {
        id: user?.id,
        uid: user?.uid,
        email: user?.email,
        displayName: user?.displayName,
        hasEmail: !!user?.email,
        emailLength: user?.email?.length,
        hasUid: !!user?.uid
      });
      
      // Must have id (document ID) or uid, and must have displayName
      // Note: Some users have 'id' (document ID), others have 'uid' (stored field)
      const isValid = user && (user.id || user.uid) && user.displayName;
      
      if (!isValid) {
        console.log('⚠️  FILTERED OUT - Missing required fields:', {
          id: user?.id,
          uid: user?.uid,
          email: user?.email,
          displayName: user?.displayName,
          reason: !user ? 'user is null' : !user.uid ? 'missing uid' : 'missing email AND displayName'
        });
      } else {
        console.log('✅ VALID user:', {
          id: user.id,
          email: user.email || '(empty)',
          displayName: user.displayName || '(empty)',
          skillLevel: user.skillLevel || '(none)'
        });
      }
      
      return isValid;
    });
    
    console.log(`📊 SUMMARY: Found ${allUsers.length} total users, ${validUsers.length} valid users`);
    console.log(`📊 Valid user IDs:`, validUsers.map(u => u.id || u.uid));
    return validUsers;
  } catch (error) {
    console.error('Error getting all golf buddies:', error);
    return [];
  }
};

export const getFilteredGolfBuddies = async (filters) => {
  try {
    const queryConstraints = [];
    
    if (filters.skillLevel) {
      queryConstraints.push({
        type: 'where',
        fieldPath: 'skillLevel',
        opStr: '==',
        value: filters.skillLevel
      });
    }
    
    if (filters.location) {
      queryConstraints.push({
        type: 'where',
        fieldPath: 'location',
        opStr: '==',
        value: filters.location
      });
    }
    
    const allUsers = await queryCollectionNative('users', queryConstraints);
    
    // Filter out invalid/deleted user profiles
    const validUsers = allUsers.filter(user => {
      const isValid = user && user.email && user.uid;
      if (!isValid) {
        console.log('⚠️  Filtering out invalid user profile:', user?.uid || 'unknown');
      }
      return isValid;
    });
    
    return validUsers;
  } catch (error) {
    console.error('Error getting filtered buddies:', error);
    return [];
  }
};

export const searchGolfBuddies = async (searchTerm) => {
  try {
    // Note: Firestore doesn't support text search natively
    // For production, use Algolia or similar
    const allUsers = await getCollectionNative('users');
    
    // Filter valid users and search
    return allUsers.filter(user => {
      // Must have essential fields to be valid
      const isValid = user && user.email && user.uid;
      if (!isValid) return false;
      
      // Search in displayName or email
      return (
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  } catch (error) {
    console.error('Error searching buddies:', error);
    return [];
  }
};

// ==================== BUDDY REQUESTS ====================

export const sendBuddyRequest = async (fromUserId, toUserId, message) => {
  try {
    const data = {
      fromUserId,
      toUserId,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    return await addDocumentNative('buddyRequests', data);
  } catch (error) {
    console.error('Error sending buddy request:', error);
    throw error;
  }
};

export const getBuddyRequests = async (userId) => {
  try {
    console.log('📬 Getting buddy requests for user:', userId);
    
    // Get ALL buddy requests (query constraints might not be working properly)
    const allRequests = await queryCollectionNative('buddyRequests', []);
    
    console.log('📬 Total buddy requests in database:', allRequests.length);
    
    // CLIENT-SIDE FILTERING (fallback if query constraints don't work)
    const received = allRequests.filter(r => r.toUserId === userId);
    const sent = allRequests.filter(r => r.fromUserId === userId);
    
    console.log('📬 Received requests (after filtering):', received.length);
    console.log('📬 Sent requests (after filtering):', sent.length);
    console.log('📬 Received request details:', received.slice(0, 5).map(r => ({
      id: r.id,
      from: r.fromUserId,
      to: r.toUserId,
      status: r.status
    })));
    
    // Sort by createdAt (most recent first)
    received.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
    
    sent.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
    
    console.log('✅ Returning buddy requests:', {
      received: received.length,
      sent: sent.length
    });
    
    return { received, sent };
  } catch (error) {
    console.error('❌ Error getting buddy requests:', error);
    console.error('❌ Error details:', error.message);
    return { received: [], sent: [] };
  }
};

export const getSentRequests = async (userId) => {
  try {
    return await queryCollectionNative('buddyRequests', [
      { type: 'where', fieldPath: 'fromUserId', opStr: '==', value: userId }
    ]);
  } catch (error) {
    console.error('Error getting sent requests:', error);
    return [];
  }
};

export const acceptBuddyRequest = async (requestId, fromUserId, toUserId) => {
  try {
    console.log('🤝 Accepting buddy request:', { requestId, fromUserId, toUserId });
    
    // Update request status
    await updateDocumentNative('buddyRequests', requestId, { 
      status: 'accepted',
      acceptedAt: new Date().toISOString()
    });
    console.log('✅ Request status updated to accepted');
    
    // Add buddy relationship in both directions
    // Store the buddy's ID in each document
    const buddyData1 = {
      buddyId: toUserId, // fromUser's buddy list stores toUserId
      createdAt: new Date().toISOString()
    };
    
    const buddyData2 = {
      buddyId: fromUserId, // toUser's buddy list stores fromUserId
      createdAt: new Date().toISOString()
    };
    
    console.log('📝 Creating buddy relationships:');
    console.log(`  - Adding to users/${fromUserId}/buddies:`, buddyData1);
    console.log(`  - Adding to users/${toUserId}/buddies:`, buddyData2);
    
    // Use addDocumentNative with subcollection paths
    const results = await Promise.all([
      addDocumentNative(`users/${fromUserId}/buddies`, buddyData1),
      addDocumentNative(`users/${toUserId}/buddies`, buddyData2)
    ]);
    
    console.log('✅ Buddy relationships created successfully');
    console.log('📦 Created documents:', results);
    return true;
  } catch (error) {
    console.error('❌ Error accepting buddy request:', error);
    console.error('❌ Error details:', error.message);
    throw error;
  }
};

export const declineBuddyRequest = async (requestId) => {
  try {
    await updateDocumentNative('buddyRequests', requestId, { status: 'declined' });
    return { success: true };
  } catch (error) {
    console.error('Error declining buddy request:', error);
    throw error;
  }
};

export const updateBuddyRequestStatus = async (requestId, status) => {
  try {
    await updateDocumentNative('buddyRequests', requestId, { status });
    return { success: true };
  } catch (error) {
    console.error('Error updating buddy request status:', error);
    throw error;
  }
};

// ==================== BUDDIES ====================

export const getUserBuddies = async (userId) => {
  try {
    console.log('👥 Getting buddies for user:', userId);
    
    // Get buddies from subcollection
    const collectionPath = `users/${userId}/buddies`;
    const buddyDocs = await queryCollectionNative(collectionPath, []);
    
    console.log('👥 Found buddy documents:', buddyDocs.length);
    console.log('👥 Buddy docs:', JSON.stringify(buddyDocs, null, 2));
    
    if (buddyDocs.length === 0) return [];
    
    // Each doc has: {id: <documentId>, buddyId: <userId>}
    // We need to keep both to be able to delete the document later
    const buddyDocuments = buddyDocs.map(doc => ({
      documentId: doc.id,        // The subcollection document ID
      buddyId: doc.buddyId       // The user ID of the buddy
    })).filter(item => item.buddyId);
    
    console.log('👥 Buddy documents with IDs:', JSON.stringify(buddyDocuments, null, 2));
    
    if (buddyDocuments.length === 0) return [];
    
    // Fetch full user profiles for each buddy
    const buddyProfiles = await Promise.all(
      buddyDocuments.map(async ({ documentId, buddyId }) => {
        try {
          console.log(`👥 Fetching profile for buddyId: ${buddyId} (documentId: ${documentId})`);
          const profile = await getUserProfile(buddyId);
          
          // Skip if profile doesn't exist or has no essential data
          if (!profile || !profile.email) {
            console.log(`⚠️  Skipping invalid/deleted buddy profile: ${buddyId}`);
            // Clean up orphaned buddy relationship using the DOCUMENT ID
            try {
              const deletePath = `users/${userId}/buddies/${documentId}`;
              console.log(`🧹 Cleaning up orphaned buddy at: ${deletePath}`);
              await deleteDocumentNative(`users/${userId}/buddies`, documentId);
              console.log(`✅ Cleaned up orphaned buddy: ${buddyId}`);
            } catch (cleanupError) {
              console.error('Error cleaning up orphaned buddy:', cleanupError);
            }
            return null;
          }
          
          console.log('✅ Fetched buddy profile:', profile?.displayName || profile?.email);
          return profile;
        } catch (error) {
          console.error(`❌ Error fetching buddy profile ${buddyId}:`, error);
          // Clean up on error using the DOCUMENT ID
          try {
            const deletePath = `users/${userId}/buddies/${documentId}`;
            console.log(`🧹 Cleaning up errored buddy at: ${deletePath}`);
            await deleteDocumentNative(`users/${userId}/buddies`, documentId);
            console.log(`✅ Cleaned up errored buddy: ${buddyId}`);
          } catch (cleanupError) {
            console.error('Error cleaning up errored buddy:', cleanupError);
          }
          return null;
        }
      })
    );
    
    const validProfiles = buddyProfiles.filter(profile => profile !== null);
    console.log(`✅ Valid buddy profiles returned: ${validProfiles.length}`);
    console.log('👥 Buddy names:', validProfiles.map(p => p.displayName || p.email));
    
    return validProfiles;
  } catch (error) {
    console.error('❌ Error getting user buddies:', error);
    console.error('❌ Error details:', error.message);
    return [];
  }
};

export const getBuddies = async (userId) => {
  return getUserBuddies(userId);
};

export const removeBuddy = async (userId, buddyId) => {
  try {
    console.log(`🗑️  Removing buddy relationship: ${userId} <-> ${buddyId}`);
    
    // Find and delete buddy documents in both directions
    // We need to find the document with matching buddyId field, then delete by document ID
    
    // Get user's buddy documents to find the one with this buddyId
    const userBuddyDocs = await queryCollectionNative(`users/${userId}/buddies`, []);
    const userBuddyDoc = userBuddyDocs.find(doc => doc.buddyId === buddyId);
    
    // Get buddy's buddy documents to find the one with userId
    const buddyBuddyDocs = await queryCollectionNative(`users/${buddyId}/buddies`, []);
    const buddyBuddyDoc = buddyBuddyDocs.find(doc => doc.buddyId === userId);
    
    console.log(`🔍 Found user's buddy doc: ${userBuddyDoc?.id}`);
    console.log(`🔍 Found buddy's buddy doc: ${buddyBuddyDoc?.id}`);
    
    // Delete both documents if found
    const deletePromises = [];
    
    if (userBuddyDoc) {
      console.log(`🗑️  Deleting users/${userId}/buddies/${userBuddyDoc.id}`);
      deletePromises.push(deleteDocumentNative(`users/${userId}/buddies`, userBuddyDoc.id));
    } else {
      console.warn(`⚠️  No buddy document found for ${buddyId} in user ${userId}'s buddies`);
    }
    
    if (buddyBuddyDoc) {
      console.log(`🗑️  Deleting users/${buddyId}/buddies/${buddyBuddyDoc.id}`);
      deletePromises.push(deleteDocumentNative(`users/${buddyId}/buddies`, buddyBuddyDoc.id));
    } else {
      console.warn(`⚠️  No buddy document found for ${userId} in user ${buddyId}'s buddies`);
    }
    
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
      console.log('✅ Buddy relationship removed successfully');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error removing buddy:', error);
    throw error;
  }
};

// ==================== TEE TIMES ====================

export const createTeeTime = async (userId, teeTimeData) => {
  try {
    console.log('🏌️ Creating tee time for user:', userId);
    console.log('🏌️ Tee time data:', teeTimeData);
    
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
        [userId]: { status: 'accepted', timestamp: { seconds: Math.floor(Date.now() / 1000) } }
      },
      createdAt: { seconds: Math.floor(Date.now() / 1000) },
      updatedAt: { seconds: Math.floor(Date.now() / 1000) }
    };
    
    console.log('🏌️ Adding tee time to teeTimes collection...');
    const result = await addDocumentNative('teeTimes', teeTime);
    console.log('✅ Tee time created with ID:', result.id);
    
    return { id: result.id, ...teeTime };
  } catch (error) {
    console.error('❌ Error creating tee time:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
    throw error;
  }
};

export const getUserTeeTimes = async (userId) => {
  try {
    // Get tee times where user is creator
    const createdTeeTimes = await queryCollectionNative('teeTimes', [
      { type: 'where', fieldPath: 'creatorId', opStr: '==', value: userId }
    ]);
    
    // Get tee times where user is invited
    const invitedTeeTimes = await queryCollectionNative('teeTimes', [
      { type: 'where', fieldPath: 'invitedBuddies', opStr: 'array-contains', value: userId }
    ]);
    
    // Merge and deduplicate
    const teeTimesMap = new Map();
    [...createdTeeTimes, ...invitedTeeTimes].forEach(tt => {
      teeTimesMap.set(tt.id, tt);
    });
    
    const teeTimes = Array.from(teeTimesMap.values());
    
    // Sort by date/time
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
        try {
          const profile = await getUserProfile(id);
          if (profile) userProfiles[id] = profile;
        } catch (err) {
          console.error('Error fetching user profile:', err);
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

export const getTeeTime = async (teeTimeId) => {
  try {
    const teeTimeData = await getDocumentNative('teeTimes', teeTimeId);
    
    if (!teeTimeData) {
      throw new Error('Tee time not found');
    }
    
    // Fetch user profiles
    const userIds = new Set([teeTimeData.creatorId]);
    teeTimeData.invitedBuddies?.forEach(id => userIds.add(id));
    
    const userProfiles = {};
    await Promise.all(
      Array.from(userIds).map(async (id) => {
        try {
          const profile = await getUserProfile(id);
          if (profile) userProfiles[id] = profile;
        } catch (err) {
          console.error('Error fetching user profile:', err);
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

export const updateTeeTimeRSVP = async (teeTimeId, userId, status) => {
  try {
    await updateDocumentNative('teeTimes', teeTimeId, {
      [`rsvps.${userId}`]: {
        status: status,
        timestamp: { seconds: Math.floor(Date.now() / 1000) }
      },
      updatedAt: { seconds: Math.floor(Date.now() / 1000) }
    });
    return true;
  } catch (error) {
    console.error('Error updating RSVP:', error);
    throw error;
  }
};

export const updateTeeTime = async (teeTimeId, updates) => {
  try {
    await updateDocumentNative('teeTimes', teeTimeId, {
      ...updates,
      updatedAt: { seconds: Math.floor(Date.now() / 1000) }
    });
    return true;
  } catch (error) {
    console.error('Error updating tee time:', error);
    throw error;
  }
};

export const deleteTeeTime = async (teeTimeId) => {
  try {
    await deleteDocumentNative('teeTimes', teeTimeId);
    return true;
  } catch (error) {
    console.error('Error deleting tee time:', error);
    throw error;
  }
};

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

// ==================== SCORES ====================

export const createScorecard = async (userId, scorecardData) => {
  try {
    const scorecard = {
      userId,
      courseName: scorecardData.courseName,
      date: scorecardData.date,
      totalPar: scorecardData.totalPar || 72,
      holes: scorecardData.holes,
      totalScore: scorecardData.totalScore,
      totalPutts: scorecardData.totalPutts || 0,
      notes: scorecardData.notes || '',
      createdAt: { seconds: Math.floor(Date.now() / 1000) },
      updatedAt: { seconds: Math.floor(Date.now() / 1000) }
    };
    
    const result = await addDocumentNative('scorecards', scorecard);
    return { id: result.id, ...scorecard };
  } catch (error) {
    console.error('Error creating scorecard:', error);
    throw error;
  }
};

export const getUserScorecards = async (userId) => {
  try {
    const scorecards = await queryCollectionNative('scorecards', [
      { type: 'where', fieldPath: 'userId', opStr: '==', value: userId }
    ]);
    
    // Sort by date descending (most recent first)
    scorecards.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });
    
    return scorecards;
  } catch (error) {
    console.error('Error getting user scorecards:', error);
    return [];
  }
};

export const getScorecard = async (scorecardId) => {
  try {
    const scorecard = await getDocumentNative('scorecards', scorecardId);
    if (!scorecard) {
      throw new Error('Scorecard not found');
    }
    return scorecard;
  } catch (error) {
    console.error('Error getting scorecard:', error);
    throw error;
  }
};

export const updateScorecard = async (scorecardId, updates) => {
  try {
    await updateDocumentNative('scorecards', scorecardId, {
      ...updates,
      updatedAt: { seconds: Math.floor(Date.now() / 1000) }
    });
    return true;
  } catch (error) {
    console.error('Error updating scorecard:', error);
    throw error;
  }
};

export const deleteScorecard = async (scorecardId) => {
  try {
    await deleteDocumentNative('scorecards', scorecardId);
    return true;
  } catch (error) {
    console.error('Error deleting scorecard:', error);
    throw error;
  }
};

export const getRecentScorecards = async (userId, limit = 5) => {
  try {
    const scorecards = await getUserScorecards(userId);
    return scorecards.slice(0, limit);
  } catch (error) {
    console.error('Error getting recent scorecards:', error);
    return [];
  }
};

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

// ==================== PHOTOS ====================

export const getUserGolfPhotos = async (userId) => {
  try {
    console.log('📸 Fetching golf photos for user:', userId);
    
    const photos = await queryCollectionNative('golfPhotos', [
      { type: 'where', fieldPath: 'userId', opStr: '==', value: userId }
    ]);
    
    console.log(`📸 Found ${photos.length} photos`);
    
    // Sort by uploadedAt (most recent first)
    photos.sort((a, b) => {
      const aTime = a.uploadedAt?.seconds || 0;
      const bTime = b.uploadedAt?.seconds || 0;
      return bTime - aTime;
    });
    
    return photos;
  } catch (error) {
    console.error('❌ Error getting user golf photos:', error);
    return [];
  }
};

export const uploadGolfPhoto = async (userId, file, metadata = {}) => {
  try {
    console.log('📦 Uploading golf photo for user:', userId);
    console.log('📦 File:', file?.name || file);
    console.log('📦 Metadata:', metadata);
    
    if (!file) {
      throw new Error('No file provided');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name?.split('.').pop() || 'jpg';
    const fileName = `golf_${timestamp}.${extension}`;
    const storagePath = `golfPhotos/${userId}/${fileName}`;

    // Upload to Firebase Storage
    const downloadUrl = await uploadFile(storagePath, file);
    console.log('✅ Golf photo uploaded to Storage:', downloadUrl);

    // Save metadata to Firestore
    const photoData = {
      url: downloadUrl,
      userId,
      fileName,
      storagePath,
      uploadedAt: { seconds: Math.floor(Date.now() / 1000) },
      caption: metadata.caption || '',
      location: metadata.location || '',
      userDisplayName: metadata.userDisplayName || ''
    };
    
    const result = await addDocumentNative('golfPhotos', photoData);
    console.log('✅ Photo metadata saved to Firestore:', result.id);
    
    return { id: result.id, ...photoData };
  } catch (error) {
    console.error('❌ Error uploading golf photo:', error);
    throw error;
  }
};

export const deleteGolfPhoto = async (photoId, userId, fileName) => {
  try {
    console.log('🗑️ Deleting photo:', { photoId, userId, fileName });
    
    if (!photoId) {
      throw new Error('Photo ID is required');
    }

    // Get photo document to retrieve storagePath
    const photo = await getDocumentNative('golfPhotos', photoId);
    
    if (photo) {
      // Delete from Firebase Storage
      const storagePath = photo.storagePath || `golfPhotos/${userId}/${fileName}`;
      try {
        await deleteFile(storagePath);
        console.log('✅ Photo deleted from Storage:', storagePath);
      } catch (storageError) {
        console.warn('⚠️ Could not delete from Storage (may not exist):', storageError.message);
        // Continue with Firestore deletion even if Storage delete fails
      }
    }
    
    // Delete from Firestore
    await deleteDocumentNative('golfPhotos', photoId);
    console.log('✅ Photo deleted from Firestore');
    
    return true;
  } catch (error) {
    console.error('❌ Error deleting golf photo:', error);
    throw error;
  }
};

// ==================== CHAT ====================

export const sendMessage = async (fromUserId, toUserId, messageText) => {
  try {
    // Create a consistent chat ID (sorted user IDs)
    const chatId = [fromUserId, toUserId].sort().join('_');
    
    const messageData = {
      fromUserId,
      toUserId,
      message: messageText,
      timestamp: { seconds: Math.floor(Date.now() / 1000) },
      read: false
    };
    
    // Add message to messages subcollection
    await addDocumentNative(`chats/${chatId}/messages`, messageData);
    
    // Update chat metadata - use merge to preserve existing data
    await setDocumentNative('chats', chatId, {
      participants: [fromUserId, toUserId],
      lastMessage: messageText,
      lastMessageTime: { seconds: Math.floor(Date.now() / 1000) },
      lastMessageFrom: fromUserId,
      [`unreadCount_${toUserId}`]: { seconds: Math.floor(Date.now() / 1000) }
    }, true);
    
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getMessages = async (user1Id, user2Id) => {
  try {
    const chatId = [user1Id, user2Id].sort().join('_');
    const messagesRef = `chats/${chatId}/messages`;
    
    const messages = await getCollectionNative(messagesRef);
    
    // Sort by timestamp
    messages.sort((a, b) => {
      const aTime = a.timestamp?.seconds || 0;
      const bTime = b.timestamp?.seconds || 0;
      return aTime - bTime;
    });
    
    return messages;
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

export const getUserChats = async (userId) => {
  try {
    const chatsQuery = await queryCollectionNative('chats', [
      { type: 'where', fieldPath: 'participants', opStr: 'array-contains', value: userId }
    ]);
    
    const chats = [];
    
    for (const chatData of chatsQuery) {
      const otherUserId = chatData.participants.find(id => id !== userId);
      
      // Get other user's profile
      try {
        const otherUserProfile = await getUserProfile(otherUserId);
        chats.push({
          id: chatData.id,
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
      const aTime = a.lastMessageTime?.seconds || 0;
      const bTime = b.lastMessageTime?.seconds || 0;
      return bTime - aTime;
    });
    
    return chats;
  } catch (error) {
    console.error('Error getting user chats:', error);
    return [];
  }
};

export const markMessagesAsRead = async (currentUserId, otherUserId) => {
  try {
    const chatId = [currentUserId, otherUserId].sort().join('_');
    const messagesRef = `chats/${chatId}/messages`;
    
    const messages = await getCollectionNative(messagesRef);
    const unreadMessages = messages.filter(m => 
      m.toUserId === currentUserId && !m.read
    );
    
    for (const message of unreadMessages) {
      await updateDocumentNative(messagesRef, message.id, { read: true });
    }
    
    // Clear unread count
    await updateDocumentNative('chats', chatId, {
      [`unreadCount_${currentUserId}`]: null
    });
    
    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

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

// ==================== COURSES ====================

export const addFavoriteCourse = async (userId, courseData) => {
  try {
    // Use subcollection: users/{userId}/favoriteCourses/{courseId}
    const courseId = courseData.place_id || courseData.id;
    await setDocumentNative(
      `users/${userId}/favoriteCourses`,
      courseId,
      {
        ...courseData,
        addedAt: { seconds: Math.floor(Date.now() / 1000) }
      }
    );
    return true;
  } catch (error) {
    console.error('Error adding favorite course:', error);
    throw error;
  }
};

export const removeFavoriteCourse = async (userId, courseId) => {
  try {
    // Delete from subcollection
    await deleteDocumentNative(`users/${userId}/favoriteCourses`, courseId);
    return true;
  } catch (error) {
    console.error('Error removing favorite course:', error);
    throw error;
  }
};

export const getFavoriteCourses = async (userId) => {
  try {
    // Query subcollection: users/{userId}/favoriteCourses
    const favorites = await getCollectionNative(`users/${userId}/favoriteCourses`);
    
    // Sort by addedAt (most recent first)
    favorites.sort((a, b) => {
      const aTime = a.addedAt?.seconds || 0;
      const bTime = b.addedAt?.seconds || 0;
      return bTime - aTime;
    });
    
    return favorites;
  } catch (error) {
    console.error('Error getting favorite courses:', error);
    return [];
  }
};

export const isFavoriteCourse = async (userId, courseId) => {
  try {
    const courseDoc = await getDocumentNative(`users/${userId}/favoriteCourses`, courseId);
    return courseDoc !== null;
  } catch (error) {
    console.error('Error checking favorite course:', error);
    return false;
  }
};

// Export all functions
export default {
  // User profiles
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
  uploadProfilePicture,
  
  // Golf buddies
  getAllGolfBuddies,
  getFilteredGolfBuddies,
  searchGolfBuddies,
  
  // Buddy requests
  sendBuddyRequest,
  getBuddyRequests,
  getSentRequests,
  acceptBuddyRequest,
  declineBuddyRequest,
  updateBuddyRequestStatus,
  
  // Buddies
  getUserBuddies,
  getBuddies,
  removeBuddy,
  
  // Tee times
  createTeeTime,
  getUserTeeTimes,
  getTeeTime,
  updateTeeTime,
  updateTeeTimeRSVP,
  deleteTeeTime,
  getUpcomingTeeTimes,
  
  // Scorecards
  createScorecard,
  getUserScorecards,
  getScorecard,
  updateScorecard,
  deleteScorecard,
  getRecentScorecards,
  getScorecardStats,
  
  // Photos
  getUserGolfPhotos,
  uploadGolfPhoto,
  deleteGolfPhoto,
  
  // Chat
  sendMessage,
  getMessages,
  getUserChats,
  markMessagesAsRead,
  getUnreadMessageCount,
  
  // Favorite courses
  addFavoriteCourse,
  removeFavoriteCourse,
  getFavoriteCourses,
  isFavoriteCourse
};
