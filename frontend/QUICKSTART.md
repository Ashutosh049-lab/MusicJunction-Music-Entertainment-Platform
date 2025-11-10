# 🚀 MusicJunction Frontend - Quick Start

## Installation

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

Visit `http://localhost:5173`

## Available Routes

### Public
- `/` - Landing page
- `/explore` - Browse music
- `/track/:id` - Track details
- `/login` - Login
- `/register` - Register

### Protected (requires login)
- `/dashboard` - User dashboard
- `/upload` - Upload tracks
- `/playlists` - Manage playlists
- `/mixer` - AI mixer
- `/projects` - Collaboration projects
- `/projects/:id` - Project workspace

## Environment Setup

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── layout/       # Navbar, PlayerBar
│   └── ...
├── pages/           # Route pages
├── store/           # Zustand stores
├── lib/             # Axios, Socket.io
├── router/          # React Router
└── styles/          # Global CSS
```

## Key Features

✅ Auth with JWT + token refresh  
✅ Global audio player with queue  
✅ Light/Dark theme toggle  
✅ Protected routes  
✅ Socket.io ready  
✅ Responsive design  

## Tech Stack

- React 18 + TypeScript
- Vite
- React Router v6
- Zustand
- Tailwind CSS v4
- Framer Motion
- Axios + Socket.io
- Lucide Icons

## Next: Build Features

See `PROJECT_STATUS.md` for implementation roadmap.
