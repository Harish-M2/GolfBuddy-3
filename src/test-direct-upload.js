// Quick test script to verify Firebase Storage upload
import { storage, auth } from './firebase/config';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

async function testDirectUpload() {
  console.log('🔍 Testing Direct Upload to Firebase Storage');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Check authentication
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ Not authenticated!');
      return;
    }
    console.log('✅ User:', user.uid);
    
    // Create a simple test string
    const testData = 'Hello Firebase Storage! ' + new Date().toISOString();
    console.log('✅ Test data created');
    
    // Create storage reference
    const testPath = `test-direct/${user.uid}/test-${Date.now()}.txt`;
    const storageRef = ref(storage, testPath);
    console.log('✅ Reference:', testPath);
    
    // Try uploadString (faster than uploadBytes)
    console.log('⏳ Uploading with uploadString...');
    const startTime = Date.now();
    
    const snapshot = await uploadString(storageRef, testData);
    const uploadTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('✅ Upload successful in', uploadTime, 'seconds!');
    console.log('✅ Bytes transferred:', snapshot.metadata.size);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log('✅ Download URL:', downloadURL);
    
    // Test accessibility
    const response = await fetch(downloadURL);
    if (response.ok) {
      const content = await response.text();
      console.log('✅ File is accessible!');
      console.log('✅ Content matches:', content === testData);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SUCCESS! Storage is working perfectly!');
    
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ FAILED:', error.code || error.message);
    console.error('Details:', error);
  }
}

// Export for use in console
window.testDirectUpload = testDirectUpload;

console.log('📋 Test function loaded. Open browser console and run: testDirectUpload()');
