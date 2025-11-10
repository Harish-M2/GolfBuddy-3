#!/bin/bash

# Simple QA User Cleanup Script
# This uses the Firebase REST API via curl

PROJECT_ID="golfbuddy-app-c879a"

echo "🧹 QA User Cleanup Script"
echo "=========================="
echo ""

# Check if user IDs file exists
if [ ! -f "qa_user_ids.txt" ]; then
    echo "❌ Error: qa_user_ids.txt not found!"
    exit 1
fi

# Count total users
TOTAL=$(wc -l < qa_user_ids.txt | tr -d ' ')
echo "📊 Found $TOTAL QA users to delete"
echo ""

# Important: Firebase doesn't allow bulk user deletion via CLI
# The best approach is to use the Firebase Console

echo "⚠️  IMPORTANT: Firebase CLI doesn't support direct user deletion"
echo ""
echo "📋 To delete these users, you have 2 options:"
echo ""
echo "Option 1: Firebase Console (RECOMMENDED)"
echo "  1. Go to: https://console.firebase.google.com/project/$PROJECT_ID/authentication/users"
echo "  2. Search for: 'qa.tester'"
echo "  3. Delete users manually"
echo ""
echo "Option 2: Download Service Account Key and use Admin SDK"
echo "  1. Go to: https://console.firebase.google.com/project/$PROJECT_ID/settings/serviceaccounts/adminsdk"
echo "  2. Click 'Generate New Private Key'"
echo "  3. Save as 'serviceAccountKey.json' in this directory"
echo "  4. Run: node delete-qa-users.js"
echo ""

# Ask user which option they want
echo "Which option do you prefer?"
echo "  [1] Open Firebase Console now (manual deletion)"
echo "  [2] I have the service account key (run automated script)"
echo "  [3] Exit"
echo ""
read -p "Enter your choice (1/2/3): " choice

case $choice in
    1)
        echo ""
        echo "🌐 Opening Firebase Console..."
        open "https://console.firebase.google.com/project/$PROJECT_ID/authentication/users"
        echo ""
        echo "📋 Quick Instructions:"
        echo "  1. Search for 'qa.tester' in the search box"
        echo "  2. Click on each user and delete them"
        echo "  3. Or use the checkboxes to select multiple users"
        echo ""
        echo "Total QA users to delete: $TOTAL"
        ;;
    2)
        if [ ! -f "serviceAccountKey.json" ]; then
            echo ""
            echo "❌ Error: serviceAccountKey.json not found!"
            echo "Please download it from Firebase Console first."
            echo ""
            echo "Opening download page..."
            open "https://console.firebase.google.com/project/$PROJECT_ID/settings/serviceaccounts/adminsdk"
            exit 1
        fi
        echo ""
        echo "🚀 Running automated cleanup..."
        node delete-qa-users.js
        ;;
    3)
        echo ""
        echo "👋 Exiting. No users were deleted."
        exit 0
        ;;
    *)
        echo ""
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac
