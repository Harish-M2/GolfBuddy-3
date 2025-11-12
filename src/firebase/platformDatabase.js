/**
 * Platform-Aware Database Module
 * Routes to real Firebase/Firestore on both web AND native
 */

import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

// Dynamic import based on platform
const getDatabaseModule = async () => {
  if (isNative) {
    console.log('📦 Loading REAL native Firestore (native platform)');
    return await import('./nativeDatabase');
  } else {
    console.log('📦 Loading real Firebase database (web platform)');
    return await import('./database');
  }
};

// Wrapper functions that route to appropriate module
export const getAllGolfBuddies = async () => {
  const db = await getDatabaseModule();
  return db.getAllGolfBuddies();
};

export const getFilteredGolfBuddies = async (skillLevel, location) => {
  const db = await getDatabaseModule();
  return db.getFilteredGolfBuddies(skillLevel, location);
};

export const sendBuddyRequest = async (fromUserId, toUserId, message) => {
  const db = await getDatabaseModule();
  return db.sendBuddyRequest(fromUserId, toUserId, message);
};

export const getSentRequests = async (userId) => {
  const db = await getDatabaseModule();
  return db.getSentRequests(userId);
};

export const getBuddies = async (userId) => {
  const db = await getDatabaseModule();
  return db.getBuddies(userId);
};

export const getBuddyRequests = async (userId) => {
  const db = await getDatabaseModule();
  return db.getBuddyRequests(userId);
};

export const updateBuddyRequestStatus = async (requestId, status) => {
  const db = await getDatabaseModule();
  return db.updateBuddyRequestStatus(requestId, status);
};

export const getTeeTimes = async (userId) => {
  const db = await getDatabaseModule();
  return db.getTeeTimes(userId);
};

export const getUserTeeTimes = async (userId) => {
  const db = await getDatabaseModule();
  return db.getUserTeeTimes(userId);
};

export const createTeeTime = async (data) => {
  const db = await getDatabaseModule();
  return db.createTeeTime(data);
};

export const updateTeeTimeRSVP = async (teeTimeId, userId, status) => {
  const db = await getDatabaseModule();
  return db.updateTeeTimeRSVP(teeTimeId, userId, status);
};

export const getScores = async (userId) => {
  const db = await getDatabaseModule();
  return db.getScores(userId);
};

export const saveScore = async (data) => {
  const db = await getDatabaseModule();
  return db.saveScore(data);
};

export const getPhotos = async (userId) => {
  const db = await getDatabaseModule();
  return db.getPhotos(userId);
};

export const uploadPhoto = async (file, metadata) => {
  const db = await getDatabaseModule();
  return db.uploadPhoto(file, metadata);
};

export const getChatMessages = async (chatId) => {
  const db = await getDatabaseModule();
  return db.getChatMessages(chatId);
};

export const sendChatMessage = async (chatId, message) => {
  const db = await getDatabaseModule();
  return db.sendChatMessage(chatId, message);
};

export const getUserChats = async (userId) => {
  const db = await getDatabaseModule();
  return db.getUserChats(userId);
};

export const getUserBuddies = async (userId) => {
  const db = await getDatabaseModule();
  return db.getUserBuddies(userId);
};

export const acceptBuddyRequest = async (requestId) => {
  const db = await getDatabaseModule();
  return db.acceptBuddyRequest(requestId);
};

export const declineBuddyRequest = async (requestId) => {
  const db = await getDatabaseModule();
  return db.declineBuddyRequest(requestId);
};

export const removeBuddy = async (userId, buddyId) => {
  const db = await getDatabaseModule();
  return db.removeBuddy(userId, buddyId);
};

export const getUserProfile = async (userId) => {
  const db = await getDatabaseModule();
  return db.getUserProfile(userId);
};

export const updateUserProfile = async (userId, data) => {
  const db = await getDatabaseModule();
  return db.updateUserProfile(userId, data);
};

