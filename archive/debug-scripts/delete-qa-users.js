// Firebase Admin SDK Script to Delete QA Tester Accounts
// This script will programmatically delete all QA tester accounts

const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
// Note: You'll need to download your service account key from Firebase Console
// Go to: Project Settings → Service Accounts → Generate New Private Key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Read QA user IDs from file
const qaUserIds = fs.readFileSync('qa_user_ids.txt', 'utf-8')
  .split('\n')
  .filter(id => id.trim().length > 0);

console.log(`🧹 Starting QA User Cleanup...`);
console.log(`📊 Found ${qaUserIds.length} QA users to delete\n`);

// Function to delete users in batches
async function deleteQAUsers() {
  let deleted = 0;
  let failed = 0;
  const errors = [];

  for (const userId of qaUserIds) {
    try {
      // Delete from Authentication
      await admin.auth().deleteUser(userId);
      
      // Delete from Firestore
      await admin.firestore().collection('users').doc(userId).delete();
      
      deleted++;
      console.log(`✅ Deleted user ${deleted}/${qaUserIds.length}: ${userId}`);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      failed++;
      console.error(`❌ Failed to delete ${userId}:`, error.message);
      errors.push({ userId, error: error.message });
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 QA User Cleanup Complete!\n');
  console.log(`📊 Summary:`);
  console.log(`   ✅ Successfully deleted: ${deleted}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Total processed: ${qaUserIds.length}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️  Errors encountered:');
    errors.forEach(({ userId, error }) => {
      console.log(`   - ${userId}: ${error}`);
    });
  }

  // Verify cleanup
  console.log('\n🔍 Verifying cleanup...');
  const listUsersResult = await admin.auth().listUsers(1000);
  const remainingUsers = listUsersResult.users.length;
  const remainingQAUsers = listUsersResult.users.filter(user => 
    user.email && user.email.includes('qa.tester')
  ).length;
  
  console.log(`📊 Remaining users in system: ${remainingUsers}`);
  console.log(`🎯 Remaining QA users: ${remainingQAUsers}`);
  
  if (remainingQAUsers === 0) {
    console.log('\n✨ SUCCESS: All QA tester accounts have been removed!');
  } else {
    console.log(`\n⚠️  WARNING: ${remainingQAUsers} QA tester accounts still remain`);
  }

  process.exit(0);
}

// Run the cleanup
deleteQAUsers().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
