import {
  createContext,
  useContext,
  useState,
  // useEffect,
  type ReactNode
} from "react";

import {
  getMyNotificationsAPI,
  getUnreadCountAPI,
  markAsReadAPI,
  markAllAsReadAPI,
  deleteNotificationAPI
} from "../services/notification";

export interface INotification {
  _id: string;
  userId: string;
  workspaceId?: string | null;
  type: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface NotificationsContextType {
  notifications: INotification[];
  unreadCount: number;
  loading: boolean;
  error?: string;

  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;

  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(
  undefined
);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  // ─────────────────────────────
  // Fetch all notifications
  // ─────────────────────────────
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getMyNotificationsAPI();
      setNotifications(data);
      setError(undefined);
    } catch (err: any) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────
  // Fetch unread count
  // ─────────────────────────────
  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadCountAPI();
      setUnreadCount(data.unread);
    } catch (err: any) {
      setError(err.message || "Failed to get unread count");
    }
  };

  // ─────────────────────────────
  // Mark single notification as read
  // ─────────────────────────────
  const markAsRead = async (id: string) => {
    try {
      await markAsReadAPI(id);

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );

      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err: any) {
      setError(err.message || "Failed to mark notification as read");
    }
  };

  // ─────────────────────────────
  // Mark all as read
  // ─────────────────────────────
  const markAllAsRead = async () => {
    try {
      await markAllAsReadAPI();

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err: any) {
      setError(err.message || "Failed to mark all notifications as read");
    }
  };

  // ─────────────────────────────
  // Delete a notification
  // ─────────────────────────────
  const deleteNotification = async (id: string) => {
    try {
      await deleteNotificationAPI(id);

      const wasUnread = notifications.find((n) => n._id === id)?.read === false;

      setNotifications((prev) => prev.filter((n) => n._id !== id));

      if (wasUnread) {
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete notification");
    }
  };

  // // Auto-load notifications on mount
  // useEffect(() => {
  //   fetchNotifications();
  //   fetchUnreadCount();
  // }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error("useNotifications must be used inside NotificationsProvider");
  return ctx;
};
