#!/bin/bash

# Firebase Deployment Script for Nubiago
echo "🚀 Starting Firebase deployment..."

# Build the Next.js app
echo "📦 Building Next.js app..."
npm run build

# Deploy Firestore rules and indexes
echo "🔥 Deploying Firestore rules and indexes..."
firebase deploy --only firestore:rules,firestore:indexes

# Deploy Storage rules
echo "📁 Deploying Storage rules..."
firebase deploy --only storage

# Deploy hosting
echo "🌐 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "✅ Deployment complete!"
echo "🌍 Your app is live at: https://nubiago-a000f.web.app" 