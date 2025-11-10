import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Music, Home, Compass, Upload, Headphones, Layers, User, LogOut, Moon, Sun, Activity, Settings, Radio, Menu, X, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useState, useEffect, useRef } from 'react';
import NotificationDropdown from '../notifications/NotificationDropdown';
import Avatar from '../ui/Avatar';

const linkBase = 'flex items-center gap-1 text-sm transition px-3 py-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary border-b-2 border-transparent';
const inactiveLink = 'text-foreground/80 hover:text-primary hover:bg-secondary/60';
const activeLink = 'text-primary bg-primary/10 border-primary ring-1 ring-primary/30 shadow-sm';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Persist and initialize theme from localStorage or system preference
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldDark = stored ? stored === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', shouldDark);
    setIsDark(shouldDark);
  }, []);

  useEffect(() => {
    // Close mobile menu on route change
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  // Close user menu on outside click or Escape
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!userMenuOpen) return;
      const el = userMenuRef.current;
      if (el && !el.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [userMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = (username?: string) => {
    if (!username) return undefined;
    const parts = username.split(/[^A-Za-z]+/).filter(Boolean);
    const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase());
    return letters.join('') || username[0]?.toUpperCase();
  };

  const renderLink = (to: string, Icon: any, label: string) => (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <nav role="navigation" aria-label="Main" className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Left: Mobile menu + Logo */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              className="md:hidden p-2 rounded-md hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link to="/" className="flex items-center gap-2 text-primary min-w-0">
              <Music className="h-8 w-8 shrink-0" />
              {/* Hide long brand text on very small screens to prevent horizontal overflow */}
              <span className="font-display text-xl font-bold truncate hidden sm:inline">MusicJunction</span>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-4">
            {renderLink('/', Home, 'Home')}
            {renderLink('/explore', Compass, 'Explore')}
            {renderLink('/activity', Activity, 'Activity')}
            {isAuthenticated && (
              <>
                {renderLink('/dashboard', User, 'Dashboard')}
                {user?.role === 'musician' && renderLink('/upload', Upload, 'Upload')}
                {renderLink('/projects', Layers, 'Projects')}
                {renderLink('/mixer', Headphones, 'Mixer')}
                {renderLink('/settings', Settings, 'Settings')}
                {renderLink('/spotify', Radio, 'Spotify')}
              </>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-secondary transition focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {isAuthenticated ? (
              <>
                <NotificationDropdown />
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                    className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Avatar size="sm" fallback={initials(user?.username)} />
                    <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:inline" aria-hidden="true" />
                    <span className="sr-only">Open user menu</span>
                  </button>

                  {/* User Menu Dropdown */}
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-64 z-50 overflow-hidden rounded-lg border border-white/10 shadow-2xl backdrop-blur-0" style={{ backgroundColor: 'hsl(var(--card))' }}>
                        <div className="px-4 py-3 border-b bg-card">
                          <p className="text-sm font-medium truncate leading-normal" title={user?.username}>{user?.username}</p>
                          <p className="text-xs text-muted-foreground capitalize truncate leading-normal" title={user?.role}>{user?.role}</p>
                        </div>
                        <nav className="py-1 flex flex-col space-y-1" role="menu">
                          <Link to="/dashboard" className="block w-full px-4 py-2 text-sm text-left hover:bg-secondary/60" role="menuitem">Dashboard</Link>
                          <Link to="/settings" className="block w-full px-4 py-2 text-sm text-left hover:bg-secondary/60" role="menuitem">Settings</Link>
                          <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-left hover:bg-secondary/60 text-red-500" role="menuitem">
                            <LogOut className="h-4 w-4" /> Logout
                          </button>
                        </nav>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              // Hide auth CTAs on small screens; they are available in the mobile menu panel below.
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium hover:text-primary transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="px-4 py-3 grid gap-2">
              {renderLink('/', Home, 'Home')}
              {renderLink('/explore', Compass, 'Explore')}
              {renderLink('/activity', Activity, 'Activity')}
              {isAuthenticated ? (
                <>
                  {renderLink('/dashboard', User, 'Dashboard')}
                  {user?.role === 'musician' && renderLink('/upload', Upload, 'Upload')}
                  {renderLink('/projects', Layers, 'Projects')}
                  {renderLink('/mixer', Headphones, 'Mixer')}
                  {renderLink('/settings', Settings, 'Settings')}
                  {renderLink('/spotify', Radio, 'Spotify')}
                  <button
                    onClick={handleLogout}
                    className="mt-1 w-full text-left px-2 py-2 text-sm rounded-md hover:bg-secondary transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid gap-2">
                  <Link to="/login" className={`${linkBase} ${inactiveLink}`}>Login</Link>
                  <Link to="/register" className="px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md text-center">
                    Join Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
