@echo off
echo ========================================
echo Firebase Auth Domain Fix Instructions
echo ========================================
echo.
echo ISSUE: auth/unauthorized-domain error
echo CAUSE: Vercel domain not authorized in Firebase
echo.
echo SOLUTION: Add domains to Firebase Console
echo.
echo 1. Open: https://console.firebase.google.com/
echo 2. Select project: concrete-setup-468208-v0
echo 3. Go to: Authentication ^> Settings ^> Authorized domains
echo 4. Click "Add domain" and add these domains:
echo.
echo    - nubia-go-latest-a7kire4qg-help-6423s-projects.vercel.app
echo    - *.help-6423s-projects.vercel.app
echo    - *.vercel.app
echo.
echo 5. Save changes
echo.
echo After adding domains, test Firebase Auth on:
echo https://nubia-go-latest-a7kire4qg-help-6423s-projects.vercel.app
echo.
echo ========================================
pause
