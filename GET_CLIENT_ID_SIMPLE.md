# 🔐 Get Google Client ID (5 Minutes)

## Why You Need This (One-Time Setup)

You're the **app owner**, so you need to register your app with Google once.

After this, **anyone** (including you) can just sign in with their Google account - no setup!

---

## 🚀 QUICK STEPS (5 Minutes)

### Step 1: Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### Step 2: Create New Project (or select existing)
1. Click the project dropdown at top
2. Click "New Project"
3. Name: `NodeNest`
4. Click "Create"
5. Wait 10 seconds for it to create

### Step 3: Create OAuth Client ID
1. Go to: **APIs & Services** → **Credentials**
   - Or visit: https://console.cloud.google.com/apis/credentials
   
2. Click: **Configure Consent Screen** (blue button)
   - Choose: **External**
   - Click: **Create**
   
3. Fill ONLY these fields:
   - **App name**: `NodeNest`
   - **User support email**: Your email
   - **Developer email**: Your email
   - Click **Save and Continue** (3 times)
   - Click **Back to Dashboard**

4. Go back to: **Credentials** tab

5. Click: **+ Create Credentials** → **OAuth client ID**

6. Choose: **Web application**

7. Add these URLs:

   **Authorized JavaScript origins:**
   ```
   https://ravenxrich.github.io
   ```
   
   **Authorized redirect URIs:**
   ```
   https://ravenxrich.github.io/NodeNest
   ```

8. Click **Create**

9. **COPY THE CLIENT ID** (looks like: `123456-abc.apps.googleusercontent.com`)

---

## ✅ Now Give Me The Client ID

Paste it here, and I'll:
1. Add it to your app
2. Rebuild
3. Push to GitHub
4. Google sign-in will work!

**After this, you just sign in with your Google account - that's it!**

---

## 🎯 What This Does

Once I add the Client ID:
- ✅ You click "Sign in with Google"
- ✅ Google popup appears
- ✅ You sign in with your email/password
- ✅ You're logged in!
- ✅ Your data syncs to Google Drive

**No Client ID setup for users - just you (the owner) once!**

---

## 💡 Think of it Like This

- **App Owner (you)**: Register the app with Google once
- **Users (you + others)**: Just sign in with Google account
- **Client ID**: Your app's "registration number" with Google

It's like registering a business - you do it once, then customers just use it!

---

## ⚡ Once I Add The Client ID

Your app will work like this:

1. User visits site
2. Clicks "Sign in with Google"
3. Signs in with their Google account
4. Uses the app with cloud storage
5. Data syncs automatically

**No setup for users - they just sign in!**

---

**Get the Client ID and paste it here - I'll add it to the app!**
