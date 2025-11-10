import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Save } from 'lucide-react';
import axios from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

const ProfileSettings = () => {
  const { user, setUser } = useAuthStore();
  
  // Profile form
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || ''
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setProfileLoading(true);
      const response = await axios.put('/auth/me', profileData);
      
      if (response.data.user) {
        setUser(response.data.user);
        toast.success('Profile updated successfully!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    try {
      setPasswordLoading(true);
      const response = await axios.post('/auth/me/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.message) {
        toast.success(response.data.message);
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Profile Information</h2>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-3xl font-bold">
                {profileData.avatarUrl ? (
                  <img
                    src={profileData.avatarUrl}
                    alt={profileData.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  profileData.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Avatar URL</label>
                <input
                  type="url"
                  value={profileData.avatarUrl}
                  onChange={(e) => setProfileData({ ...profileData, avatarUrl: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 placeholder:text-foreground/80 shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background focus:border-primary"
                  placeholder="https://example.com/avatar.jpg"
                />
                <p className="text-xs text-muted-foreground mt-1">Enter a URL to your profile picture</p>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 placeholder:text-foreground/80 shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background focus:border-primary"
                required
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 placeholder:text-foreground/80 shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background focus:border-primary resize-none"
                rows={4}
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-background border border-border rounded-lg px-4 py-3 opacity-50 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </motion.div>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-lg p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Change Password</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Old Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Current Password</label>
              <input
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 placeholder:text-foreground/80 shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background focus:border-primary"
                required
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 placeholder:text-foreground/80 shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background focus:border-primary"
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground mt-1">Must be at least 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 placeholder:text-foreground/80 shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background focus:border-primary"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="w-5 h-5" />
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-lg p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold mb-4">Account Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID:</span>
              <span className="font-mono">{user?._id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role:</span>
              <span className="capitalize">{user?.role || 'User'}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSettings;
