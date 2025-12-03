import { useState, useEffect, useRef } from "react";
import { ChatProvider, useChat } from "../context/messageContext";
import { connectSocket } from "../lib/messagesocket";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext";
import EmojiPicker from "emoji-picker-react";

const ChatSidebar = () => {
  const {
    users,
    workspaces,
    selectedUser,
    selectedWorkspace,
    setSelectedUser,
    setSelectedWorkspace,
    isUsersLoading,
  } = useChat();

  return (
    <div className="w-72 border-r border-gray-200 bg-white shrink-0 flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 bg-linear-to-r from-slate-700 via-slate-800 to-slate-900">
        <h1 className="text-xl font-bold text-white">Messages</h1>
      </div>

      {/* Users Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Direct Messages
          </h2>
        </div>
        {isUsersLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No users available
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {users.map((user) => (
              <li
                key={user._id}
                onClick={() => {
                  setSelectedWorkspace(null);
                  setSelectedUser(user);
                }}
                className={`cursor-pointer px-4 py-3 hover:bg-gray-50 transition-colors ${
                  selectedUser?._id === user._id ? "bg-gray-100 border-l-4 border-gray-600" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-900 to-gray-600 flex items-center justify-center text-white font-semibold">
                      {user?.avatar? (
                        <img
                          src={user.avatar}
                          alt={user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span>
                          {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                    {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div> */}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      selectedUser?._id === user._id ? "text-gray-900" : "text-gray-600"
                    }`}>
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">Active now</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Workspaces Section */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 border-t">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Workspaces
          </h2>
        </div>
        <ul className="divide-y divide-gray-100">
          {workspaces.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No workspaces found
            </div>
          ) : (
            workspaces.map((ws) => (
              <li
                key={ws._id}
                onClick={() => {
                  setSelectedWorkspace(ws);
                  setSelectedUser(null);
                }}
                className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedWorkspace?._id === ws._id ? "bg-gray-100 border-l-4 border-gray-600" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-gray-400 to-gray-800 flex items-center justify-center text-white font-semibold shadow-md">
                    {ws.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      selectedWorkspace?._id === ws._id ? "text-gray-900" : "text-gray-600"
                    }`}>
                      {ws.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {ws.members?.length || 0} members
                    </p>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

const ChatPanel = () => {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

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

  // Fetch messages whenever selectedUser or selectedWorkspace changes
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
    } else if (selectedWorkspace) {
      fetchGroupMessages(selectedWorkspace._id);
    }
  }, [selectedUser, selectedWorkspace]);

  const handleSend = async () => {
    if (!newMessage.trim() && !attachment) return;
    if (!selectedUser && !selectedWorkspace) return;

    try {
      await sendMessage({
        text: newMessage || undefined,
        image: attachment?.type.startsWith("image/") ? attachment : undefined,
        file: attachment && !attachment.type.startsWith("image/") ? attachment : undefined,
      });

      setNewMessage("");
      setAttachment(null);
      setPreviewUrl(null); // reset preview
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    }
  };

  const chatName = selectedUser?.name || selectedWorkspace?.name;

  if (!selectedUser && !selectedWorkspace) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        <svg className="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-xl font-semibold text-gray-600 mb-2">Welcome to Messages</p>
        <p className="text-gray-500">Select a conversation from the sidebar to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-100">
      {/* Chat Header */}
      <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          {selectedUser ? (
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-900 to-gray-600 flex items-center justify-center text-white font-semibold">
              {selectedUser?.avatar ? (
                <img
                  src={selectedUser.avatar}
                  alt={
                    selectedUser.name?.charAt(0)?.toUpperCase() ||
                    selectedUser.email?.charAt(0)?.toUpperCase() ||
                    "U"
                  }
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span>
                  {selectedUser?.name?.charAt(0)?.toUpperCase() ||
                    selectedUser?.email?.charAt(0)?.toUpperCase() ||
                    "U"}
                </span>
              )}
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-gray-400 to-gray-800 flex items-center justify-center text-white font-semibold">
              {selectedWorkspace?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="font-semibold text-gray-900">{chatName}</h2>
            <p className="text-xs text-gray-500">
              {selectedUser ? "Active now" : `${selectedWorkspace?.members?.length || 0} members`}
            </p>
          </div>
        </div>
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
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-500 text-lg font-medium">No messages yet</p>
              <p className="text-gray-400 text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const senderId = typeof msg.senderId === "string" ? msg.senderId : msg.senderId?._id;
            const isMine = senderId === user.id;
            const senderName = isMine ? "You" : msg.senderId?.name || "Unknown";
            const senderAvatar = msg.senderId?.avatar || "/images/avatar.jpg";

            return (
              <div
                key={msg._id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} max-w-xs sm:max-w-md`}>
                  {/* Sender info - only show for others' messages */}
                  {!isMine && (
                    <div className="flex items-center gap-2 mb-1 px-2">
                      <img
                        src={senderAvatar}
                        alt={msg.senderId?.name}
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
                        ? "bg-gray-600 text-white rounded-br-sm shadow-md"
                        : "bg-white text-gray-800 rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}

                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="image"
                        className="mt-2 max-w-xs rounded-md"
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
                  
                  {/* Timestamp - uncomment if you have timestamp data */}
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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ChatPage() {
  const { user } = useAuth();
  connectSocket(user.id); // ensure socket is connected

  return (
    <ChatProvider currentUser={user}>
      <div className="h-screen flex bg-gray-50 overflow-hidden">
        <ChatSidebar />
        <ChatPanel />
      </div>
    </ChatProvider>
  );
}








// import { useState, useEffect } from "react";
// import { ChatProvider, useChat } from "../context/messageContext";
// import { connectSocket } from "../lib/messagesocket";
// import toast from "react-hot-toast";
// import { useAuth } from "../context/authContext";

// const ChatSidebar = () => {
//   const {
//     users,
//     workspaces,
//     selectedUser,
//     selectedWorkspace,
//     setSelectedUser,
//     setSelectedWorkspace,
//     isUsersLoading,
//   } = useChat();

//   return (
//     <div className="w-64 border-r border-gray-200 bg-white shrink-0">
//       <h2 className="p-4 font-semibold text-gray-900">Users</h2>
//       {isUsersLoading ? (
//         <p className="p-4 text-gray-500">Loading users...</p>
//       ) : (
//         <ul>
//           {users.map((user) => (
//             <li
//               key={user._id}
//               onClick={() => {
//                 setSelectedWorkspace(null);
//                 setSelectedUser(user);
//               }}
//               className={`cursor-pointer px-4 py-2 hover:bg-indigo-50 ${
//                 selectedUser?._id === user._id ? "bg-indigo-100 font-semibold" : ""
//               }`}
//             >
//               {user.name}
//             </li>
//           ))}
//         </ul>
//       )}

//       <h2 className="p-4 mt-4 font-semibold text-gray-900 border-t border-gray-200">
//         Workspaces
//       </h2>
//       <ul>
//         {workspaces.length === 0 ? (
//           <p className="px-4 text-gray-500">No workspaces found</p>
//         ) : (
//           workspaces.map((ws) => (
//             <li
//               key={ws._id}
//               onClick={() => {
//                 setSelectedWorkspace(ws);
//                 setSelectedUser(null);
//               }}
//               className={`px-4 py-2 cursor-pointer hover:bg-indigo-50 ${
//                 selectedWorkspace?._id === ws._id ? "bg-indigo-100 font-semibold" : ""
//               }`}
//             >
//               {ws.name}
//             </li>
//           ))
//         )}
//       </ul>
//     </div>
//   );
// };

// const ChatPanel = () => {
//   const { user, loading } = useAuth();
//   // console.log("ChatPanel render → user:", user, "loading:", loading);

//   if (loading || !user) {
//     return (
//       <div className="flex-1 flex items-center justify-center text-gray-500">
//         Loading...
//       </div>
//     );
//   }

//   const {
//     messages,
//     selectedUser,
//     selectedWorkspace,
//     fetchMessages,
//     sendMessage,
//     isMessagesLoading,
//     fetchGroupMessages,
//   } = useChat();
//   const [newMessage, setNewMessage] = useState("");

//   // Fetch messages whenever selectedUser or selectedWorkspace changes
//   useEffect(() => {
//     if (selectedUser) {
//       fetchMessages(selectedUser._id);
//     } else if (selectedWorkspace) {
//       fetchGroupMessages(selectedWorkspace._id);
//     }
//   }, [selectedUser, selectedWorkspace]);

//   const handleSend = async () => {
//     if (!newMessage.trim() || (!selectedUser && !selectedWorkspace)) return;

//     try {
//       await sendMessage({ text: newMessage });
//       setNewMessage("");
//     } catch (err) {
//       console.error("Error sending message:", err);
//       toast.error("Failed to send message");
//     }
//   };

//   const chatName = selectedUser?.name || selectedWorkspace?.name;

//   if (!selectedUser && !selectedWorkspace) {
//     return (
//       <div className="flex-1 flex items-center justify-center text-gray-500">
//         Select a user or workspace to start chatting
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 flex flex-col h-full bg-white">
//       <div className="p-4 border-b border-gray-200 font-semibold">{chatName}</div>
//       <div className="flex-1 p-4 overflow-y-auto space-y-2">
//         {isMessagesLoading ? (
//           <p className="text-gray-500">Loading messages...</p>
//         ) : (
//           messages.map((msg) => {
            
//             const senderId = typeof msg.senderId === "string" ? msg.senderId : msg.senderId?._id;
//             const isMine = senderId === user.id;

//             const senderName = isMine ? "You" : msg.senderId?.name || "Unknown";
//             const senderAvatar = msg.senderId?.avatar || "/images/avatar.jpg";

//             return (
//               <div
//                 key={msg._id}
//                 className={`flex items-start gap-2 ${isMine ? "justify-end" : "justify-start"}`}
//               >
//                 {!isMine && (
//                   <img
//                     src={senderAvatar}
//                     alt={msg.senderId.name}
//                     className="w-6 h-6 rounded-full"
//                   />
//                 )}
//                 <div
//                   className={`p-2 rounded-lg max-w-xs wrap-break-word ${
//                     isMine ? "bg-indigo-600 text-white" : "bg-indigo-100"
//                   }`}
//                 >
//                   <span className="font-semibold">{senderName}: </span>
//                   {msg.text || "Attachment"}
//                 </div>
//               </div>
//             );
//           })

//         )}
//       </div>
//       <div className="p-4 border-t border-gray-200 flex items-center gap-2">
//         <input
//           type="text"
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && handleSend()}
//           placeholder="Type a message..."
//           className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         />
//         <button
//           onClick={handleSend}
//           className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default function ChatPage() {
//   const { user } = useAuth();
//   connectSocket(user.id); // ensure socket is connected

//   return (
//     <ChatProvider currentUser={user}>
//       <div className="min-h-screen flex bg-gray-50">
//         <ChatSidebar />
//         <ChatPanel />
//       </div>
//     </ChatProvider>
//   );
// }
