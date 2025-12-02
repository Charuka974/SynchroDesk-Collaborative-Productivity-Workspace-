import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import { getUsersAPI, getMessagesAPI, sendMessageAPI, type IUser, type IMessage, type IWorkspace, getGroupMessagesAPI } from "../services/message";
import { connectSocket, getSocket } from "../lib/messagesocket";
import type { Socket } from "socket.io-client";

interface ChatContextType {
  messages: IMessage[];
  users: IUser[];
  workspaces: IWorkspace[];
  selectedUser: IUser | null;
  selectedWorkspace: IWorkspace | null; // New state
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  setSelectedUser: (user: IUser | null) => void;
  setSelectedWorkspace: (workspaces: IWorkspace | null) => void;
  fetchUsers: () => void;
  fetchMessages: (userId: string) => void;
  fetchGroupMessages: (workspaceId: string) => void;
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
  const [workspaces, setWorkspaces] = useState<IWorkspace[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<IWorkspace | null>(null); // New state
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!currentUser) return;

    const initSocket = async () => {
      try {
        await connectSocket(currentUser._id); // wait for socket to connect
        const s = getSocket(); // now safe to get the socket instance
        setSocket(s);
      } catch (err) {
        toast.error("Failed to connect to chat server");
        console.error(err);
      }
    };

    initSocket();
  }, [currentUser]);

  // Fetch all users except the current user
  const fetchUsers = async () => {
    setIsUsersLoading(true);
    try {
      // const data = await getUsersAPI();
      // setUsers(data.filter(u => u._id !== currentUser._id));

      const { users, workspaces } = await getUsersAPI();
      setUsers(users.filter(u => u._id !== currentUser._id));
      setWorkspaces(workspaces);

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

  const fetchGroupMessages = async (workspaceId: string) => {
    setIsMessagesLoading(true);
    try {
      const data = await getGroupMessagesAPI(workspaceId);
      setMessages(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch messages");
    } finally {
      setIsMessagesLoading(false);
    }
  };

  // Send a new message
  // const sendMessage = async (messageData: { text?: string; image?: string; file?: string; audio?: string }) => {
  //   if (!selectedUser || !socket) return;

  //   try {
  //     const newMessage = await sendMessageAPI(selectedUser._id, messageData);

  //     // Update local state immediately
  //     setMessages(prev => [...prev, newMessage]);

  //     // Emit via socket for real-time update
  //     socket.emit("sendMessage", newMessage);
  //   } catch (err: any) {
  //     toast.error(err?.response?.data?.message || "Failed to send message");
  //   }
  // };

  const sendMessage = async (messageData: {text?: string; image?: string; file?: string; audio?: string;}) => {
    if (!socket) return;

    try {
      let newMessage;

      // Case 1 → user chat
      if (selectedUser) {
        newMessage = await sendMessageAPI({
          receiverId: selectedUser._id,
          ...messageData,
        });
      }

      // Case 2 → workspace chat
      else if (selectedWorkspace) {
        newMessage = await sendMessageAPI({
          workspaceId: selectedWorkspace._id,
          ...messageData,
        });
      } else {
        return;
      }

      setMessages(prev => [...prev, newMessage]);
      socket.emit("sendMessage", newMessage);

    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  };


  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: IMessage) => {
      if (
        selectedUser &&
        (newMessage.senderId._id === selectedUser._id || newMessage.receiverId === selectedUser._id)
      ) {
        setMessages(prev => [...prev, newMessage]);
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [selectedUser, socket]);

  // Initial fetch of users
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        workspaces, // added later
        selectedUser,
        selectedWorkspace,
        isUsersLoading,
        isMessagesLoading,
        setSelectedUser,
        setSelectedWorkspace,
        fetchUsers,
        fetchMessages,
        fetchGroupMessages,
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
