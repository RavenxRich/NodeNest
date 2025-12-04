# 🚀 DEPLOY TO GITHUB PAGES - STEP BY STEP

## 📋 STEP 1: PUSH TO GITHUB

Open your terminal and run these commands:

```bash
# Navigate to your project
cd /app

# Add all files
git add .

# Commit
git commit -m "Deploy NodeNest to GitHub Pages"

# Push to GitHub
git push origin main
```

**Expected output**:
```
Counting objects: 10, done.
Delta compression...
Writing objects: 100%
To https://github.com/YOUR_USERNAME/YOUR_REPO.git
   abc1234..def5678  main -> main
```

---

## 📋 STEP 2: ENABLE GITHUB PAGES

### 2.1 Open Your Repository
Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO`

### 2.2 Click "Settings" Tab
Look at the top menu:
```
Code | Issues | Pull requests | Actions | Projects | Security | Insights | Settings
                                                                              ↑ CLICK HERE
```

### 2.3 Click "Pages" in Left Sidebar
In the left sidebar, under "Code and automation", click:
```
General
Webhooks
Pages          ← CLICK HERE
Environments
```

### 2.4 Configure Source
Under "Build and deployment":

1. **Source**: Click the dropdown
2. Select: **GitHub Actions** (NOT "Deploy from a branch")
3. You should see:
   ```
   ✓ Source set to GitHub Actions
   ```

### 2.5 Save (Automatic)
No save button needed - it's automatic!

---

## 📋 STEP 3: WATCH DEPLOYMENT

### 3.1 Go to Actions Tab
Click the "Actions" tab at the top:
```
Code | Issues | Pull requests | Actions | Projects
                                  ↑ CLICK HERE
```

### 3.2 See Workflow Running
You'll see:
```
All workflows

○ Deploy to GitHub Pages
  Triggered by push to main
  In progress...
```

### 3.3 Wait ~30 Seconds
The deployment typically takes 20-40 seconds.

### 3.4 Check Status
When done, you'll see:
```
✓ Deploy to GitHub Pages
  Completed in 32s
```

---

## 📋 STEP 4: GET YOUR URL

### 4.1 Go Back to Settings → Pages
Navigate to: Settings → Pages (like before)

### 4.2 See Your Live URL
At the top, you'll see:
```
✓ Your site is live at https://YOUR_USERNAME.github.io/YOUR_REPO/
```

### 4.3 Click "Visit Site"
Click the URL or the "Visit site" button.

---

## 🎉 SUCCESS!

Your site is now live!

**URL Format**:
```
https://[YOUR_GITHUB_USERNAME].github.io/[YOUR_REPO_NAME]/
```

**Example**:
```
https://john.github.io/nodenest/
```

---

## ✅ VERIFY IT WORKS

### Test These Features:

1. **Landing Page**:
   - Visit your URL
   - Should see "NodeNest" landing page
   - Click "Get Started"

2. **Storage Selection**:
   - Should see storage options
   - Click "Folder Storage" or "Cloud Storage"

3. **Dashboard**:
   - Should see radial dashboard
   - Click "+ Add Tool"

4. **Add a Tool**:
   - Enter URL: `https://chat.openai.com`
   - Enter Title: `ChatGPT`
   - Description: `AI chatbot`
   - Click "Add Tool"

5. **Drag Node**:
   - Try dragging the tool node
   - Move it to different ring

6. **Delete Tag**:
   - Click on a tool node
   - See sidebar open
   - Click × on a tag

**If all work**: ✅ SUCCESS!

---

## 🔄 UPDATING YOUR SITE

To deploy changes in the future:

```bash
# Make your changes
# Then:

git add .
git commit -m "Update site"
git push origin main

# GitHub Actions auto-deploys!
# Wait 30 seconds
# Changes are live!
```

---

## 🚨 TROUBLESHOOTING

### Problem: "Actions" tab shows error

**Solution**:
1. Click on the failed workflow
2. Click on "deploy" job
3. Read the error message
4. Usually it's a file path issue

### Problem: 404 Error on Site

**Checklist**:
- [ ] Did you enable Pages? (Settings → Pages → GitHub Actions)
- [ ] Did workflow complete? (Actions tab shows ✓)
- [ ] Is URL correct? (includes username + repo name)
- [ ] Files at root? (`index.html` and `static/` at root)

**Fix**:
```bash
# Verify files are at root
ls /app/index.html
ls /app/static/

# Should show files, not errors
```

### Problem: Styles Not Loading

**Check**:
1. Press F12 in browser
2. Go to Console tab
3. Look for 404 errors
4. Check Network tab - CSS/JS loading?

**Usually**: Files are loading fine, just cached. Try Ctrl+F5 (hard refresh)

### Problem: Workflow Not Running

**Solution**:
1. Check `.github/workflows/deploy.yml` exists
2. Settings → Actions → General
3. Make sure Actions are enabled
4. "Allow all actions and reusable workflows" is selected

---

## 📞 QUICK REFERENCE

### Your Deployment Checklist:

1. ✅ Push to GitHub (`git push origin main`)
2. ✅ Settings → Pages → Source: GitHub Actions
3. ✅ Actions tab → Wait for ✓
4. ✅ Visit: `https://username.github.io/repo/`

### Important URLs:

**Your Repo**: `https://github.com/USERNAME/REPO`
**Settings**: `https://github.com/USERNAME/REPO/settings`
**Pages**: `https://github.com/USERNAME/REPO/settings/pages`
**Actions**: `https://github.com/USERNAME/REPO/actions`
**Your Site**: `https://USERNAME.github.io/REPO/`

---

## 🎯 SUMMARY

1. **Push**: `git push origin main`
2. **Enable**: Settings → Pages → GitHub Actions
3. **Wait**: ~30 seconds
4. **Visit**: Your live site!

**That's it!** 🚀

---

## 💡 PRO TIPS

### Tip 1: Bookmark Your URLs
Bookmark these for quick access:
- Your live site
- GitHub repo
- GitHub Pages settings

### Tip 2: Check Actions First
Before asking "why isn't it working?", check Actions tab for errors.

### Tip 3: Hard Refresh
If changes don't appear, try: `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)

### Tip 4: Use Private Window
Test in incognito/private window to avoid cache issues.

---

## ✅ READY TO DEPLOY!

Run these commands NOW:

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

Then enable Pages in GitHub settings.

**Your site will be live in 30 seconds!** 🎉
