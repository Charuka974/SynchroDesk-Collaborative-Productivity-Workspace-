import React, { useState, useEffect, useRef, type ChangeEvent } from "react";
import { Send, Paperclip, X, FileText, Download, Users, Search, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

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

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  isGroup: boolean;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  members?: Array<{ id: string; name: string; avatar?: string }>;
  online?: boolean;
}


export default function ChatWindow() {
  //Logged in user 
  const location = useLocation();
  const userId = location.state?.userId;

  // Sample conversations
  const [conversations] = useState<Conversation[]>([
    {
      id: "conv-1",
      name: "Alice Johnson",
      avatar: undefined,
      isGroup: false,
      lastMessage: "Sounds good! See you then.",
      lastMessageTime: new Date(Date.now() - 300000),
      unreadCount: 2,
      online: true
    },
    {
      id: "conv-2",
      name: "Engineering Team",
      isGroup: true,
      lastMessage: "John: Let's schedule a meeting",
      lastMessageTime: new Date(Date.now() - 600000),
      unreadCount: 5,
      members: [
        { id: "user1", name: "Alice Johnson" },
        { id: "user2", name: "Bob Smith" },
        { id: "user3", name: "John Doe" }
      ]
    },
    {
      id: "conv-3",
      name: "Bob Smith",
      isGroup: false,
      lastMessage: "Thanks for the update!",
      lastMessageTime: new Date(Date.now() - 7200000),
      unreadCount: 0,
      online: false
    },
    {
      id: "conv-4",
      name: "Design Team",
      isGroup: true,
      lastMessage: "Sarah: Check out the new mockups",
      lastMessageTime: new Date(Date.now() - 86400000),
      unreadCount: 0,
      members: [
        { id: "user4", name: "Sarah Wilson" },
        { id: "user5", name: "Mike Chen" }
      ]
    },
    {
      id: "conv-5",
      name: "Sarah Wilson",
      isGroup: false,
      lastMessage: "Can you review my PR?",
      lastMessageTime: new Date(Date.now() - 172800000),
      unreadCount: 0,
      online: true
    }
  ]);

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: string;
    preview: string | null;
    file: File;
  } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      // Load messages for selected conversation
      const demoMessages: ChatMessage[] = selectedConversation.isGroup
        ? [
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
            }
          ]
        : [
            {
              _id: "demo-1",
              senderId: "other",
              type: "text",
              content: "Hey! How are you doing?",
              timestamp: new Date(Date.now() - 3600000)
            },
            {
              _id: "demo-2",
              senderId: userId,
              type: "text",
              content: "I'm good! Working on some updates.",
              timestamp: new Date(Date.now() - 3500000)
            }
          ];
      setMessages(demoMessages);
    }
  }, [selectedConversation, userId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isTyping]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { 
      hour: "numeric", 
      minute: "2-digit", 
      hour12: true 
    });
  };

  const formatLastMessageTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return formatTime(date);
    if (days === 1) return "Yesterday";
    if (days < 7) return date.toLocaleDateString("en-US", { weekday: "short" });
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const shouldShowDateDivider = (currentMsg: ChatMessage, prevMsg: ChatMessage | null) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.timestamp).toDateString();
    const prevDate = new Date(prevMsg.timestamp).toDateString();
    return currentDate !== prevDate;
  };

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

  const removeSelectedFile = () => {
    if (selectedFile?.preview) {
      URL.revokeObjectURL(selectedFile.preview);
    }
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = () => {
    if (!input.trim() && !selectedFile) return;

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

    // Simulate response
    if (selectedConversation?.isGroup) {
      setTimeout(() => setTypingUsers(["Alice Johnson"]), 1000);
    } else {
      setTimeout(() => setIsTyping(true), 1000);
    }
    
    setTimeout(() => {
      setIsTyping(false);
      setTypingUsers([]);
      const replyMessage: ChatMessage = {
        _id: crypto.randomUUID(),
        senderId: selectedConversation?.isGroup ? "user1" : "other",
        senderName: selectedConversation?.isGroup ? "Alice Johnson" : undefined,
        type: "text",
        content: "Got it! 👍",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, replyMessage]);
    }, 3000);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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

  if (!selectedConversation) return null;

  return (
    <div className="w-full h-screen flex bg-gray-100">
      {/* Left Sidebar - Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-3">Chats</h1>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <motion.div
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`p-4 cursor-pointer border-b border-gray-100 transition-colors ${
                selectedConversation?.id === conv.id ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative">
                  {conv.isGroup ? (
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                      <Users size={20} />
                    </div>
                  ) : conv.avatar ? (
                    <img src={conv.avatar} alt={conv.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className={`w-12 h-12 rounded-full bg-linear-to-br ${getAvatarColor(conv.id)} flex items-center justify-center text-white font-semibold`}>
                      {getInitials(conv.name)}
                    </div>
                  )}
                  {!conv.isGroup && conv.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                {/* Conversation Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{conv.name}</h3>
                    {conv.lastMessageTime && (
                      <span className="text-xs text-gray-500">
                        {formatLastMessageTime(conv.lastMessageTime)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">
                      {conv.lastMessage || "No messages yet"}
                    </p>
                    {conv.unreadCount && conv.unreadCount > 0 && (
                      <span className="ml-2 min-w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center px-1.5">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right Side - Chat Window */}
      <div className="flex-1 flex flex-col bg-linear-to-b from-gray-50 to-gray-100">
        {/* Chat Header */}
        <div className="bg-white border-b px-4 py-3 shadow-sm shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedConversation.isGroup ? (
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white">
                  <Users size={20} />
                </div>
              ) : selectedConversation.avatar ? (
                <img 
                  src={selectedConversation.avatar} 
                  alt={selectedConversation.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className={`w-10 h-10 rounded-full bg-linear-to-br ${getAvatarColor(selectedConversation.id)} flex items-center justify-center text-white font-semibold text-sm`}>
                  {getInitials(selectedConversation.name)}
                </div>
              )}
              <div>
                <h2 className="font-semibold text-gray-900">{selectedConversation.name}</h2>
                {selectedConversation.isGroup ? (
                  <p className="text-xs text-gray-500">
                    {selectedConversation.members?.length || 0} members
                  </p>
                ) : (
                  <p className={`text-xs ${selectedConversation.online ? "text-green-500" : "text-gray-500"}`}>
                    {selectedConversation.online ? "Online" : "Offline"}
                  </p>
                )}
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === userId;
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const showDate = shouldShowDateDivider(msg, prevMsg);
            const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
            const showSenderName = selectedConversation.isGroup && !isMe && showAvatar;

            return (
              <React.Fragment key={msg._id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                      {formatDate(msg.timestamp)}
                    </span>
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className="w-8 shrink-0">
                    {!isMe && showAvatar && (
                      <div className={`w-8 h-8 rounded-full bg-linear-to-br ${getAvatarColor(msg.senderId)} flex items-center justify-center text-white text-xs font-semibold`}>
                        {getInitials(msg.senderName || "U")}
                      </div>
                    )}
                  </div>

                  <div className={`max-w-xs lg:max-w-md ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                    {showSenderName && (
                      <span className="text-xs font-medium text-gray-600 mb-1 px-1">
                        {msg.senderName}
                      </span>
                    )}

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
                            <div className={`flex items-center gap-3 p-3 rounded-lg ${isMe ? "bg-blue-600" : "bg-gray-50"}`}>
                              <FileText size={24} className={isMe ? "text-blue-200" : "text-gray-400"} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${isMe ? "text-white" : "text-gray-900"}`}>
                                  {msg.fileName}
                                </p>
                                {msg.fileSize && (
                                  <p className={`text-xs ${isMe ? "text-blue-200" : "text-gray-500"}`}>
                                    {msg.fileSize}
                                  </p>
                                )}
                              </div>
                              <Download size={18} className={isMe ? "text-blue-200 cursor-pointer" : "text-gray-400 cursor-pointer"} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <span className={`text-xs text-gray-400 mt-1 px-1 ${isMe ? "text-right" : "text-left"}`}>
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
                <div className={`w-8 h-8 rounded-full bg-linear-to-br ${getAvatarColor(selectedConversation.isGroup ? "user1" : "other")} flex items-center justify-center text-white text-xs font-semibold`}>
                  {getInitials(selectedConversation.isGroup ? typingUsers[0] || "U" : selectedConversation.name)}
                </div>
                <div className="flex flex-col">
                  {selectedConversation.isGroup && typingUsers.length > 0 && (
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
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
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
                  <img src={selectedFile.preview} alt="preview" className="w-12 h-12 rounded object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <FileText size={24} className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{selectedFile.size}</p>
                </div>
                <button onClick={removeSelectedFile} className="p-1 hover:bg-gray-100 rounded-full transition-colors" aria-label="Remove file">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="p-4 bg-white shadow-lg">
          <div className="flex items-center gap-3">
            <label className="cursor-pointer p-2.5 rounded-xl hover:bg-gray-100 transition-colors shrink-0">
              <Paperclip size={20} className="text-gray-600" />
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx,.txt" />
            </label>

            <div className="flex-1 relative">
              <textarea
                className="w-full border bg-white border-gray-300 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder={selectedConversation.isGroup ? "Message to group..." : "Type a message..."}
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

            <button
              onClick={handleSend}
              disabled={!input.trim() && !selectedFile}
              className={`p-2.5 rounded-xl shadow-md transition-all shrink-0 ${
                input.trim() || selectedFile
                  ? "bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}