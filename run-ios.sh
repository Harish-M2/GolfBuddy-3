#!/bin/zsh
# Simple iOS Setup - Run this after CocoaPods installation completes

echo "🍎 GolfBuddy iOS Setup - Step by Step"
echo ""
echo "Step 1: Finding CocoaPods..."

# Find where CocoaPods was installed
if [ -f "$HOME/.local/share/gem/ruby/3.4.0/bin/pod" ]; then
    POD_PATH="$HOME/.local/share/gem/ruby/3.4.0/bin/pod"
    echo "✓ Found CocoaPods at: $POD_PATH"
elif [ -f "$HOME/.gem/ruby/3.4.0/bin/pod" ]; then
    POD_PATH="$HOME/.gem/ruby/3.4.0/bin/pod"
    echo "✓ Found CocoaPods at: $POD_PATH"
else
    echo "❌ CocoaPods not found. Please wait for installation to complete."
    exit 1
fi

echo ""
echo "Step 2: Installing iOS dependencies..."
cd ios/App
$POD_PATH install

echo ""
echo "Step 3: Returning to project root..."
cd ../..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Now opening Xcode..."
open ios/App/App.xcworkspace

echo ""
echo "In Xcode:"
echo "  1. Wait for indexing (top progress bar)"
echo "  2. Select a simulator (iPhone 15)"
echo "  3. Click Play ▶️"
echo "  4. Your app will launch! 🎉"
