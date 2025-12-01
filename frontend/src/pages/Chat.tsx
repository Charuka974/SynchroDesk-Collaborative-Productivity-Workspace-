import { useState, useEffect } from "react";
import { ChatProvider, useChat } from "../context/messageContext";
import { connectSocket } from "../lib/messagesocket";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext";

const ChatSidebar = () => {
  const { users, selectedUser, setSelectedUser, isUsersLoading } = useChat();

  return (
    <div className="w-64 border-r border-gray-200 bg-white shrink-0">
      <h2 className="p-4 font-semibold text-gray-900">Users</h2>
      {isUsersLoading ? (
        <p className="p-4 text-gray-500">Loading users...</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`cursor-pointer px-4 py-2 hover:bg-indigo-50 ${
                selectedUser?._id === user._id ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              {user.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const ChatPanel = () => {
  const { user } = useAuth();
  const { messages, selectedUser, fetchMessages, sendMessage, isMessagesLoading } = useChat();
  const [newMessage, setNewMessage] = useState("");

  // Fetch messages whenever selectedUser changes
  useEffect(() => {
    if (!selectedUser) return;
    fetchMessages(selectedUser._id);
  }, [selectedUser]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await sendMessage({ text: newMessage });
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    }
  };

  if (!selectedUser) {
    return <div className="flex-1 flex items-center justify-center text-gray-500">Select a user to start chatting</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200 font-semibold">{selectedUser.name}</div>
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {isMessagesLoading ? (
          <p className="text-gray-500">Loading messages...</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`p-2 rounded-lg max-w-xs wrap-break-word ${
                msg.senderId === user._id ? "bg-indigo-600 text-white self-end" : "bg-indigo-100 self-start"
              }`}
            >
              {msg.text || "Attachment"}
            </div>
          ))
        )}
      </div>
      <div className="p-4 border-t border-gray-200 flex items-center gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default function ChatPage() {
  const { user } = useAuth();
  connectSocket(user._id); // ensure socket is connected

  return (
    <ChatProvider currentUser={user}>
      <div className="min-h-screen flex bg-gray-50">
        <ChatSidebar />
        <ChatPanel />
      </div>
    </ChatProvider>
  );
}
