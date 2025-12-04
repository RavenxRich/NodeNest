# 🔐 Fix Google OAuth for GitHub Pages

## ❌ ERROR: "Access blocked: Authorization Error"

This happens because Google Cloud Console doesn't have the correct redirect URI.

---

## ✅ STEP-BY-STEP FIX

### Step 1: Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account
3. Select your project (or create new one)

---

### Step 2: Enable Google+ API (if not enabled)

1. Go to: **APIs & Services** → **Library**
2. Search for: "Google+ API"
3. Click **Enable**

---

### Step 3: Configure OAuth Consent Screen

1. Go to: **APIs & Services** → **OAuth consent screen**
2. Choose: **External** (for public use)
3. Click **Create**

**Fill in**:
- **App name**: NodeNest
- **User support email**: Your email
- **App logo**: (optional)
- **App domain**: (leave blank for testing)
- **Authorized domains**: `github.io`
- **Developer contact**: Your email

Click **Save and Continue**

**Scopes**: Skip (click Save and Continue)

**Test users**: Add your email (for testing)

Click **Save and Continue** → **Back to Dashboard**

---

### Step 4: Create OAuth Client ID

1. Go to: **APIs & Services** → **Credentials**
2. Click: **+ Create Credentials** → **OAuth client ID**
3. **Application type**: Web application
4. **Name**: NodeNest GitHub Pages

**Authorized JavaScript origins**:
```
https://ravenxrich.github.io
```

**Authorized redirect URIs**:
```
https://ravenxrich.github.io/NodeNest
https://ravenxrich.github.io/NodeNest/
```

(Add both with and without trailing slash)

5. Click **Create**
6. **Copy the Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)

---

### Step 5: Update Your App

You need to rebuild the app with the correct Client ID.

**Option A: If you have the source code:**

1. Create `/app/frontend/.env`:
```bash
REACT_APP_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
PUBLIC_URL=/NodeNest
```

2. Rebuild:
```bash
cd /app/frontend
yarn build
```

3. Copy files:
```bash
cd /app
cp frontend/build/index.html index.html
cp frontend/build/index.html 404.html
cp -r frontend/build/static static/
```

4. Commit and push

**Option B: If you don't have source (use this for now):**

Your app may already have a placeholder Client ID. If not, I'll add it in the rebuild.

---

### Step 6: Test OAuth

1. Go to: `https://ravenxrich.github.io/NodeNest/`
2. Click "Get Started"
3. Click "Sign in with Google"
4. Should now work! ✅

---

## 🔍 TROUBLESHOOTING

### Still Getting "Access blocked"?

**Check 1: Authorized redirect URIs**
Make sure you added BOTH:
- `https://ravenxrich.github.io/NodeNest`
- `https://ravenxrich.github.io/NodeNest/`

**Check 2: Authorized JavaScript origins**
Make sure you added:
- `https://ravenxrich.github.io`

**Check 3: OAuth Consent Screen**
- Status should be "Testing" or "Published"
- Your email should be in test users

**Check 4: Client ID in App**
- Check if app has correct Client ID
- Look in browser console for Client ID value

---

## 🚨 COMMON ERRORS

### Error: "redirect_uri_mismatch"
**Fix**: Add exact URL to Authorized redirect URIs in Google Console

### Error: "invalid_client"
**Fix**: Check Client ID is correct in your app

### Error: "access_denied"
**Fix**: Check OAuth consent screen is configured and you're added as test user

---

## 📋 QUICK CHECKLIST

Before testing Google OAuth:

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] Test user (your email) added
- [ ] OAuth client ID created
- [ ] Authorized origins: `https://ravenxrich.github.io`
- [ ] Authorized redirects: `https://ravenxrich.github.io/NodeNest` and `https://ravenxrich.github.io/NodeNest/`
- [ ] Client ID copied
- [ ] App rebuilt with Client ID (if needed)
- [ ] Deployed to GitHub Pages

---

## 💡 FOR DEVELOPMENT

If testing locally (http://localhost:3000):

**Add these to Google Console**:

**Authorized JavaScript origins**:
```
http://localhost:3000
```

**Authorized redirect URIs**:
```
http://localhost:3000
```

---

## 🎯 WHAT GOOGLE OAUTH DOES

After setup:
1. User clicks "Sign in with Google"
2. Google popup opens
3. User selects Google account
4. User grants permissions
5. Google redirects back to your app
6. App gets user info and creates cloud storage

**Storage location**: Google Drive (NodeNest folder)

---

## ⚠️ IMPORTANT NOTES

1. **Testing Mode**: App starts in testing mode, limited to test users
2. **Publishing**: To make public, submit for Google verification (takes time)
3. **Alternative**: For now, just add test users (anyone you want to give access)
4. **Limits**: 100 test users maximum in testing mode

---

## 🔐 SECURITY

Your OAuth client ID is **public** (safe to commit to GitHub).
The client **secret** (if you have one) should **NEVER** be committed.

For client-side OAuth (like this app), you only need the Client ID.

---

## ✅ CURRENT CLIENT ID

Let me check if your app already has a Client ID configured...
