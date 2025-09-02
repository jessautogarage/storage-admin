#!/bin/bash

# Firebase Storage Rules Deployment Script
# This script deploys the storage rules to Firebase

echo "🔥 Firebase Storage Rules Deployment"
echo "======================================"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed."
    echo "   Install it with: npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI found"

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase."
    echo "   Login with: firebase login"
    exit 1
fi

echo "✅ Firebase authentication verified"

# Check if storage.rules file exists
if [ ! -f "storage.rules" ]; then
    echo "❌ storage.rules file not found."
    echo "   Make sure storage.rules exists in the project root."
    exit 1
fi

echo "✅ Storage rules file found"

# Display current project
echo "📋 Current Firebase project:"
firebase use

echo ""
echo "📄 Storage rules content preview:"
head -20 storage.rules
echo "..."
echo ""

# Confirm deployment
read -p "🚀 Deploy storage rules to Firebase? [y/N]: " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Deploying storage rules..."
    
    if firebase deploy --only storage; then
        echo "✅ Storage rules deployed successfully!"
        echo ""
        echo "📋 Next steps:"
        echo "   1. Test image upload functionality"
        echo "   2. Verify security rules in Firebase Console"
        echo "   3. Check Firebase Storage > Rules tab"
        echo ""
        echo "🔗 Firebase Console: https://console.firebase.google.com"
    else
        echo "❌ Storage rules deployment failed!"
        echo "   Check the rules syntax and Firebase permissions."
        exit 1
    fi
else
    echo "❌ Deployment cancelled."
    exit 0
fi