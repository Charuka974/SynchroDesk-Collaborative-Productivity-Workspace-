import React, { useState, useEffect, useRef, type ChangeEvent } from "react";
import { Send, Paperclip, X, FileText } from "lucide-react";
import { useChat, ChatProvider } from "../context/messageContext"; // Chat context
import { connectSocket } from "../lib/messagesocket";

interface SelectedFile {
  name: string;
  size: string;
  type: string;
  preview: string | null;
  file: File;
}

interface ChatWindowProps {
  userId: string;
  workspaceId?: string;
  otherUserName?: string;
  otherUserAvatar?: string;
  workspaceName?: string;
  members?: Array<{ id: string; name: string; avatar?: string }>;
}

export default function ChatWindow({
  userId,
  workspaceId,
  otherUserName = "Chat User",
  otherUserAvatar,
  workspaceName = "Group Chat",
  members = [],
}: ChatWindowProps) {
  const isGroupChat = !!workspaceId;

  // Connect socket on mount
  useEffect(() => {
    if (!userId) return;
    const initSocket = async () => {
      try {
        await connectSocket(userId); // wait for socket to connect
      } catch (err) {
        console.error("Socket connection failed:", err);
      }
    };
    initSocket();
  }, [userId]);

  const { selectedUser, messages, fetchMessages, sendMessage } = useChat();
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Fetch messages when selectedUser changes
  useEffect(() => {
    if (selectedUser) fetchMessages(selectedUser._id);
  }, [selectedUser, fetchMessages]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
    setSelectedFile({ name: file.name, size: `${fileSizeMB} MB`, type: file.type, preview, file });
  };

  const removeSelectedFile = () => {
    if (selectedFile?.preview) URL.revokeObjectURL(selectedFile.preview);
    setSelectedFile(null);
  };

  // Send message (text or file)
  const handleSend = async () => {
    if ((!input.trim() && !selectedFile) || !selectedUser) return;

    try {
      if (selectedFile) {
        // Convert file to base64
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result as string; // this is a string
          await sendMessage({ file: base64 });
        };
        reader.readAsDataURL(selectedFile.file);

        removeSelectedFile();
      }

      if (input.trim()) {
        await sendMessage({ text: input });
        setInput("");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };


  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 shadow-sm shrink-0 flex items-center gap-3">
        {otherUserAvatar ? (
          <img src={otherUserAvatar} alt={otherUserName} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {otherUserName.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="font-semibold text-gray-900">{otherUserName}</h2>
          <p className="text-xs text-green-500">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => {
          const isMe = msg.senderId === userId;
          return (
            <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`px-4 py-2 rounded-2xl max-w-xs wrap-break-word ${isMe ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"}`}>
                {msg.text || msg.file || "Attachment"}
                <div className="text-xs text-gray-400 mt-1">{formatTime(msg.createdAt)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* File Preview */}
      {selectedFile && (
        <div className="p-2 bg-blue-50 border-t border-blue-100 flex items-center gap-3">
          {selectedFile.preview ? (
            <img src={selectedFile.preview} alt="preview" className="w-12 h-12 object-cover rounded" />
          ) : (
            <FileText size={24} />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">{selectedFile.size}</p>
          </div>
          <button onClick={removeSelectedFile}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white flex items-center gap-3">
        <label className="cursor-pointer">
          <Paperclip size={20} />
          <input type="file" className="hidden" onChange={handleFileChange} />
        </label>
        <input
          type="text"
          className="flex-1 border px-4 py-2 rounded-lg focus:outline-none"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} className="p-2 bg-blue-600 text-white rounded-lg">
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
