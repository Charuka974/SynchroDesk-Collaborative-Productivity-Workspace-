import api from "./api";

export interface IUser {
  _id: string;
  name: string;
  email: string;
}

export interface IMessage {
  _id: string;
  senderId: string;
  receiverId?: string;
  text?: string;
  image?: string;
  file?: string;
  audio?: string;
  createdAt: string;
}

// Get all users except logged-in user
export const getUsersAPI = async (): Promise<IUser[]> => {
  const res = await api.get("/messages/users");
  return res.data;
};

// Get messages between logged-in user and another user
export const getMessagesAPI = async (userId: string): Promise<IMessage[]> => {
  const res = await api.get(`/messages/${userId}`);
  return res.data;
};

// Send a new message to a specific user
export const sendMessageAPI = async (
  receiverId: string,
  messageData: { text?: string; image?: string; file?: string; audio?: string }
): Promise<IMessage> => {
  const res = await api.post(`/messages/send/${receiverId}`, messageData);
  return res.data;
};
