@echo off
echo 🚀 Starting Firebase deployment...

REM Build the Next.js app
echo 📦 Building Next.js app...
npm run build

REM Install functions dependencies
echo 📦 Installing functions dependencies...
cd functions
npm install
cd ..

REM Deploy Firestore rules and indexes
echo 🔥 Deploying Firestore rules and indexes...
firebase deploy --only firestore:rules,firestore:indexes

REM Deploy Storage rules
echo 📁 Deploying Storage rules...
firebase deploy --only storage

REM Deploy functions and hosting
echo 🌐 Deploying functions and hosting...
firebase deploy --only functions,hosting

echo ✅ Deployment complete!
echo 🌍 Your app is live at: https://nubiago-a000f.web.app
pause 