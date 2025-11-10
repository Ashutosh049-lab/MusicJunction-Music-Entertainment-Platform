import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import MusicianDashboard from './MusicianDashboard';
import ListenerDashboard from './ListenerDashboard';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user) return null;

  return user.role === 'musician' ? <MusicianDashboard /> : <ListenerDashboard />;
};

export default Dashboard;
