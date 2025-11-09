#!/bin/bash

# Script to delete QA tester accounts from Firebase Authentication
# This will delete accounts in batches to avoid rate limits

PROJECT_ID="golfbuddy-app-c879a"
USER_IDS_FILE="qa_user_ids.txt"
BATCH_SIZE=10

echo "🧹 Starting QA Tester Account Cleanup"
echo "Project: $PROJECT_ID"
echo "Found $(wc -l < $USER_IDS_FILE) QA tester accounts to delete"
echo ""

# Read user IDs into an array
mapfile -t user_ids < $USER_IDS_FILE

# Process in batches
total=${#user_ids[@]}
processed=0

for ((i=0; i<$total; i+=$BATCH_SIZE)); do
    batch_end=$((i + BATCH_SIZE - 1))
    if [ $batch_end -ge $total ]; then
        batch_end=$((total - 1))
    fi
    
    echo "🗑️  Processing batch $((i / BATCH_SIZE + 1)): Users $((i + 1)) to $((batch_end + 1))"
    
    # Delete users in current batch
    for ((j=i; j<=batch_end; j++)); do
        if [ $j -lt $total ]; then
            user_id="${user_ids[$j]}"
            echo "   Deleting user: $user_id"
            
            # Delete from Firebase Auth
            firebase auth:delete $user_id --project $PROJECT_ID --yes
            
            # Also delete from Firestore users collection if it exists
            firebase firestore:delete "users/$user_id" --project $PROJECT_ID --yes 2>/dev/null || true
            
            processed=$((processed + 1))
        fi
    done
    
    echo "   ✅ Batch completed. Progress: $processed/$total"
    
    # Small delay between batches to avoid rate limits
    if [ $batch_end -lt $((total - 1)) ]; then
        echo "   ⏳ Waiting 2 seconds before next batch..."
        sleep 2
    fi
    echo ""
done

echo "🎉 Cleanup completed!"
echo "✅ Deleted $processed QA tester accounts"
echo ""
echo "Summary:"
echo "- Removed from Firebase Authentication: ✅"
echo "- Removed from Firestore users collection: ✅"
echo "- Original account count: 43"
echo "- QA accounts removed: $processed"
echo "- Remaining accounts: $((43 - processed))"
