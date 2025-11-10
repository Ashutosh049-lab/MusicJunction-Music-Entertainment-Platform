# 🧪 MusicJunction Frontend - Testing Guide

## 🚀 Start Development

```bash
npm run dev
```
Open `http://localhost:5173`

---

## 📋 Features to Test

### 1. **Landing Page** (/)
- ✅ Animated hero section
- ✅ Feature cards
- ✅ CTA buttons (Join Now, Explore Music)
- ✅ Theme toggle (moon/sun icon in navbar)

### 2. **Authentication**

#### Register (/register)
- ✅ Username field
- ✅ Email field
- ✅ Password field (min 6 chars)
- ✅ Role selection (Musician/Listener)
- ✅ Form validation
- ✅ Redirect to dashboard after success

#### Login (/login)
- ✅ Email field
- ✅ Password field
- ✅ Remember me checkbox
- ✅ Forgot password link
- ✅ Redirect to dashboard after success

### 3. **Upload Track** (/upload) 🎯 NEW!
**Test Flow:**
1. Click "Upload" in navbar or "Upload Track" in dashboard
2. **Drag & drop** an MP3/WAV file OR click "Choose File"
3. See waveform preview appear
4. Fill in:
   - Title (required)
   - Genre (dropdown)
   - Description (optional)
5. Click "Upload Track"
6. Watch progress bar
7. Redirects to track page

**What to Test:**
- ✅ Drag-and-drop works
- ✅ File validation (try non-audio file)
- ✅ Size validation (try >50MB file)
- ✅ Waveform renders correctly
- ✅ Form validation errors
- ✅ Progress bar updates
- ✅ Success toast notification

### 4. **Track Page** (/track/:id) 🎯 NEW!
**Test Flow:**
1. Navigate to any track (after upload or from dashboard)
2. See track details with cover art
3. Click Play button
4. See waveform visualization
5. Rate the track (1-5 stars)
6. Add a comment
7. Like the track
8. Click Share button

**What to Test:**
- ✅ Play/Pause integration with bottom player
- ✅ Waveform renders and syncs
- ✅ Star rating clickable
- ✅ Comment submission
- ✅ Threaded replies
- ✅ Like button toggles
- ✅ Share copies link or opens native share
- ✅ Related tracks sidebar
- ✅ Responsive layout

### 5. **Dashboard** (/dashboard) 🎯 NEW!
**Test Flow:**
1. Navigate to /dashboard
2. See stats cards (tracks, plays, likes, followers)
3. Click "Upload Track" quick action
4. View your tracks list
5. Click Play on a track
6. Click Edit/Delete on a track

**What to Test:**
- ✅ Stats display correctly
- ✅ Quick actions navigate correctly
- ✅ Track list shows all your tracks
- ✅ Play button integrates with player
- ✅ Delete confirmation dialog
- ✅ Delete removes track from list
- ✅ Empty state shows when no tracks
- ✅ Projects section (if you have projects)

### 6. **Global Player** (Bottom Bar)
**Test Flow:**
1. Play any track from dashboard or track page
2. Use controls:
   - Play/Pause
   - Previous/Next
   - Seek by clicking progress bar
   - Volume slider
   - Repeat button (off → one → all)
   - Shuffle button

**What to Test:**
- ✅ Player appears when track plays
- ✅ Track info shows (title, artist, cover)
- ✅ All controls work
- ✅ Progress bar updates in real-time
- ✅ Seek by clicking progress bar
- ✅ Volume slider changes volume
- ✅ Player persists across page navigation

### 7. **Theme Toggle**
- ✅ Click moon/sun icon in navbar
- ✅ Theme switches light ↔ dark
- ✅ All pages respect theme
- ✅ Theme colors update correctly

---

## 🔧 Backend Integration Tests

**When backend is ready:**

### Test API Calls
1. **Login/Register**
   - Open DevTools → Network tab
   - Try logging in
   - Check: POST `/api/auth/login` returns token

2. **Upload Track**
   - Upload a track
   - Check: POST `/api/music/upload` with multipart/form-data
   - Check: Progress events fire
   - Check: Redirects to `/track/:id`

3. **Track Page**
   - Visit a track
   - Check: GET `/api/tracks/:id` loads data
   - Click Like
   - Check: POST `/api/tracks/:id/like` toggles state
   - Add comment
   - Check: POST `/api/tracks/:id/comments` posts comment

4. **Dashboard**
   - Check: GET `/api/tracks/mine` loads your tracks
   - Check: GET `/api/users/me/stats` loads stats
   - Delete a track
   - Check: DELETE `/api/tracks/:id` removes it

### Test Socket.io
1. **Notifications**
   - Open two browser windows
   - Login as different users
   - Have User A like User B's track
   - Check: User B sees notification toast

2. **Chat** (when workspace is implemented)
   - Open project workspace
   - Two users in same project
   - Send message from User A
   - Check: User B sees message in real-time

---

## 🐛 Common Issues & Fixes

### Issue: Upload fails
**Check:**
- Backend is running
- CORS is configured
- Multipart middleware is set up
- File size limits in backend

### Issue: Waveform doesn't load
**Check:**
- Audio file is valid MP3/WAV
- Audio URL is accessible
- CORS headers allow audio loading
- Browser console for errors

### Issue: Player doesn't work
**Check:**
- Track has valid `audioUrl`
- Audio file is accessible
- Browser allows audio autoplay
- Check browser console

### Issue: Socket.io not connecting
**Check:**
- Backend Socket.io server is running
- VITE_SOCKET_URL in .env is correct
- Token is being passed in auth
- Check browser DevTools → Network → WS

---

## ✅ Checklist Before Production

- [ ] All API endpoints working
- [ ] Socket.io connected
- [ ] Audio playback works
- [ ] File upload works with progress
- [ ] Comments and ratings work
- [ ] Theme toggle works
- [ ] Mobile responsive
- [ ] Loading states show
- [ ] Error handling works
- [ ] Toast notifications appear
- [ ] Build completes: `npm run build`
- [ ] No console errors
- [ ] HTTPS in production
- [ ] Environment variables set

---

## 🎯 Manual Test Script

**Full Flow (5 minutes):**

1. Register new account → Dashboard appears
2. Click "Upload Track" → Upload a track
3. Fill form → Submit → Redirects to track page
4. Rate 5 stars → See rating update
5. Add comment "Great track!" → See comment appear
6. Click Like → Heart fills
7. Click Play → Bottom player appears
8. Go to Dashboard → See your track listed
9. Click Play on track → Player updates
10. Toggle theme → Colors change
11. Logout → Redirects to landing

**If all 11 steps pass: ✅ Ready for production!**

---

## 📞 Support

Need help?
- Check `IMPLEMENTATION_COMPLETE.md` for API contracts
- Check browser console for errors
- Check Network tab for failed requests
- Verify backend is running and CORS configured

**Happy testing! 🎵**
