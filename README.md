# MusicJunction 🎵

A full-stack music entertainment platform that connects musicians and listeners through seamless audio streaming, collaborative projects, and AI-powered features.

## 🌟 Features

- **User Authentication** - Secure registration and login with JWT and role-based access (Musician/Listener)
- **Music Streaming** - Upload, stream, and discover high-quality audio tracks
- **Playlist Management** - Create, share, and collaborate on playlists
- **Collaborative Workspaces** - Real-time project collaboration with WebSocket support
- **AI-Powered Mixer** - Enhance audio with AI-driven processing
- **Social Features** - Follow artists, like tracks, comment with timestamps
- **Activity Feed** - Stay updated with real-time notifications and user activities
- **Spotify Integration** - Search and link tracks from Spotify's catalog
- **Advanced Audio Player** - Waveform visualization, queue management, and playback controls
- **Rating System** - Rate and review tracks
- **Recommendation Engine** - Personalized music recommendations based on listening habits
- **Responsive Design** - Optimized experience across all devices

## 🌐 Live Demo

- **Frontend:** [https://shiny-jalebi-d5b170.netlify.app](https://shiny-jalebi-d5b170.netlify.app)
- **Backend:** [https://musicjunction-music-entertainment-zi65.onrender.com](https://musicjunction-music-entertainment-zi65.onrender.com)

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **React Router** - Navigation
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **WaveSurfer.js** - Audio waveform visualization
- **React Hook Form + Zod** - Form validation
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **WebSocket (ws)** - Real-time features
- **FFmpeg** - Audio processing
- **Spotify Web API** - Spotify integration

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas)
- **Git**
- **FFmpeg** (for audio processing)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/MusicJunction-Music-Entertainment-Platform.git
cd MusicJunction-Music-Entertainment-Platform
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` directory:

```env
PORT=8085
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8085/api
VITE_SOCKET_URL=http://localhost:8085
```

### 4. Running the Application

#### Option 1: Manual Start

**Terminal 1 - Backend:**
```bash
cd Backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8085

## 📁 Project Structure

```
MusicJunction-Music-Entertainment-Platform/
├── Backend/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   └── roleAuth.js        # Role-based authorization
│   ├── models/
│   │   ├── User.js
│   │   ├── Music.js
│   │   ├── Playlist.js
│   │   ├── Project.js
│   │   ├── Comment.js
│   │   ├── Rating.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── musicRoutes.js
│   │   ├── playlistRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── ratingRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── recommendationRoutes.js
│   │   ├── mixRoutes.js
│   │   └── userRoutes.js
│   ├── realtime/
│   │   └── ws.js              # WebSocket server
│   ├── app.js                 # Express app configuration
│   ├── index.js               # Entry point
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── _redirects         # Netlify SPA routing
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── music/
│   │   │   ├── notifications/
│   │   │   └── ui/
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Explore.tsx
│   │   │   ├── Upload.tsx
│   │   │   ├── TrackPage.tsx
│   │   │   ├── Playlists.tsx
│   │   │   ├── Projects.tsx
│   │   │   ├── Mixer.tsx
│   │   │   └── ...
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   └── playerStore.ts
│   │   ├── lib/
│   │   │   ├── axios.ts
│   │   │   ├── socket.ts
│   │   │   └── utils.ts
│   │   ├── hooks/
│   │   ├── router/
│   │   ├── types/
│   │   └── App.tsx
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── netlify.toml
│   └── package.json
├── netlify.toml
├── render.yaml
├── vercel.json
└── README.md
```

## 🔧 Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile
- `POST /api/auth/me/change-password` - Change password

### Music
- `GET /api/music` - Get all tracks
- `POST /api/music/upload` - Upload track (Musician only)
- `GET /api/music/:id` - Get track by ID
- `PUT /api/music/:id` - Update track
- `DELETE /api/music/:id` - Delete track
- `GET /api/music/stream/:id` - Stream audio
- `POST /api/music/:id/like` - Like/unlike track

### Playlists
- `GET /api/playlists` - Get user playlists
- `POST /api/playlists` - Create playlist
- `GET /api/playlists/:id` - Get playlist by ID
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist
- `POST /api/playlists/:id/tracks` - Add track to playlist
- `DELETE /api/playlists/:id/tracks/:trackId` - Remove track
- `POST /api/playlists/:id/follow` - Follow/unfollow playlist
- `POST /api/playlists/:id/collaborators` - Add collaborator

### Projects
- `GET /api/projects` - Get user projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects/:id/invite` - Invite collaborator
- `DELETE /api/projects/:id/collaborators/:userId` - Remove collaborator

### Comments
- `GET /api/comments/music/:musicId` - Get track comments
- `POST /api/comments` - Add comment
- `POST /api/comments/:id/like` - Like comment

### Ratings
- `POST /api/ratings` - Rate a track
- `GET /api/ratings/music/:musicId` - Get track ratings

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/activity/public` - Get public activity feed
- `GET /api/notifications/activity/following` - Get following activity
- `GET /api/notifications/activity/trending` - Get trending activity

### Recommendations
- `GET /api/recommendations` - Get personalized recommendations
- `GET /api/recommendations/mood/:mood` - Get mood-based recommendations

### AI Mixer
- `POST /api/mix/enhance` - Enhance audio with AI
- `GET /api/mix/jobs/:id` - Get job status

### Users
- `GET /api/users/:id` - Get user profile
- `POST /api/users/:id/follow` - Follow/unfollow user

## 🔒 Environment Variables

### Backend Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `8085` |
| `MONGO_URL` | MongoDB connection string | `mongodb://localhost:27017/musicjunction` |
| `JWT_SECRET` | Secret key for JWT | `your-super-secret-key` |
| `NODE_ENV` | Environment | `development` or `production` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `SPOTIFY_CLIENT_ID` | Spotify API client ID | `your-spotify-client-id` |
| `SPOTIFY_CLIENT_SECRET` | Spotify API client secret | `your-spotify-client-secret` |

### Frontend Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8085/api` |
| `VITE_SOCKET_URL` | WebSocket server URL | `http://localhost:8085` |

## 🚢 Deployment

### Backend Deployment (Render)
The backend is deployed on **Render** at: https://musicjunction-music-entertainment-zi65.onrender.com

**Steps:**
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables (see table above)
6. Deploy!

Other supported platforms:
- Heroku
- Railway
- AWS Elastic Beanstalk

### Frontend Deployment (Netlify)
The frontend is deployed on **Netlify** at: https://shiny-jalebi-d5b170.netlify.app

**Steps:**
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Add environment variables in Netlify dashboard
4. The `_redirects` file handles SPA routing automatically

Other supported platforms:
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

**Deployment Configuration Files:**
- ✅ `netlify.toml` - Netlify configuration
- ✅ `vercel.json` - Vercel configuration
- ✅ `render.yaml` - Render configuration

## 🎨 Key Features Explained

### Audio Streaming
- Chunked streaming with range request support
- Waveform visualization with WaveSurfer.js
- Queue management and playback history
- Repeat and shuffle modes

### Collaboration
- Real-time project workspace with WebSocket
- Live chat for project collaborators
- File sharing and version control
- Role-based permissions

### AI Mixer
- Auto-mixing and level balancing
- Loudness optimization
- Noise reduction
- Vocal enhancement
- Job queue with status tracking

### Social Features
- Follow/unfollow artists
- Activity feed (public, following, trending)
- Timestamped comments on tracks
- Like tracks and comments
- Share tracks on social media

### Recommendations
- Personalized based on listening history
- Mood-based recommendations
- Collaborative filtering
- Genre and artist similarity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- GitHub: [@Ashutosh049-lab](https://github.com/Ashutosh049-lab)

## 🐛 Known Issues

- Large audio files may take time to process on free tier deployments
- Cold start delays on Render free tier (~30 seconds)
- WebSocket connections may disconnect after periods of inactivity

## 🔮 Future Enhancements

- [ ] Mobile apps (iOS/Android)
- [ ] Live streaming concerts
- [ ] NFT integration for exclusive tracks
- [ ] Advanced audio effects and filters
- [ ] Podcast support
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Social authentication (Google, Facebook, Spotify)

## 📧 Support

For support, open an issue in the repository or contact the maintainers.

---

Made with ❤️ by music lovers, for music lovers 🎵
