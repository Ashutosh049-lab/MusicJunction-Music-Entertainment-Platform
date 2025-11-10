import { useEffect, useState } from 'react';
import { getSocket } from '../lib/socket';
import type { Socket } from 'socket.io-client';

interface UseSocketOptions {
  events?: Record<string, (...args: any[]) => void>;
  room?: string;
}

export const useSocket = (options?: UseSocketOptions) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = getSocket();
    
    if (!socketInstance) {
      return;
    }

    setSocket(socketInstance);
    setIsConnected(socketInstance.connected);

    // Connection event handlers
    const handleConnect = () => {
      setIsConnected(true);
      console.log('Socket connected');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    };

    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);

    // Join room if specified
    if (options?.room) {
      socketInstance.emit('join-room', options.room);
    }

    // Register custom event handlers
    if (options?.events) {
      Object.entries(options.events).forEach(([event, handler]) => {
        socketInstance.on(event, handler);
      });
    }

    return () => {
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);

      // Leave room if specified
      if (options?.room) {
        socketInstance.emit('leave-room', options.room);
      }

      // Unregister custom event handlers
      if (options?.events) {
        Object.keys(options.events).forEach((event) => {
          socketInstance.off(event);
        });
      }
    };
  }, [options?.room]);

  const emit = (event: string, ...args: any[]) => {
    if (socket && isConnected) {
      socket.emit(event, ...args);
    }
  };

  return {
    socket,
    isConnected,
    emit,
  };
};

// Hook for notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  const { emit } = useSocket({
    events: {
      'notification': (notification: any) => {
        setNotifications((prev) => [notification, ...prev]);
      },
    },
  });

  const markAsRead = (notificationId: string) => {
    emit('mark-notification-read', notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  return {
    notifications,
    markAsRead,
  };
};

// Hook for chat in collaboration workspace
export const useChat = (projectId?: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState<string[]>([]);

  const { emit, isConnected } = useSocket({
    room: projectId ? `project:${projectId}` : undefined,
    events: {
      'chat-message': (message: any) => {
        setMessages((prev) => [...prev, message]);
      },
      'user-typing': (data: { userId: string; username: string }) => {
        setIsTyping((prev) => [...prev, data.username]);
        setTimeout(() => {
          setIsTyping((prev) => prev.filter((u) => u !== data.username));
        }, 3000);
      },
    },
  });

  const sendMessage = (message: string) => {
    if (projectId) {
      emit('chat-message', {
        projectId,
        message,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const sendTyping = () => {
    if (projectId) {
      emit('user-typing', { projectId });
    }
  };

  return {
    messages,
    isTyping,
    sendMessage,
    sendTyping,
    isConnected,
  };
};

export default useSocket;
