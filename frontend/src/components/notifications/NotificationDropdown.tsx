import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../lib/axios';
import { formatTimeAgo } from '../../lib/utils';
import { useNotifications } from '../../hooks/useSocket';

interface Notification {
  _id: string;
  type: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Real-time notifications via Socket.io
  useNotifications((notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Outside click + Escape to close (mirrors user menu behavior)
  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const el = rootRef.current;
      if (el && !el.contains(e.target as Node)) setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const { data } = await apiClient.get('/notifications');
      
      // Handle different response formats
      let notificationsList: Notification[] = [];
      
      if (data.success && Array.isArray(data.data)) {
        notificationsList = data.data;
      } else if (Array.isArray(data.notifications)) {
        notificationsList = data.notifications;
      } else if (Array.isArray(data)) {
        notificationsList = data;
      }
      
      setNotifications(notificationsList);
      const unread = notificationsList.filter((n: Notification) => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Set empty array on error to prevent crashes
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiClient.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: any = {
      comment: '💬',
      like: '❤️',
      follow: '👤',
      collaboration: '🤝',
      release: '🎵',
    };
    return icons[type] || '🔔';
  };

  return (
    <div className="relative" ref={rootRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-secondary transition"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-96 z-50 max-h-[32rem] flex flex-col overflow-hidden rounded-lg border border-white/10 shadow-2xl backdrop-blur-0" style={{ backgroundColor: 'hsl(var(--card))' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-lg">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto flex-1">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 border-b hover:bg-secondary/50 transition cursor-pointer ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification._id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="h-2 w-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No notifications yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
