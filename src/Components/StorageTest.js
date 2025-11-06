import React, { useState } from 'react';
import { Box, Button, Typography, Alert, Card, CardContent } from '@mui/material';
import { storage, auth } from '../firebase/config';
import { ref, uploadBytes, uploadString, getDownloadURL } from 'firebase/storage';

export function StorageTest() {
  const [result, setResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const runTest = async () => {
    setTesting(true);
    setResult(null);

    const logs = [];
    const startTime = Date.now();
    
    try {
      // Check 1: Storage object
      logs.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logs.push('🔍 FIREBASE STORAGE DIAGNOSTIC TEST');
      logs.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logs.push('');
      logs.push('Step 1: Checking Storage Configuration');
      logs.push('✅ Storage object exists: ' + !!storage);
      logs.push('✅ Storage bucket: ' + storage.app.options.storageBucket);
      logs.push('✅ Project ID: ' + storage.app.options.projectId);
      logs.push('');
      
      // Check 2: User authentication
      logs.push('Step 2: Checking User Authentication');
      const user = auth.currentUser;
      if (!user) {
        logs.push('❌ ERROR: No user signed in!');
        logs.push('');
        logs.push('🔧 FIX: Please sign in first');
        setResult({ success: false, logs, error: 'Not authenticated' });
        setTesting(false);
        return;
      }
      logs.push('✅ User authenticated: ' + user.uid);
      logs.push('✅ User email: ' + user.email);
      logs.push('');
      
      // Check 3: Create test file
      logs.push('Step 3: Creating Test File');
      const testContent = 'Test upload at ' + new Date().toISOString();
      const blob = new Blob([testContent], { type: 'text/plain' });
      const file = new File([blob], 'test.txt', { type: 'text/plain' });
      logs.push('✅ Test file created: ' + file.name + ' (' + file.size + ' bytes)');
      logs.push('');
      
      // Check 4: Create storage reference
      logs.push('Step 4: Creating Storage Reference');
      const testPath = `test/${user.uid}/test_${Date.now()}.txt`;
      const storageRef = ref(storage, testPath);
      logs.push('✅ Storage path: ' + testPath);
      logs.push('✅ Storage reference created');
      logs.push('');
      
      // Check 5: Upload file with timeout (using faster uploadString method)
      logs.push('Step 5: Uploading File (with 15s timeout)');
      logs.push('⏳ Upload started at: ' + new Date().toLocaleTimeString());
      logs.push('⏳ Using fast uploadString method...');
      
      const uploadStartTime = Date.now();
      
      // Use uploadString instead of uploadBytes - much faster!
      const uploadPromise = uploadString(storageRef, testContent, 'raw', {
        contentType: 'text/plain'
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timed out after 15 seconds')), 15000)
      );
      
      const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
      
      const uploadTime = ((Date.now() - uploadStartTime) / 1000).toFixed(2);
      logs.push('✅ Upload completed in ' + uploadTime + 's!');
      logs.push('✅ Bytes transferred: ' + snapshot.metadata.size);
      logs.push('');
      
      // Check 6: Get download URL
      logs.push('Step 6: Getting Download URL');
      const url = await getDownloadURL(storageRef);
      logs.push('✅ Download URL retrieved');
      logs.push('URL: ' + url.substring(0, 80) + '...');
      logs.push('');
      
      // Check 7: Verify file accessibility (optional - may fail due to CORS)
      logs.push('Step 7: Verifying File Accessibility');
      try {
        const response = await fetch(url, { mode: 'cors' });
        if (response.ok) {
          const retrievedContent = await response.text();
          if (retrievedContent === testContent) {
            logs.push('✅ File content verified - matches original!');
          } else {
            logs.push('⚠️ File retrieved but content differs');
          }
        } else {
          logs.push('⚠️ File uploaded but not publicly accessible (status: ' + response.status + ')');
        }
      } catch (fetchError) {
        logs.push('⚠️ Could not verify file accessibility (CORS/network issue)');
        logs.push('   This is OK - upload and URL retrieval both worked!');
      }
      logs.push('');
      
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
      logs.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logs.push('✅ ALL TESTS PASSED! (Total time: ' + totalTime + 's)');
      logs.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logs.push('');
      logs.push('✨ Storage upload is working! Upload time: ' + uploadTime + 's');
      logs.push('✨ You can now upload profile pictures and golf photos!');
      
      setResult({ success: true, logs, url });
      
    } catch (error) {
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
      
      logs.push('');
      logs.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logs.push('❌ TEST FAILED (after ' + totalTime + 's)');
      logs.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logs.push('');
      logs.push('Error Type: ' + (error.name || 'Unknown'));
      logs.push('Error Code: ' + (error.code || 'none'));
      logs.push('Error Message: ' + error.message);
      logs.push('');
      
      // Specific error handling and fixes
      if (error.code === 'storage/unauthorized') {
        logs.push('🔧 SOLUTION: Update Firebase Storage Rules');
        logs.push('');
        logs.push('Your storage is not allowing uploads. Fix this by:');
        logs.push('');
        logs.push('1. Open Firebase Console:');
        logs.push('   https://console.firebase.google.com/project/golfbuddy-app-c879a/storage/rules');
        logs.push('');
        logs.push('2. Click on the "Rules" tab');
        logs.push('');
        logs.push('3. Replace the rules with:');
        logs.push('   rules_version = \'2\';');
        logs.push('   service firebase.storage {');
        logs.push('     match /b/{bucket}/o {');
        logs.push('       match /{allPaths=**} {');
        logs.push('         allow read, write: if request.auth != null;');
        logs.push('       }');
        logs.push('     }');
        logs.push('   }');
        logs.push('');
        logs.push('4. Click "Publish"');
        logs.push('');
        logs.push('5. Wait 30 seconds, then run this test again');
      } else if (error.message.includes('timeout') || error.message.includes('timed out')) {
        logs.push('🔧 SOLUTION: Network/Timeout Issue');
        logs.push('');
        logs.push('Upload took too long (15+ seconds for a tiny file). This suggests:');
        logs.push('');
        logs.push('❌ Most Likely Cause: Firebase Storage NOT Initialized');
        logs.push('');
        logs.push('Quick Fix:');
        logs.push('1. Go to: https://console.firebase.google.com/project/golfbuddy-app-c879a/storage');
        logs.push('2. If you see a "Get Started" button, CLICK IT to enable Storage');
        logs.push('3. Follow the setup wizard');
        logs.push('4. Come back and run this test again');
        logs.push('');
        logs.push('Other Possible Causes:');
        logs.push('• Slow internet - Test your speed at fast.com');
        logs.push('• Network firewall blocking Firebase - Try from different network');
        logs.push('• Browser extension interfering - Try incognito/private mode');
        logs.push('• VPN causing issues - Try disabling VPN temporarily');
      } else if (error.code === 'storage/unknown' || !error.code) {
        logs.push('🔧 SOLUTION: Configuration Issue');
        logs.push('');
        logs.push('Check these potential issues:');
        logs.push('• Verify storageBucket in firebase/config.js is correct');
        logs.push('• Check Firebase Console → Storage is enabled');
        logs.push('• Look at browser console (F12) for CORS errors');
        logs.push('• Verify Firebase project billing is active (if on Blaze plan)');
      } else {
        logs.push('🔧 TROUBLESHOOTING STEPS:');
        logs.push('');
        logs.push('1. Check browser console (F12) for additional errors');
        logs.push('2. Verify Firebase project is active');
        logs.push('3. Check internet connection');
        logs.push('4. Try signing out and back in');
        logs.push('5. Clear browser cache and cookies');
      }
      
      setResult({ success: false, logs, error: error.message, errorCode: error.code });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Card sx={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)',
        border: '4px solid #f59e0b',
        boxShadow: '0 10px 40px rgba(245, 158, 11, 0.3)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800,
                color: '#92400e',
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              🔧 FIREBASE STORAGE DIAGNOSTIC TEST
            </Typography>
            <Typography variant="h6" sx={{ color: '#78350f', fontWeight: 600 }}>
              Run this test FIRST to diagnose upload issues
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            onClick={runTest}
            disabled={testing}
            size="large"
            fullWidth
            sx={{ 
              mb: 3,
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                boxShadow: '0 6px 30px rgba(245, 158, 11, 0.5)',
              }
            }}
          >
            {testing ? '⏳ TESTING... PLEASE WAIT' : '🚀 CLICK HERE TO RUN STORAGE TEST'}
          </Button>

          {result && (
            <Alert 
              severity={result.success ? 'success' : 'error'} 
              sx={{ 
                mb: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {result.success ? '✅ STORAGE IS WORKING!' : '❌ STORAGE TEST FAILED'}
              </Typography>
              <Typography variant="body2">
                {result.success 
                  ? 'Your Firebase Storage is properly configured. Try uploading your profile picture below!' 
                  : 'Follow the instructions below to fix the issue.'}
              </Typography>
            </Alert>
          )}

          {result && (
            <Box
              sx={{
                bgcolor: '#1e1e1e',
                color: '#fff',
                p: 3,
                borderRadius: 2,
                fontFamily: 'monospace',
                fontSize: '0.95rem',
                maxHeight: 500,
                overflow: 'auto',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
              }}
            >
              {result.logs.map((log, i) => (
                <div key={i} style={{ 
                  marginBottom: '4px',
                  color: log.includes('❌') ? '#ef4444' : 
                         log.includes('✅') ? '#10b981' : 
                         log.includes('🔧') ? '#f59e0b' : 
                         log.includes('━') ? '#60a5fa' : '#fff'
                }}>{log}</div>
              ))}
            </Box>
          )}

          {!result && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>What this test does:</strong><br/>
                • Checks if Firebase Storage is configured<br/>
                • Tests file upload with timeout protection<br/>
                • Verifies your authentication<br/>
                • Provides exact fix instructions if something fails<br/>
                <br/>
                <strong>This test takes 5-15 seconds to complete.</strong>
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
