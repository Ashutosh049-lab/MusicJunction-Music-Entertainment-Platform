import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';
import { Music, Loader2, User, Mail, Lock, Eye, EyeOff, Music3, Headphones, UserPlus } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'musician' | 'listener'>('listener');
  const [isLoading, setIsLoading] = useState(false);
  const [musicianKey, setMusicianKey] = useState('');
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score; // 0-4
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(email, password, name, role, role === 'musician' ? musicianKey : undefined);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['text-red-500', 'text-red-500', 'text-yellow-500', 'text-green-500', 'text-emerald-500'];
  const barColors = ['bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-dark-400 via-background to-dark-200 py-12 px-4">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Glow ring */}
        <div className="absolute -inset-0.5 -z-10 rounded-2xl bg-gradient-to-br from-primary/40 via-accent/30 to-transparent opacity-60 blur-xl" />

        <div className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-primary/10">
          <div className="flex items-center justify-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
              <Music className="h-8 w-8" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">Join MusicJunction</h1>
            <p className="text-muted-foreground">Create your account and start collaborating</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-background/80 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-transparent transition placeholder:text-muted-foreground/70"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-background/80 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-transparent transition placeholder:text-muted-foreground/70"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-3 bg-background/80 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-transparent transition placeholder:text-muted-foreground/70"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Strength meter */}
              {password.length > 0 && (
                <div className="mt-3">
                  <div className="flex gap-2">
                    {[0,1,2,3].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded ${i < strength ? barColors[Math.max(0, strength - 1)] : 'bg-muted'}`}
                      />
                    ))}
                  </div>
                  <p className={`mt-1 text-xs ${strengthColors[strength]}`}>{strengthLabels[strength]}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">I am a...</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('musician')}
                  className={`group p-4 border-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                    role === 'musician'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input hover:border-primary/50'
                  }`}
                >
                  <Music3 className="h-5 w-5" />
                  Musician
                </button>
                <button
                  type="button"
                  onClick={() => setRole('listener')}
                  className={`group p-4 border-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                    role === 'listener'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input hover:border-primary/50'
                  }`}
                >
                  <Headphones className="h-5 w-5" />
                  Listener
                </button>
              </div>
            </div>

            {role === 'musician' && (
              <div>
                <label htmlFor="musicianKey" className="block text-sm font-medium mb-2">
                  Musician Secret Key
                </label>
                <input
                  id="musicianKey"
                  type="password"
                  value={musicianKey}
                  onChange={(e) => setMusicianKey(e.target.value)}
                  required={role === 'musician'}
                  className="w-full px-4 py-3 bg-background/80 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-transparent transition placeholder:text-muted-foreground/70"
                  placeholder="Enter the secret key"
                />
                <p className="mt-1 text-xs text-muted-foreground">Required for musician signup. Ask your admin for this key.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold border-2 border-white/20 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:bg-primary/90 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 focus:ring-offset-background transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Register
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
