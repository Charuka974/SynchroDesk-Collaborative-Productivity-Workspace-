import React, { useState, useEffect, useRef } from "react";
import { ChatProvider, useChat } from "../context/messageContext";
// import { connectSocket } from "../lib/messagesocket";
import { useAuth } from "../context/authContext";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";

interface ChatProps {}

const ChatSidebar: React.FC<{ initialWorkspaceId?: string }> = ({
  initialWorkspaceId,
}) => {
  const {
    // users,
    workspaces,
    // selectedUser,
    selectedWorkspace,
    setSelectedUser,
    setSelectedWorkspace,
    // isUsersLoading,
  } = useChat();

  // Filter workspaces to only show the selected one (if initialWorkspaceId is set)
  const displayedWorkspaces = initialWorkspaceId
    ? workspaces.filter((ws) => ws._id === initialWorkspaceId)
    : workspaces;

  return (
    <div className="hidden w-64 border-r border-gray-200 bg-white shrink-0">
      <ul>
        {displayedWorkspaces.length === 0 ? (
          <p className="px-4 text-gray-500">No workspaces found</p>
        ) : (
          displayedWorkspaces.map((ws) => (
            <li
              key={ws._id}
              onClick={() => {
                setSelectedWorkspace(ws);
                setSelectedUser(null);
              }}
              className={`px-4 py-2 cursor-pointer hover:bg-indigo-50 ${
                selectedWorkspace?._id === ws._id
                  ? "bg-indigo-100 font-semibold"
                  : ""
              }`}
            >
              {ws.name}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

const ChatPanel: React.FC = () => {
  const { user } = useAuth();
  const [modalImage, setModalImage] = useState<string | null>(null);

  const {
    messages,
    selectedUser,
    selectedWorkspace,
    fetchMessages,
    sendMessage,
    isMessagesLoading,
    fetchGroupMessages,
  } = useChat();

  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch messages when selectedUser or selectedWorkspace changes
  useEffect(() => {
    if (selectedUser) fetchMessages(selectedUser._id);
    else if (selectedWorkspace) fetchGroupMessages(selectedWorkspace._id);
  }, [selectedUser, selectedWorkspace]);

  const handleSend = async () => {
    if (!newMessage.trim() && !attachment) return; // nothing to send
    if (!selectedUser && !selectedWorkspace) return; // no target

    try {
      await sendMessage({
        text: newMessage || undefined,
        image: attachment?.type.startsWith("image/") ? attachment : undefined,
        file:
          attachment && !attachment.type.startsWith("image/")
            ? attachment
            : undefined,
      });

      setNewMessage("");
      setAttachment(null);
      setPreviewUrl(null); // clear preview
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    }
  };

  if (!selectedUser && !selectedWorkspace) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
        <svg
          className="w-20 h-20 mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p className="text-lg font-medium">No conversation selected</p>
        <p className="text-sm">Select a user or workspace to start chatting</p>
      </div>
    );
  }

  const chatName = selectedUser?.name || selectedWorkspace?.name;

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="p-4 bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center shadow-xl border-b border-slate-600">
        <h2 className="text-2xl font-bold text-center text-white tracking-tight">
          {chatName} Chat
        </h2>
      </div>

      {/* Messages Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
        {isMessagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-gray-500 text-lg font-medium">
                No messages yet
              </p>
              <p className="text-gray-400 text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const senderObj =
              typeof msg.senderId === "string"
                ? {
                    _id: msg.senderId,
                    name: "Unknown",
                    avatar: "/images/avatar.jpg",
                  }
                : msg.senderId;

            const isMine = senderObj._id === user.id;

            const senderName = isMine ? "You" : senderObj.name || "Unknown";
            const senderAvatar = isMine
              ? undefined
              : senderObj.avatar || "/images/avatar.jpg";

            return (
              <div
                key={msg._id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex flex-col ${
                    isMine ? "items-end" : "items-start"
                  } max-w-xs sm:max-w-md`}
                >
                  {/* Sender name - only show for others' messages */}
                  {!isMine && (
                    <div className="flex items-center gap-2 mb-1 px-2">
                      <img
                        src={senderAvatar}
                        alt={senderName}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-xs text-gray-600 font-medium">
                        {senderName}
                      </span>
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`px-4 py-2 rounded-2xl wrap-break-word ${
                      isMine
                        ? "bg-gray-600 text-white rounded-br-sm"
                        : "bg-white text-gray-800 rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {msg.text && (
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    )}

                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="image"
                        className="mt-2 max-w-xs rounded-md"
                        onClick={() => setModalImage(msg.image || "")}
                      />
                    )}

                    {msg.file && (
                      <a
                        href={msg.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-blue-600 underline block text-sm"
                      >
                        {msg.file.split("/").pop()} {/* shows file name */}
                      </a>
                    )}

                    {msg.audio && (
                      <audio controls className="mt-2 w-full">
                        <source src={msg.audio} />
                        Your browser does not support the audio element.
                      </audio>
                    )}
                  </div>

                  {/* Timestamp - you can add this if you have timestamp data */}
                  <span className="text-xs text-gray-500 mt-1 px-2">
                    {new Date(msg.createdAt).toLocaleDateString()}
                    {", "}
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Attachment preview */}
      {attachment && (
        <div className="flex items-center mb-2 p-2 border border-gray-300 rounded-lg bg-gray-100 relative">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="preview"
              className="w-16 h-16 object-cover rounded-md"
            />
          ) : (
            <div className="flex items-center gap-2 text-gray-700">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              <span className="truncate">{attachment.name}</span>
            </div>
          )}

          {/* Remove button */}
          <button
            className="absolute top-1 right-1 text-gray-600 hover:text-gray-900 text-xl"
            onClick={() => {
              setAttachment(null);
              setPreviewUrl(null);
            }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2">
          <label className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  setAttachment(file);

                  if (file.type.startsWith("image/")) {
                    setPreviewUrl(URL.createObjectURL(file));
                  } else {
                    setPreviewUrl(null);
                  }

                  // Reset the input so the same file can be selected again
                  e.target.value = "";
                }
              }}
            />
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </label>

          {/* Emoji Button */}
          <button
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 9h.01M15 9h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          {/* The Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-4 z-50">
              <EmojiPicker
                onEmojiClick={(emoji) => {
                  setNewMessage((prev) => prev + emoji.emoji);
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          )}

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            className="p-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!newMessage.trim() && !attachment}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>

      {modalImage && (
        <div className="fixed inset-0 bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl transform transition-all max-h-[85vh] max-w-md flex flex-col relative">
            {/* Close button */}
            <button
              onClick={() => setModalImage(null)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-gray-800 text-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-900 transition-all duration-200 z-10"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Image */}
            <img
              src={modalImage}
              alt="Preview"
              className="max-h-[85vh] max-w-full object-contain rounded-2xl m-4"
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface ChatProps {
  initialWorkspaceId?: string; // optional prop to pre-select a workspace
}

export const Chat: React.FC<ChatProps> = ({ initialWorkspaceId }) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <ChatProvider currentUser={user}>
      <InnerChat initialWorkspaceId={initialWorkspaceId} />
    </ChatProvider>
  );
};

// Separate component to access chat context AFTER provider
const InnerChat: React.FC<{ initialWorkspaceId?: string }> = ({
  initialWorkspaceId,
}) => {
  const { setSelectedWorkspace, workspaces } = useChat();

  // Set the workspace automatically on mount
  useEffect(() => {
    if (initialWorkspaceId) {
      // Check if workspace is already loaded in context
      const ws = workspaces.find((w) => w._id === initialWorkspaceId);
      if (ws) setSelectedWorkspace(ws);
      // If not loaded yet, create a temporary placeholder
      else
        setSelectedWorkspace({
          _id: initialWorkspaceId,
          name: "Loading...",
          members: [],
        });
    }
  }, [initialWorkspaceId, setSelectedWorkspace, workspaces]);

  return (
    <div className="flex h-full min-h-[500px] bg-gray-50">
      <ChatSidebar initialWorkspaceId={initialWorkspaceId} />
      <ChatPanel />
    </div>
  );
};
