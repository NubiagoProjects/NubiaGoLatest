# 🔐 Firebase Authentication Troubleshooting Guide

## Common Authentication Errors and Solutions

### 🚨 Popup-Related Errors

#### **Error: `auth/popup-closed-by-user`**
**What it means:** The sign-in popup window was closed before the authentication process completed.

**Common causes:**
- User manually closed the popup window
- User navigated away from the popup
- Browser crashed or was refreshed during sign-in

**Solutions:**
1. **Keep the popup open** until you see the success message
2. **Don't close the popup manually** - let it close automatically
3. **Try again** - the system allows up to 2 retry attempts
4. **Use email/password sign-in** as an alternative

#### **Error: `auth/popup-blocked`**
**What it means:** Your browser blocked the sign-in popup from opening.

**Common causes:**
- Browser popup blocker is enabled
- Browser security settings are too restrictive
- Ad-blocker extensions are interfering

**Solutions:**
1. **Allow popups for this website:**
   - Chrome: Click the popup blocked icon in the address bar → "Always allow popups"
   - Firefox: Click the popup blocked icon → "Allow popups for this site"
   - Safari: Safari → Preferences → Websites → Pop-up Windows → Allow
   - Edge: Click the popup blocked icon → "Always allow"

2. **Disable popup blocker temporarily:**
   - Chrome: Settings → Privacy and security → Site Settings → Pop-ups and redirects
   - Firefox: about:preferences#privacy → Permissions → Block pop-up windows

3. **Use email/password sign-in** instead

#### **Error: `auth/cancelled-popup-request`**
**What it means:** The sign-in process was cancelled before completion.

**Common causes:**
- User clicked "Cancel" in the OAuth provider's popup
- User denied permission to the application
- Network interruption during the process

**Solutions:**
1. **Complete the authorization process** - don't cancel midway
2. **Grant necessary permissions** when prompted
3. **Check your internet connection**
4. **Try again** or use email/password sign-in

### 🔧 General Authentication Issues

#### **Error: `auth/user-not-found`**
**Solution:** Check if you're using the correct email address, or create a new account.

#### **Error: `auth/wrong-password`**
**Solution:** Verify your password is correct. Use the "Forgot Password" link if needed.

#### **Error: `auth/email-already-in-use`**
**Solution:** The email is already registered. Try signing in instead, or use "Forgot Password."

#### **Error: `auth/too-many-requests`**
**Solution:** Wait a few minutes before trying again. Too many failed attempts trigger this protection.

#### **Error: `auth/network-request-failed`**
**Solution:** Check your internet connection and try again.

### 🎯 Best Practices for OAuth Sign-In

1. **Keep popups open** until completion
2. **Allow popups** for this website in your browser
3. **Complete the authorization** process fully
4. **Don't navigate away** from the popup
5. **Use a stable internet connection**

### 🚀 Alternative Sign-In Methods

If OAuth continues to cause issues:

1. **Email/Password Sign-In:** Use your registered email and password
2. **Password Reset:** If you forgot your password, use the reset link
3. **Contact Support:** Reach out to our support team for assistance

### 🌐 Browser Compatibility

**Recommended browsers:**
- ✅ Chrome (latest version)
- ✅ Firefox (latest version)
- ✅ Safari (latest version)
- ✅ Edge (latest version)

**Known issues:**
- Some older browsers may have limited OAuth support
- Mobile browsers may handle popups differently
- Private/incognito mode may restrict popups

### 📱 Mobile Device Considerations

- **iOS Safari:** May require manual popup allowance
- **Android Chrome:** Generally works well with OAuth
- **Mobile apps:** Use in-app browser for best compatibility

### 🔒 Security Notes

- **Never share** your authentication credentials
- **Use strong passwords** for email/password accounts
- **Enable 2FA** when available for additional security
- **Sign out** when using shared devices

### 📞 Getting Help

If you continue to experience issues:

1. **Check this troubleshooting guide** first
2. **Try the alternative sign-in methods**
3. **Contact our support team** with specific error details
4. **Include your browser and device information** when reporting issues

---

**Last updated:** January 2024  
**Version:** 1.0
