import React, { useState, useEffect, useRef, type ChangeEvent } from "react";
import { Send, Paperclip, X, FileText, Download, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  _id: string;
  senderId: string;
  senderName?: string;
  type: "text" | "file";
  content?: string;
  fileName?: string;
  fileSize?: string;
  filePreview?: string;
  timestamp: Date;
}

interface ChatWindowProps {
  userId: string;
  workspaceId?: string;
  // For direct chat (when no workspaceId)
  otherUserName?: string;
  otherUserAvatar?: string;
  // For group chat (when workspaceId exists)
  workspaceName?: string;
  members?: Array<{ id: string; name: string; avatar?: string }>;
}

interface SelectedFile {
  name: string;
  size: string;
  type: string;
  preview: string | null;
  file: File;
}

export default function ChatWindow({ 
  userId, 
  workspaceId,
  otherUserName = "Chat User",
  otherUserAvatar,
  workspaceName = "Group Chat",
  members = []
}: ChatWindowProps) {
  const isGroupChat = !!workspaceId;
  
  // Demo messages with sender names for group chat
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      _id: "demo-1",
      senderId: "user1",
      senderName: "Alice Johnson",
      type: "text",
      content: "Hey team! How's the project going?",
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      _id: "demo-2",
      senderId: userId,
      senderName: "You",
      type: "text",
      content: "Great! Just finishing up the latest features.",
      timestamp: new Date(Date.now() - 3500000)
    },
    {
      _id: "demo-3",
      senderId: "user2",
      senderName: "Bob Smith",
      type: "text",
      content: "Awesome! Let me know if you need any help.",
      timestamp: new Date(Date.now() - 3400000)
    }
  ]);
  
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isTyping]);

  // Format time display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { 
      hour: "numeric", 
      minute: "2-digit", 
      hour12: true 
    });
  };

  // Format date divider
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Check if we should show date divider
  const shouldShowDateDivider = (currentMsg: ChatMessage, prevMsg: ChatMessage | null) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.timestamp).toDateString();
    const prevDate = new Date(prevMsg.timestamp).toDateString();
    return currentDate !== prevDate;
  };

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const preview = file.type.startsWith("image/") 
      ? URL.createObjectURL(file) 
      : null;

    setSelectedFile({
      name: file.name,
      size: `${fileSizeMB} MB`,
      type: file.type,
      preview,
      file
    });
  };

  // Remove selected file
  const removeSelectedFile = () => {
    if (selectedFile?.preview) {
      URL.revokeObjectURL(selectedFile.preview);
    }
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Send message
  const handleSend = () => {
    if (!input.trim() && !selectedFile) return;

    // Send file message
    if (selectedFile) {
      const fileMessage: ChatMessage = {
        _id: crypto.randomUUID(),
        senderId: userId,
        senderName: "You",
        type: "file",
        content: selectedFile.name,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        filePreview: selectedFile.preview || undefined,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, fileMessage]);
      removeSelectedFile();
    }

    // Send text message
    if (input.trim()) {
      const textMessage: ChatMessage = {
        _id: crypto.randomUUID(),
        senderId: userId,
        senderName: "You",
        type: "text",
        content: input.trim(),
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, textMessage]);
      setInput("");
    }

    // Simulate other user typing and response
    if (isGroupChat) {
      setTimeout(() => setTypingUsers(["Alice Johnson"]), 1000);
    } else {
      setTimeout(() => setIsTyping(true), 1000);
    }
    
    setTimeout(() => {
      setIsTyping(false);
      setTypingUsers([]);
      const replyMessage: ChatMessage = {
        _id: crypto.randomUUID(),
        senderId: isGroupChat ? "user1" : "other",
        senderName: isGroupChat ? "Alice Johnson" : undefined,
        type: "text",
        content: "Got it! 👍",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, replyMessage]);
    }, 3000);
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get avatar color based on user ID (consistent colors for same user)
  const getAvatarColor = (id: string) => {
    const colors = [
      "from-blue-400 to-blue-600",
      "from-purple-400 to-purple-600",
      "from-pink-400 to-pink-600",
      "from-green-400 to-green-600",
      "from-yellow-400 to-yellow-600",
      "from-red-400 to-red-600",
      "from-indigo-400 to-indigo-600",
      "from-teal-400 to-teal-600"
    ];
    const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Get member count for group chat
  const memberCount = members.length || 3;

  return (
    <div className="w-full h-full flex flex-col bg-linear-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          {isGroupChat ? (
            <>
              {/* Group Chat Icon */}
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white">
                <Users size={20} />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900">{workspaceName}</h2>
                <p className="text-xs text-gray-500">{memberCount} members</p>
              </div>
            </>
          ) : (
            <>
              {/* Direct Chat Avatar */}
              {otherUserAvatar ? (
                <img 
                  src={otherUserAvatar} 
                  alt={otherUserName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className={`w-10 h-10 rounded-full bg-linear-to-br ${getAvatarColor("other")} flex items-center justify-center text-white font-semibold text-sm`}>
                  {getInitials(otherUserName)}
                </div>
              )}
              <div>
                <h2 className="font-semibold text-gray-900">{otherUserName}</h2>
                <p className="text-xs text-green-500">Online</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === userId;
          const prevMsg = idx > 0 ? messages[idx - 1] : null;
          const showDate = shouldShowDateDivider(msg, prevMsg);
          const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
          const showSenderName = isGroupChat && !isMe && showAvatar;

          return (
            <React.Fragment key={msg._id}>
              {/* Date Divider */}
              {showDate && (
                <div className="flex justify-center my-4">
                  <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                    {formatDate(msg.timestamp)}
                  </span>
                </div>
              )}

              {/* Message */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className="w-8 shrink-0">
                  {!isMe && showAvatar && (
                    <div className={`w-8 h-8 rounded-full bg-linear-to-br ${getAvatarColor(msg.senderId)} flex items-center justify-center text-white text-xs font-semibold`}>
                      {getInitials(msg.senderName || "U")}
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div className={`max-w-xs lg:max-w-md ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                  {/* Sender Name (Group Chat Only) */}
                  {showSenderName && (
                    <span className="text-xs font-medium text-gray-600 mb-1 px-1">
                      {msg.senderName}
                    </span>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`px-4 py-2 rounded-2xl shadow-sm transition-all hover:shadow-md ${
                      isMe
                        ? "bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                        : "bg-white text-gray-900 rounded-bl-md"
                    }`}
                  >
                    {msg.type === "text" && (
                      <p className="text-sm whitespace-pre-wrap wrap-break-word">
                        {msg.content}
                      </p>
                    )}

                    {msg.type === "file" && (
                      <div className="space-y-2">
                        {msg.filePreview ? (
                          <div className="relative group">
                            <img
                              src={msg.filePreview}
                              alt={msg.fileName}
                              className="rounded-lg max-w-full h-auto max-h-64 object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all" />
                          </div>
                        ) : (
                          <div
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                              isMe ? "bg-blue-600" : "bg-gray-50"
                            }`}
                          >
                            <FileText
                              size={24}
                              className={isMe ? "text-blue-200" : "text-gray-400"}
                            />
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-medium truncate ${
                                  isMe ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {msg.fileName}
                              </p>
                              {msg.fileSize && (
                                <p
                                  className={`text-xs ${
                                    isMe ? "text-blue-200" : "text-gray-500"
                                  }`}
                                >
                                  {msg.fileSize}
                                </p>
                              )}
                            </div>
                            <Download
                              size={18}
                              className={isMe ? "text-blue-200 cursor-pointer" : "text-gray-400 cursor-pointer"}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span
                    className={`text-xs text-gray-400 mt-1 px-1 ${
                      isMe ? "text-right" : "text-left"
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </motion.div>
            </React.Fragment>
          );
        })}

        {/* Typing Indicator */}
        <AnimatePresence>
          {(isTyping || typingUsers.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex gap-2"
            >
              <div className={`w-8 h-8 rounded-full bg-linear-to-br ${getAvatarColor(isGroupChat ? "user1" : "other")} flex items-center justify-center text-white text-xs font-semibold`}>
                {getInitials(isGroupChat ? typingUsers[0] || "U" : otherUserName)}
              </div>
              <div className="flex flex-col">
                {isGroupChat && typingUsers.length > 0 && (
                  <span className="text-xs text-gray-500 mb-1 px-1">
                    {typingUsers.length === 1 
                      ? typingUsers[0]
                      : typingUsers.length === 2
                      ? `${typingUsers[0]} and ${typingUsers[1]}`
                      : `${typingUsers[0]} and ${typingUsers.length - 1} others`
                    }
                  </span>
                )}
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* File Preview */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 py-2 bg-blue-50 border-t border-blue-100"
          >
            <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
              {selectedFile.preview ? (
                <img
                  src={selectedFile.preview}
                  alt="preview"
                  className="w-12 h-12 rounded object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                  <FileText size={24} className="text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">{selectedFile.size}</p>
              </div>
              <button
                onClick={removeSelectedFile}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Remove file"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-4 bg-gray-300 shadow-lg">
        <div className="flex items-center gap-3"> {/* changed items-end → items-center */}
            {/* File Attach Button */}
            <label className="cursor-pointer p-2.5 rounded-xl bg-white hover:bg-gray-100 transition-colors shrink-0">
            <Paperclip size={20} className="text-gray-600" />
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.txt"
            />
            </label>

            {/* Text Input */}
            <div className="flex-1 relative">
            <textarea
                className="w-full border bg-white border-gray-300 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder={isGroupChat ? "Message to group..." : "Type a message..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                }
                }}
                rows={1}
                style={{ minHeight: "44px", maxHeight: "120px" }}
            />
            </div>

            {/* Send Button */}
            <button
            onClick={handleSend}
            disabled={!input.trim() && !selectedFile}
            className={`p-2.5 rounded-xl shadow-md transition-all shrink-0 ${
                input.trim() || selectedFile
                ? "bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                : "bg-gray-100 text-gray-600 cursor-not-allowed"
            }`}
            aria-label="Send message"
            >
            <Send size={20} />
            </button>
        </div>
      </div>

    </div>
  );
}