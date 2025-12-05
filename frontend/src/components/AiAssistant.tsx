import { useState, useRef, useEffect } from "react";
import { Send, Bot, X, Minimize2, Maximize2, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAI } from "../context/aiContext";
import { useAuth } from "../context/authContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  userName?: string;
  onTaskCreate?: (taskTitle: string) => void;
}

export const AIAssistant = ({ userName = "", onTaskCreate }: AIAssistantProps) => {
  const { user } = useAuth()
  const { ask, loading } = useAI();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi ${user.name}!  I'm your AI assistant. I can help you:\n• Create and manage tasks\n• Organize your schedule\n• Provide productivity tips\n\nHow can I help you today?`,
      timestamp: new Date()
    }
  ]);
  userName = user.name
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  const formatTime = (date: Date) => date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Call AI context
    const aiResponse = await ask(userMessage.content);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);

    // Optional task detection
    if (assistantMessage.content.includes("created a new task") && onTaskCreate) {
      const match = assistantMessage.content.match(/created a new task: "([^"]+)"/);
      if (match) onTaskCreate(match[1]);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ 
              scale: 1.1,
              rotate: [0, -10, 10, -10, 0],
              transition: { duration: 0.5 }
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 bg-linear-to-br from-gray-900 to-gray-600 rounded-full shadow-lg hover:shadow-2xl transition-shadow flex items-center justify-center z-50 group border border-gray-400"
          >
            <motion.div
              animate={{}}
              transition={{}}
            >
              <Sparkles className="text-gray-300 group-hover:text-gray-100 transition-colors" size={24} />
            </motion.div>
            {/* <span className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full animate-pulse"></span> */}
            
            {/* Ripple effect on hover */}
            <motion.span
              className="absolute inset-0 rounded-full bg-gray-600 opacity-0 group-hover:opacity-20"
              initial={{ scale: 0 }}
              whileHover={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed inset-x-4 bottom-0 right-0 sm:inset-x-auto sm:right-0 shadow-2xl z-50 flex flex-col ${
              isMinimized 
                ? "sm:w-80 h-16 rounded-tl-2xl" 
                : "sm:w-96 h-[85vh] sm:h-[600px] max-h-[600px] rounded-tl-2xl"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-400 bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 rounded-tl-2xl">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 rounded-full flex items-center justify-center border border-gray-600">
                  <Bot className="text-gray-300" size={20} />
                </div>
                <div className="text-gray-100">
                  <h3 className="font-semibold text-sm sm:text-base">AI Assistant</h3>
                  <p className="text-xs text-gray-400">{loading ? "Thinking..." : "Always here to help"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)} 
                  className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {isMinimized ? (
                    <Maximize2 className="text-gray-300" size={16} />
                  ) : (
                    <Minimize2 className="text-gray-300" size={16} />
                  )}
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="text-gray-300" size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-200 border-l border-r border-gray-400">
                  {messages.map(msg => (
                    <motion.div 
                      key={msg.id} 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className={`flex gap-2 sm:gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${
                        msg.role === "assistant" 
                          ? "bg-linear-to-br from-gray-700 to-gray-800 border border-gray-600" 
                          : "bg-linear-to-br from-gray-600 to-gray-700 border border-gray-500"
                      }`}>
                        {msg.role === "assistant" ? (
                          <Bot className="text-gray-300" size={16} />
                        ) : (
                          <span className="text-gray-200 text-xs font-semibold">
                            {userName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col max-w-[75%] sm:max-w-[75%]">
                        <div className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl ${
                          msg.role === "assistant" 
                            ? "bg-gray-500 text-gray-100 rounded-tl-sm shadow-sm border border-gray-400" 
                            : "bg-linear-to-r from-gray-700 to-gray-600 text-gray-100 rounded-tr-sm border border-gray-600"
                        }`}>
                          <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 mt-1 px-1">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="flex gap-2 sm:gap-3"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-linear-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center border border-gray-600">
                        <Bot className="text-gray-300" size={16} />
                      </div>
                      <div className="bg-gray-800 px-3 py-2 sm:px-4 sm:py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2 border border-gray-700">
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 animate-spin" />
                        <span className="text-xs sm:text-sm text-gray-300">AI is thinking...</span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 sm:p-4 bg-linear-to-r from-slate-700 via-slate-800 to-slate-900">
                  <form 
                    onSubmit={e => { e.preventDefault(); handleSend(); }} 
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="Ask me anything..."
                      disabled={loading}
                      className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-gray-200 border border-gray-100 text-gray-800 placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent text-xs sm:text-sm disabled:bg-gray-850 disabled:cursor-not-allowed"
                    />
                    <button 
                      type="submit" 
                      disabled={!input.trim() || loading} 
                      className={`p-2 sm:p-3 rounded-xl transition-all ${
                        input.trim() && !loading 
                          ? "bg-linear-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-600" 
                          : "bg-gray-300 text-gray-600 cursor-not-allowed border border-gray-200"
                      }`}
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};