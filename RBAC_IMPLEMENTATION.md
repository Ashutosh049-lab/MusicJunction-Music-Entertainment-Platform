# Role-Based Access Control (RBAC) Implementation

## Overview
MusicJunction implements a comprehensive role-based access control system to ensure users can only perform actions appropriate to their role.

## User Roles

### 1. **Listener** (Default)
- Can browse and stream music
- Can create and manage playlists
- Can like/unlike tracks and playlists
- Can comment on tracks
- Can follow other users
- **CANNOT** upload music or create projects
- **CANNOT** use mixing/mastering tools

### 2. **Musician**
- All listener permissions, plus:
- **CAN** upload music tracks (local files)
- **CAN** link Spotify tracks to library
- **CAN** delete their own tracks
- **CAN** create collaborative projects
- **CAN** use mixing/mastering tools

### 3. **Producer**
- All listener permissions, plus:
- **CAN** create collaborative projects
- **CAN** use mixing/mastering tools
- Focused on production and collaboration

### 4. **Label**
- All listener permissions, plus:
- **CAN** create collaborative projects
- **CAN** use mixing/mastering tools
- Focused on managing artists and releases

## Protected Endpoints

### Music Upload & Management
```javascript
POST   /api/music/upload              → [musician only]
POST   /api/music/spotify/link        → [musician only]
DELETE /api/music/:id                 → [musician only]
```

### Mix & Master
```javascript
POST   /api/mix                       → [musician, producer, label]
```

### Project Management
```javascript
POST   /api/projects                  → [authenticated users]
GET    /api/projects                  → [authenticated users]
POST   /api/projects/:id/invite       → [authenticated users, owner only]
DELETE /api/projects/:id/collaborators/:userId → [authenticated users, owner only]
```

### Public Endpoints (No Auth Required)
```javascript
GET    /api/music                     → Public
GET    /api/music/:id                 → Public
GET    /api/music/stream/:id          → Public
GET    /api/music/spotify/search      → Public
GET    /api/playlists                 → Public
```

### Authenticated Endpoints (All Roles)
```javascript
POST   /api/music/:id/like            → Authenticated
POST   /api/playlists                 → Authenticated
POST   /api/comments                  → Authenticated
POST   /api/ratings                   → Authenticated
```

## Implementation

### 1. Auth Middleware (`middlewares/auth.js`)
Validates JWT tokens and extracts user information:
```javascript
req.user = { 
  id: decoded.id, 
  role: decoded.role, 
  email: decoded.email 
}
```

### 2. Role Check Middleware (`middlewares/checkRole.js`)
Restricts access based on user role:
```javascript
const checkRole = (roles = []) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    if (!roles.includes(userRole))
      return res.status(403).json({ message: "Access denied" });
    next();
  };
};
```

### 3. Usage in Routes
```javascript
// Require authentication only
router.post("/", auth, controller.action);

// Require authentication + specific role(s)
router.post("/upload", auth, checkRole(["musician"]), upload.single("music"), controller.uploadTrack);

// Multiple roles allowed
router.post("/mix", auth, checkRole(["musician", "producer", "label"]), upload.array("stems", 16), controller.mix);
```

## User Model Role Definition
```javascript
role: { 
  type: String, 
  enum: ['musician', 'listener', 'producer', 'label'], 
  default: 'listener' 
}
```

## Security Features

### ✅ Implemented
- JWT-based authentication
- Role-based authorization
- Token expiration
- Password hashing (not shown but assumed)
- Account locking after failed login attempts
- File type validation for uploads
- File size limits

### 🔒 Best Practices
- Tokens stored in Authorization header
- Middleware applied consistently
- Roles validated on every protected request
- Owner-only operations for projects and playlists
- Public endpoints clearly separated

## Testing RBAC

### Test as Listener (Should Fail)
```bash
# Try to upload music (should get 403 Forbidden)
curl -X POST http://localhost:5000/api/music/upload \
  -H "Authorization: Bearer <listener_token>" \
  -F "music=@track.mp3" \
  -F "title=Test" \
  -F "artist=Artist" \
  -F "genre=Rock"
```

### Test as Musician (Should Success)
```bash
# Upload music (should succeed)
curl -X POST http://localhost:5000/api/music/upload \
  -H "Authorization: Bearer <musician_token>" \
  -F "music=@track.mp3" \
  -F "title=Test" \
  -F "artist=Artist" \
  -F "genre=Rock"
```

## Error Responses

### 401 Unauthorized (No/Invalid Token)
```json
{
  "message": "Missing or invalid Authorization header"
}
```

### 403 Forbidden (Insufficient Permissions)
```json
{
  "message": "Access denied"
}
```

## Summary

The RBAC system ensures:
- ✅ **Listeners cannot upload music** - Protected by `checkRole(['musician'])`
- ✅ **Listeners cannot access mixing tools** - Protected by `checkRole(['musician', 'producer', 'label'])`
- ✅ **Only owners can modify their resources** - Additional ownership checks in controllers
- ✅ **Public content remains accessible** - No auth on GET endpoints for browsing
- ✅ **All state-changing operations require authentication** - Auth middleware on all POST/PUT/DELETE

This implementation provides a secure, scalable foundation for role-based access control while maintaining a good user experience for all user types.
