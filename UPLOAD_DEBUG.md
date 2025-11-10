# Upload Debugging Guide

## Current Issues:
1. **Upload fails with 500 error**
2. **Cannot play uploaded tracks**

## Step-by-Step Debugging:

### 1. Check Backend Logs on Render

Go to: https://dashboard.render.com/
- Select your backend service
- Click "Logs" tab
- Try uploading
- Look for these error patterns:

```
- "Upload Error Details:" → Shows the exact error
- "MongoServerError" → Database connection issue
- "ValidationError" → Required field missing
- "ENOENT" or "EACCES" → File system permission issue
```

### 2. Check Browser Network Tab

**During Upload:**
1. Open DevTools (F12)
2. Network tab
3. Try upload
4. Click failed "upload" request
5. Check Response tab for error details

**During Playback:**
1. Check if file URL loads: `https://musicjunction-music-entertainment-zi65.onrender.com/uploads/[filename].mp3`
2. If 404 → File doesn't exist
3. If CORS error → CORS headers missing
4. If network error → File deleted/server down

### 3. Test Backend Endpoints Manually

**Test Health:**
```
https://musicjunction-music-entertainment-zi65.onrender.com/health
```
Should show: `"status": "ok"` and database connected

**Test Auth:**
Login first, then test with your token:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://musicjunction-music-entertainment-zi65.onrender.com/api/music
```

### 4. Common Issues & Fixes:

#### Issue: "uploadedBy is required"
**Fix:** Token is invalid or user ID not in token
- Check if JWT_SECRET matches on Render
- Re-login to get fresh token

#### Issue: "uploads folder not found"
**Fix:** Already added folder creation code
- Verify it's deployed: Check recent commits on Render

#### Issue: "duration is required"
**Fix:** Already made duration optional with default 0
- Verify model change deployed

#### Issue: Files disappear after playing
**Cause:** Render free tier doesn't persist files
**Fix:** Need to add persistent disk or use cloud storage (Cloudinary/S3)

### 5. Quick Test Upload (Postman/Curl)

If you have Postman, test the endpoint directly:

**POST** `https://musicjunction-music-entertainment-zi65.onrender.com/api/music/upload`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Body (form-data):**
```
music: [select an audio file]
title: Test Track
artist: Test Artist
genre: Pop
duration: 180
```

If this works → Frontend issue
If this fails → Backend issue

### 6. Environment Variables Check

On Render, verify these are set:
- ✅ `MONGO_URL` → MongoDB connection string
- ✅ `JWT_SECRET` → Must match what frontend uses
- ✅ `FRONTEND_URL` → `https://shiny-jalebi-d5b170.netlify.app`
- ✅ `NODE_ENV` → `production`

### 7. Database Connection

Most common cause of 500 errors is database issues:
- Is MongoDB Atlas accessible?
- Is IP whitelist allowing Render?
- Is database connection string correct?

## Next Steps:

**Please provide:**
1. Screenshot/copy of Render logs when upload fails
2. Screenshot/copy of browser Network Response when upload fails
3. Result of visiting: `https://musicjunction-music-entertainment-zi65.onrender.com/health`

This will tell me the EXACT issue so I can fix it properly.
