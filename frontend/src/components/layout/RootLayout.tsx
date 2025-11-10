import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import PlayerBar from './PlayerBar';
import { useAuthStore } from '../../store/authStore';
import { Toaster } from 'sonner';

const RootLayout = () => {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="content-wrapper">
        <Outlet />
      </main>
      <PlayerBar />
      <Toaster position="top-right" richColors />
    </div>
  );
};

export default RootLayout;
