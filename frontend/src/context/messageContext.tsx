import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import toast from "react-hot-toast";
import { Socket } from "socket.io-client";
import { getUsersAPI, getMessagesAPI, getGroupMessagesAPI, sendMessageAPI, type IUser, type IMessage, type IWorkspace } from "../services/message";
import { connectSocket } from "../lib/messagesocket";

interface ChatContextType {
  messages: IMessage[];
  users: IUser[];
  workspaces: IWorkspace[];
  selectedUser: IUser | null;
  selectedWorkspace: IWorkspace | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  setSelectedUser: (user: IUser | null) => void;
  setSelectedWorkspace: (workspace: IWorkspace | null) => void;
  fetchUsers: () => void;
  fetchMessages: (userId: string) => void;
  fetchGroupMessages: (workspaceId: string) => void;
  sendMessage: (messageData: { text?: string; image?: File; file?: File; audio?: File }) => void;
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
  const [selectedWorkspace, setSelectedWorkspace] = useState<IWorkspace | null>(null);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize socket
  useEffect(() => {
    if (!socket) {
      const s = connectSocket(currentUser._id);
      setSocket(s);
    }
  }, []);

  // Normalize senderId
  const getSenderId = (msg: IMessage) =>
    typeof msg.senderId === "string" ? msg.senderId : msg.senderId._id;

  const handleIncomingMessage = (msg: IMessage) => {
    // DM
    if (selectedUser) {
      const senderId = getSenderId(msg);
      if (senderId === selectedUser._id || msg.receiverId === selectedUser._id) {
        setMessages(prev => [...prev, msg]);
      }
    }
    // Workspace
    if (selectedWorkspace && msg.workspaceId === selectedWorkspace._id) {
      setMessages(prev => [...prev, msg]);
    }
  };

  // Socket listeners for DMs
  useEffect(() => {
    if (!socket) return;

    // Personal DM listener
    socket.on("receiveMessage", handleIncomingMessage);

    return () => {
      socket.off("receiveMessage", handleIncomingMessage);
    };
  }, [socket, selectedUser]);

  // Socket listener for selected workspace
  useEffect(() => {
    if (!socket || !selectedWorkspace) return;

    const workspaceChannel = `workspace-${selectedWorkspace._id}`;
    socket.on(workspaceChannel, handleIncomingMessage);

    return () => {
      socket.off(workspaceChannel, handleIncomingMessage);
    };
  }, [socket, selectedWorkspace]);


  // Fetch users
  const fetchUsers = async () => {
    setIsUsersLoading(true);
    try {
      const { users, workspaces } = await getUsersAPI();
      setUsers(users.filter(u => u._id !== currentUser._id));
      setWorkspaces(workspaces);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch users");
    } finally {
      setIsUsersLoading(false);
    }
  };

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

  const sendMessage = async (messageData: { text?: string; image?: File; file?: File; audio?: File }) => {
    if (!socket) return;

    try {
      let newMessage: IMessage | null = null;

      if (selectedUser) {
        newMessage = await sendMessageAPI({ receiverId: selectedUser._id, ...messageData });
      } else if (selectedWorkspace) {
        newMessage = await sendMessageAPI({ workspaceId: selectedWorkspace._id, ...messageData });
      }

      if (!newMessage) return;

      // setMessages(prev => [...prev, newMessage]);
      socket.emit("sendMessage", newMessage);
    } catch (err) {
      const error = err as any;
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        workspaces,
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
