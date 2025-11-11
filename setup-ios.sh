#!/bin/bash
# GolfBuddy iOS Setup Script
# This script sets up your iOS environment with the correct Ruby version

echo "🍎 Setting up GolfBuddy iOS Project..."
echo ""

# Use Homebrew Ruby instead of system Ruby
export PATH="/usr/local/opt/ruby/bin:$PATH"
export LDFLAGS="-L/usr/local/opt/ruby/lib"
export CPPFLAGS="-I/usr/local/opt/ruby/include"

# Check Ruby version
echo "✓ Using Ruby version:"
ruby --version
echo ""

# Install CocoaPods if not already installed
if ! command -v pod &> /dev/null; then
    echo "📦 Installing CocoaPods..."
    gem install cocoapods --user-install
    
    # Add gem binaries to PATH
    export PATH="$HOME/.gem/ruby/3.3.0/bin:$PATH"
    echo ""
else
    echo "✓ CocoaPods already installed"
    pod --version
    echo ""
fi

# Navigate to iOS App directory
cd ios/App

echo "📦 Installing iOS dependencies with CocoaPods..."
pod install

if [ $? -eq 0 ]; then
    echo "✅ Pod install successful!"
    echo ""
    echo "🚀 Opening project in Xcode..."
    cd ../..
    open ios/App/App.xcworkspace
    echo ""
    echo "✅ Xcode should open now!"
    echo ""
    echo "📱 Next steps in Xcode:"
    echo "1. Wait for Xcode to finish indexing"
    echo "2. Select 'App' scheme at the top"
    echo "3. Choose a simulator or your connected iPhone"
    echo "4. Click the Play button (▶️) to run!"
    echo ""
else
    echo "❌ Pod install failed. Please check errors above."
    exit 1
fi
