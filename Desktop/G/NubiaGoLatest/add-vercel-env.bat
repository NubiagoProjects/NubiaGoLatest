@echo off
echo Adding missing Firebase environment variables to Vercel...

echo.
echo Step 1: Adding NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
echo Please enter: concrete-setup-468208-v0.firebasestorage.app
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

echo.
echo Step 2: Adding NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID  
echo Please enter: 1055603387502
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID

echo.
echo Step 3: Adding NEXT_PUBLIC_FIREBASE_APP_ID
echo Please enter: 1:1055603387502:web:abf9bfbe1ef4d848c18a7f
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID

echo.
echo Step 4: Adding NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
echo Please enter: G-T0HDGS92ZF
vercel env add NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

echo.
echo All environment variables setup complete!
echo Listing current environment variables:
vercel env ls

echo.
echo Deploying to production with updated environment variables...
vercel --prod

pause
