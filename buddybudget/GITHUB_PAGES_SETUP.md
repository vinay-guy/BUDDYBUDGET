# 🌐 GitHub Pages Setup Guide

## ✅ Files Prepared
I've created a `docs` folder with all your frontend files. This is ready for GitHub Pages!

## 📋 Steps to Enable GitHub Pages

### 1. Go to Your Repository Settings
Visit: **https://github.com/vinay-guy/BUDDYBUDGET**

### 2. Navigate to Pages Settings
- Click on **"Settings"** tab (top right of your repo)
- Scroll down and click **"Pages"** in the left sidebar

### 3. Configure Source
Under "Build and deployment":
- **Source**: Select **"Deploy from a branch"**
- **Branch**: Select **"main"**
- **Folder**: Select **"/docs"** (this is important!)
- Click **"Save"**

### 4. Wait for Deployment
- GitHub will take 1-2 minutes to build and deploy
- You'll see a message: "Your site is live at..."
- Refresh the page after a minute to see the URL

## 🎉 Your Live Website URL

Once deployed, your website will be available at:
**https://vinay-guy.github.io/BUDDYBUDGET/**

## 🔍 Verify Deployment

After enabling Pages:
1. Go back to the "Pages" settings page
2. You should see a green checkmark and your live URL
3. Click the URL to visit your live website!

## 🚀 Future Updates

Whenever you update your frontend:
1. Make changes in the `frontend` folder
2. Copy to `docs` folder: `xcopy /E /I /Y frontend docs`
3. Commit and push:
   ```bash
   git add docs
   git commit -m "Update website"
   git push
   ```
4. GitHub Pages will automatically redeploy (takes 1-2 minutes)

## 🛠️ Troubleshooting

**If the site doesn't load:**
- Make sure you selected `/docs` folder (not root)
- Check that `index.html` exists in the docs folder
- Wait 2-3 minutes for initial deployment
- Clear your browser cache

**If styles don't load:**
- Check that CSS paths are relative (they are in your case)
- Ensure all assets are in the docs folder

## 📝 Note
The backend (Java/Spring Boot) won't run on GitHub Pages as it only hosts static files. You'll need a separate hosting service for the backend (like Heroku, Railway, or AWS).