// Photos page functions
export const uploadGolfPhoto = async (file, metadata) => {
  const db = await getDatabaseModule();
  return db.uploadGolfPhoto(file, metadata);
};

export const getUserGolfPhotos = async (userId) => {
  const db = await getDatabaseModule();
  return db.getUserGolfPhotos(userId);
};

export const deleteGolfPhoto = async (photoId) => {
  const db = await getDatabaseModule();
  return db.deleteGolfPhoto(photoId);
};

// Settings page functions
export const uploadProfilePicture = async (file, userId) => {
  const db = await getDatabaseModule();
  return db.uploadProfilePicture(file, userId);
};

// Tee Times page functions
export const updateTeeTime = async (teeTimeId, data) => {
  const db = await getDatabaseModule();
  return db.updateTeeTime(teeTimeId, data);
};

export const deleteTeeTime = async (teeTimeId) => {
  const db = await getDatabaseModule();
  return db.deleteTeeTime(teeTimeId);
};

// Courses page functions
export const addFavoriteCourse = async (userId, course) => {
  const db = await getDatabaseModule();
  return db.addFavoriteCourse(userId, course);
};

export const removeFavoriteCourse = async (userId, courseId) => {
  const db = await getDatabaseModule();
  return db.removeFavoriteCourse(userId, courseId);
};

export const getFavoriteCourses = async (userId) => {
  const db = await getDatabaseModule();
  return db.getFavoriteCourses(userId);
};

// Chat page functions
export const sendMessage = async (chatId, message) => {
  const db = await getDatabaseModule();
  return db.sendMessage(chatId, message);
};

export const getMessages = async (user1Id, user2Id) => {
  const db = await getDatabaseModule();
  return db.getMessages(user1Id, user2Id);
};

export const markMessagesAsRead = async (chatId, userId) => {
  const db = await getDatabaseModule();
  return db.markMessagesAsRead(chatId, userId);
};

// Golf Enhanced page functions
export const searchGolfBuddies = async (searchTerm) => {
  const db = await getDatabaseModule();
  return db.searchGolfBuddies(searchTerm);
};

// Scores page functions
export const updateScorecard = async (scorecardId, data) => {
  const db = await getDatabaseModule();
  return db.updateScorecard(scorecardId, data);
};

export const createScorecard = async (data) => {
  const db = await getDatabaseModule();
  return db.createScorecard(data);
};

export const getUserScorecards = async (userId) => {
  const db = await getDatabaseModule();
  return db.getUserScorecards(userId);
};

export const deleteScorecard = async (scorecardId) => {
  const db = await getDatabaseModule();
  return db.deleteScorecard(scorecardId);
};

export const getScorecardStats = async (userId) => {
  const db = await getDatabaseModule();
  return db.getScorecardStats(userId);
};

// Export all functions
export default {
  getAllGolfBuddies,
  getFilteredGolfBuddies,
  sendBuddyRequest,
  getSentRequests,
  getBuddies,
  getBuddyRequests,
  updateBuddyRequestStatus,
  getTeeTimes,
  getUserTeeTimes,
  createTeeTime,
  updateTeeTimeRSVP,
  getScores,
  saveScore,
  getPhotos,
  uploadPhoto,
  getChatMessages,
  sendChatMessage,
  getUserChats,
  getUserBuddies,
  acceptBuddyRequest,
  declineBuddyRequest,
  removeBuddy,
  getUserProfile,
  updateUserProfile,
  uploadGolfPhoto,
  getUserGolfPhotos,
  deleteGolfPhoto,
  uploadProfilePicture,
  updateTeeTime,
  deleteTeeTime,
  addFavoriteCourse,
  removeFavoriteCourse,
  getFavoriteCourses,
  sendMessage,
  getMessages,
  markMessagesAsRead,
  searchGolfBuddies,
  updateScorecard,
  createScorecard,
  getUserScorecards,
  deleteScorecard,
  getScorecardStats
};
