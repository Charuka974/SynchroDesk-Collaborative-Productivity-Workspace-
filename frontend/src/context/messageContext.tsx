import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import toast from "react-hot-toast";
import { getUsersAPI, getMessagesAPI, sendMessageAPI, type IUser, type IMessage } from "../services/message";
import { getSocket } from "../lib/messagesocket";
import type { Socket } from "socket.io-client";

interface ChatContextType {
  messages: IMessage[];
  users: IUser[];
  selectedUser: IUser | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  setSelectedUser: (user: IUser) => void;
  fetchUsers: () => void;
  fetchMessages: (userId: string) => void;
  sendMessage: (messageData: { text?: string; image?: string; file?: string; audio?: string }) => void;
}

interface ChatProviderProps {
  children: ReactNode;
  currentUser: IUser;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children, currentUser }: ChatProviderProps) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  const socket: Socket = getSocket();

  // Fetch all users except the current user
  const fetchUsers = async () => {
    setIsUsersLoading(true);
    try {
      const data = await getUsersAPI();
      setUsers(data.filter(u => u._id !== currentUser._id));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch users");
    } finally {
      setIsUsersLoading(false);
    }
  };

  // Fetch messages with a specific user
  const fetchMessages = async (userId: string) => {
    setIsMessagesLoading(true);
    try {
      const data = await getMessagesAPI(userId);
      setMessages(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch messages");
    } finally {
      setIsMessagesLoading(false);
    }
  };

  // Send a new message
  const sendMessage = async (messageData: { text?: string; image?: string; file?: string; audio?: string }) => {
    if (!selectedUser) return;

    try {
      const newMessage = await sendMessageAPI(selectedUser._id, messageData);

      // Update local state immediately for sender
      setMessages(prev => [...prev, newMessage]);

      // Emit message via socket for the receiver
      socket.emit("sendMessage", newMessage);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send message");
    }
  };

  // Listen for new messages globally
  useEffect(() => {
    const handleNewMessage = (newMessage: IMessage) => {
      // Only update if the conversation matches the selected user
      if (
        selectedUser &&
        (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id)
      ) {
        setMessages(prev => [...prev, newMessage]);
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [selectedUser]);

  // Initial fetch of users
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        selectedUser,
        isUsersLoading,
        isMessagesLoading,
        setSelectedUser,
        fetchUsers,
        fetchMessages,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
};
