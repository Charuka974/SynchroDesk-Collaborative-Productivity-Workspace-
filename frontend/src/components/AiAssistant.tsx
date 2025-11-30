// // frontend/components/AIAssistant.tsx
// import { useState } from "react";
// import { useAI } from "../context/aiContext";

// export const AIAssistant = () => {
//   const { ask, response, loading } = useAI();
//   const [prompt, setPrompt] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!prompt.trim()) return;
//     await ask(prompt);
//     setPrompt("");
//   };

//   return (
//     <div className="p-4 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-4">
//       <form onSubmit={handleSubmit} className="flex gap-2">
//         <input
//           type="text"
//           value={prompt}
//           onChange={(e) => setPrompt(e.target.value)}
//           placeholder="Ask AI..."
//           className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         />
//         <button
//           type="submit"
//           className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//           disabled={loading}
//         >
//           {loading ? "Thinking..." : "Ask"}
//         </button>
//       </form>

//       <div className="mt-4 p-2 border rounded-lg min-h-20">
//         {loading ? "AI is thinking..." : response}
//       </div>
//     </div>
//   );
// };

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
            className="fixed bottom-6 right-6 w-16 h-16 bg-linear-to-r from-indigo-600 to-purple-600 rounded-full shadow-lg hover:shadow-2xl transition-shadow flex items-center justify-center z-50 group"
            >
            <motion.div
                animate={{
                // rotate: 360
                // }}
                // transition={{
                // duration: 3,
                // repeat: Infinity,
                // ease: "linear"
                }}
            >
                <Sparkles className="text-white group-hover:text-yellow-200 transition-colors" size={28} />
            </motion.div>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
            
            {/* Ripple effect on hover */}
            <motion.span
                className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20"
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
            className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col ${isMinimized ? "w-80 h-16" : "w-96 h-[600px]"}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-linear-to-r from-indigo-600 to-purple-600 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Bot className="text-indigo-600" size={24} />
                </div>
                <div className="text-white">
                  <h3 className="font-semibold">AI Assistant</h3>
                  <p className="text-xs text-indigo-100">{loading ? "Thinking..." : "Always here to help"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  {isMinimized ? <Maximize2 className="text-white" size={18} /> : <Minimize2 className="text-white" size={18} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="text-white" size={18} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map(msg => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "assistant" ? "bg-linear-to-br from-indigo-500 to-purple-500" : "bg-linear-to-br from-gray-700 to-gray-900"}`}>
                        {msg.role === "assistant" ? <Bot className="text-white" size={18} /> : <span className="text-white text-xs font-semibold">{userName.charAt(0).toUpperCase()}</span>}
                      </div>
                      <div className="flex flex-col max-w-[75%]">
                        <div className={`px-4 py-3 rounded-2xl ${msg.role === "assistant" ? "bg-white text-gray-900 rounded-tl-sm shadow-sm" : "bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm"}`}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                        <span className="text-xs text-gray-400 mt-1 px-1">{formatTime(msg.timestamp)}</span>
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                      <div className="w-8 h-8 bg-linear-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Bot className="text-white" size={18} />
                      </div>
                      <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                        <span className="text-sm text-gray-600">AI is thinking...</span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                  <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="Ask me anything..."
                      disabled={loading}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                    <button type="submit" disabled={!input.trim() || loading} className={`p-3 rounded-xl transition-all ${input.trim() && !loading ? "bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
                      {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
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
