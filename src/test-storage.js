// Test Firebase Storage Connection
// Run this in the browser console to test if storage is working

import { storage } from './firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Test function
async function testStorageUpload() {
  console.log('Testing Firebase Storage...');
  console.log('Storage object:', storage);
  
  // Create a simple test file
  const testContent = 'Hello, Firebase Storage!';
  const blob = new Blob([testContent], { type: 'text/plain' });
  const file = new File([blob], 'test.txt', { type: 'text/plain' });
  
  try {
    // Try to upload
    const storageRef = ref(storage, 'test/test.txt');
    console.log('Uploading test file...');
    await uploadBytes(storageRef, file);
    console.log('✅ Upload successful!');
    
    // Try to get URL
    const url = await getDownloadURL(storageRef);
    console.log('✅ Download URL:', url);
    
    return { success: true, url };
  } catch (error) {
    console.error('❌ Storage test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return { success: false, error };
  }
}

// Run the test
testStorageUpload().then(result => {
  if (result.success) {
    console.log('🎉 Firebase Storage is working!');
  } else {
    console.log('❌ Firebase Storage is NOT working');
    console.log('Possible issues:');
    console.log('1. Storage rules not configured - Go to Firebase Console → Storage → Rules');
    console.log('2. Storage bucket not initialized - Check Firebase project settings');
    console.log('3. User not authenticated - Make sure you are signed in');
  }
});
