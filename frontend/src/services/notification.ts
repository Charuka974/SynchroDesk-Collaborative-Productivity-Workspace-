import api from "./api";

// ─────────────────────────────
// NOTIFICATION SERVICES
// ─────────────────────────────

// Get all notifications
export const getMyNotificationsAPI = async () => {
  const res = await api.get("/notifications");
  return res.data;
};

// Get unread count
export const getUnreadCountAPI = async () => {
  const res = await api.get("/notifications/unread/count");
  return res.data;
};

// Mark a notification as read
export const markAsReadAPI = async (notificationId: string) => {
  const res = await api.put(`/notifications/read/${notificationId}`);
  return res.data;
};

// Mark all notifications as read
export const markAllAsReadAPI = async () => {
  const res = await api.put("/notifications/read-all");
  return res.data;
};

// Delete a notification
export const deleteNotificationAPI = async (notificationId: string) => {
  const res = await api.delete(`/notifications/${notificationId}`);
  return res.data;
};
