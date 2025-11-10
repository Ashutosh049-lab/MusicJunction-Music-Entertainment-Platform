# CORS Fix for Netlify Frontend

## Problem
Your Netlify frontend (`https://shiny-jalebi-d5b170.netlify.app`) cannot access the backend due to CORS restrictions.

## Solution: Update Backend Environment Variable

### On Render Dashboard:

1. Go to https://dashboard.render.com/
2. Select your backend service: **musicjunction-music-entertainment-zi65**
3. Click **Environment** in the left sidebar
4. Add/Update environment variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://shiny-jalebi-d5b170.netlify.app`
5. Click **Save Changes**
6. Wait for automatic redeployment (~2-3 minutes)

### Test After Update:

1. Visit your frontend: https://shiny-jalebi-d5b170.netlify.app
2. Try to log in or register
3. The CORS error should be resolved

## Alternative: Allow All Origins (For Development Only)

If you want to temporarily allow all origins (NOT recommended for production):

Edit `Backend/app.js` line 29-34 to:

```javascript
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Musician-Key', 'x-musician-key', 'Range'],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
```

Then commit and push to trigger redeployment.

## Multiple Frontends

If you deploy to multiple platforms, add all URLs separated by comma in FRONTEND_URL:

```
FRONTEND_URL=https://shiny-jalebi-d5b170.netlify.app,https://your-app.vercel.app
```

Then update `app.js` to split them:

```javascript
const frontendUrls = process.env.FRONTEND_URL?.split(',') || [];
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://localhost:5173',
  'https://localhost:5174',
  ...frontendUrls
].filter(Boolean);
```
