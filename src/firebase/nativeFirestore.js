/**
 * Native Firestore Implementation
 * Uses @capacitor-firebase/firestore for iOS/Android
 */

import { FirebaseFirestore } from '@capacitor-firebase/firestore';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

/**
 * Add document to collection
 */
export const addDocumentNative = async (collection, data) => {
  if (!isNative) {
    throw new Error('This function is only available on native platforms');
  }

  try {
    const result = await FirebaseFirestore.addDocument({
      reference: collection,
      data: data
    });
    console.log(`📦 Raw addDocument result:`, JSON.stringify(result, null, 2));
    
    // Result structure: {reference: {path: "...", id: "..."}}
    const documentId = result.reference?.id || result.id;
    console.log(`✅ Document added to ${collection} with ID:`, documentId);
    
    return { id: documentId, ...data };
  } catch (error) {
    console.error(`❌ Error adding document to ${collection}:`, error);
    throw error;
  }
};

/**
 * Get document by ID
 */
export const getDocumentNative = async (collection, docId) => {
  if (!isNative) {
    throw new Error('This function is only available on native platforms');
  }

  try {
    const result = await FirebaseFirestore.getDocument({
      reference: `${collection}/${docId}`
    });
    console.log(`✅ Document fetched from ${collection}/${docId}`);
    console.log(`📦 Raw result structure:`, JSON.stringify(result, null, 2));
    
    // Result structure: {snapshot: {path: "...", data: {...}}}
    const documentData = result.snapshot?.data || {};
    console.log(`📦 Extracted document data:`, JSON.stringify(documentData, null, 2));
    
    return { id: docId, ...documentData };
  } catch (error) {
    console.error(`❌ Error getting document ${collection}/${docId}:`, error);
    throw error;
  }
};

/**
 * Update document
 */
export const updateDocumentNative = async (collection, docId, data) => {
  if (!isNative) {
    throw new Error('This function is only available on native platforms');
  }

  try {
    await FirebaseFirestore.updateDocument({
      reference: `${collection}/${docId}`,
      data: data
    });
    console.log(`✅ Document updated: ${collection}/${docId}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error updating document ${collection}/${docId}:`, error);
    throw error;
  }
};

/**
 * Delete document
 */
export const deleteDocumentNative = async (collection, docId) => {
  if (!isNative) {
    throw new Error('This function is only available on native platforms');
  }

  try {
    await FirebaseFirestore.deleteDocument({
      reference: `${collection}/${docId}`
    });
    console.log(`✅ Document deleted: ${collection}/${docId}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error deleting document ${collection}/${docId}:`, error);
    throw error;
  }
};

/**
 * Query collection with filters
 */
export const queryCollectionNative = async (collection, queryConstraints = []) => {
  if (!isNative) {
    throw new Error('This function is only available on native platforms');
  }

  try {
    const result = await FirebaseFirestore.getCollection({
      reference: collection,
      queryConstraints: queryConstraints
    });
    
    console.log(`📦 Raw collection result for ${collection}:`, JSON.stringify(result, null, 2));
    console.log(`📦 Snapshots array:`, result.snapshots);
    
    const documents = result.snapshots.map(snapshot => {
      console.log(`📦 Processing snapshot:`, snapshot.id, JSON.stringify(snapshot.data, null, 2));
      return {
        id: snapshot.id,
        ...snapshot.data
      };
    });
    
    console.log(`✅ Query ${collection}: ${documents.length} documents`);
    console.log(`📦 Final documents:`, JSON.stringify(documents, null, 2));
    return documents;
  } catch (error) {
    console.error(`❌ Error querying ${collection}:`, error);
    throw error;
  }
};

/**
 * Get all documents in collection
 */
export const getCollectionNative = async (collection) => {
  return queryCollectionNative(collection, []);
};

/**
 * Set document (create or overwrite/merge)
 */
export const setDocumentNative = async (collection, docId, data, merge = false) => {
  if (!isNative) {
    throw new Error('This function is only available on native platforms');
  }

  try {
    console.log(`📤 setDocument - Reference: ${collection}/${docId}`);
    console.log(`📤 setDocument - Merge: ${merge}`);
    console.log(`📤 setDocument - Data:`, JSON.stringify(data, null, 2));
    
    await FirebaseFirestore.setDocument({
      reference: `${collection}/${docId}`,
      data: data,
      merge: merge
    });
    console.log(`✅ Document ${merge ? 'merged' : 'set'}: ${collection}/${docId}`);
    return { id: docId, ...data };
  } catch (error) {
    console.error(`❌ Error setting document ${collection}/${docId}:`, error);
    throw error;
  }
};

/**
 * Add document listener (real-time updates)
 */
export const addDocumentListenerNative = (collection, docId, callback) => {
  if (!isNative) {
    throw new Error('This function is only available on native platforms');
  }

  console.log(`👂 Setting up listener for ${collection}/${docId}`);

  const listener = FirebaseFirestore.addDocumentSnapshotListener(
    {
      reference: `${collection}/${docId}`
    },
    (result, error) => {
      if (error) {
        console.error(`❌ Listener error for ${collection}/${docId}:`, error);
        callback(null, error);
      } else {
        const data = result.snapshot ? { id: docId, ...result.snapshot.data } : null;
        callback(data, null);
      }
    }
  );

  return () => {
    console.log(`🔇 Removing listener for ${collection}/${docId}`);
    listener.remove();
  };
};

/**
 * Add collection listener (real-time updates)
 */
export const addCollectionListenerNative = (collection, queryConstraints, callback) => {
  if (!isNative) {
    throw new Error('This function is only available on native platforms');
  }

  console.log(`👂 Setting up collection listener for ${collection}`);

  const listener = FirebaseFirestore.addCollectionSnapshotListener(
    {
      reference: collection,
      queryConstraints: queryConstraints || []
    },
    (result, error) => {
      if (error) {
        console.error(`❌ Collection listener error for ${collection}:`, error);
        callback(null, error);
      } else {
        const documents = result.snapshots.map(snapshot => ({
          id: snapshot.id,
          ...snapshot.data
        }));
        callback(documents, null);
      }
    }
  );

  return () => {
    console.log(`🔇 Removing collection listener for ${collection}`);
    listener.remove();
  };
};

// Export all functions
export default {
  addDocumentNative,
  getDocumentNative,
  updateDocumentNative,
  deleteDocumentNative,
  queryCollectionNative,
  getCollectionNative,
  setDocumentNative,
  addDocumentListenerNative,
  addCollectionListenerNative
};
