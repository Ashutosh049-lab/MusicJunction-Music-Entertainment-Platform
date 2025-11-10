import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthGuard, GuestGuard, RoleGuard } from './guards';

// Layouts
import RootLayout from '../components/layout/RootLayout';

// Pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Upload from '../pages/Upload';
import TrackPage from '../pages/TrackPage';
import Explore from '../pages/Explore';
import Playlists from '../pages/Playlists';
import PlaylistDetail from '../pages/PlaylistDetail';
import Mixer from '../pages/Mixer';
import Workspace from '../pages/Workspace';
import Projects from '../pages/Projects';
import ProjectDetail from '../pages/ProjectDetail';
import ActivityFeed from '../pages/ActivityFeed';
import UserProfile from '../pages/UserProfile';
import ProfileSettings from '../pages/ProfileSettings';
import SpotifyIntegration from '../pages/SpotifyIntegration';
import DesignSystem from '../pages/DesignSystem';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Public routes
      {
        index: true,
        element: <Landing />,
      },
      {
        path: 'explore',
        element: <Explore />,
      },
      {
        path: 'track/:id',
        element: <TrackPage />,
      },
      {
        path: 'activity',
        element: <ActivityFeed />,
      },
      {
        path: 'user/:userId',
        element: <UserProfile />,
      },
      {
        path: 'design-system',
        element: <DesignSystem />,
      },
      
      // Guest only routes (redirects to dashboard if authenticated)
      {
        element: <GuestGuard />,
        children: [
          {
            path: 'login',
            element: <Login />,
          },
          {
            path: 'register',
            element: <Register />,
          },
        ],
      },
      
      // Protected routes (requires authentication)
      {
        element: <AuthGuard />,
        children: [
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          // Musician-only routes
          {
            element: <RoleGuard roles={['musician']} />,
            children: [
              {
                path: 'upload',
                element: <Upload />,
              },
            ],
          },
          {
            path: 'playlists',
            element: <Playlists />,
          },
          {
            path: 'playlists/:id',
            element: <PlaylistDetail />,
          },
          {
            path: 'mixer',
            element: <Mixer />,
          },
          {
            path: 'projects',
            element: <Projects />,
          },
          {
            path: 'projects/:id',
            element: <ProjectDetail />,
          },
          {
            path: 'settings',
            element: <ProfileSettings />,
          },
          {
            path: 'spotify',
            element: <SpotifyIntegration />,
          },
        ],
      },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
