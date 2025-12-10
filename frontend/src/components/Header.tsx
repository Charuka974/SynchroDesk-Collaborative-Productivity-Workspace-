import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/authContext"
import { useEffect, useState } from "react"
import { useNotifications } from "../context/notificationContext";


export default function Header() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    navigate("/login")
  }


  const { notifications, unreadCount, markAsRead, fetchNotifications, fetchUnreadCount, markAllAsRead, deleteNotification } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  return (
    <header className="bg-white border-b-2 border-gray-400 z-50 shadow-sm"> {/* sticky top-0 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-8">
            <Link to="/home" className="flex items-center gap-2 group">
              <div className="invisible w-10 h-10 bg-linear-to-br from-gray-800 to-gray-600 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">SynchroDesk</span>
                <p className="text-xs text-gray-500 -mt-1">Collaborative Workspace</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/home"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition font-medium text-sm"
              >
                Home
              </Link>
              <Link
                to="/workspaces"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition font-medium text-sm"
              >
                Workspaces
              </Link>
              {(user?.roles?.includes("ADMIN") || user?.roles?.includes("AUTHOR")) && (
                <Link
                  to="/workspaces"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition font-medium text-sm"
                >
                  My Workspaces
                </Link>
              )}
            </nav>
          </div>


          {/* Right Side - User Menu */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-gray-100 rounded-lg transition relative cursor-pointer"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center">
                    {/* Ping Animation */}
                    <span className="absolute inline-flex h-5 w-5 rounded-full bg-red-400 opacity-75 animate-ping"></span>

                    {/* Pill Count Badge */}
                    <span className="relative inline-flex h-5 min-w-5 px-1.5 bg-red-500 text-white text-[10px] font-semibold rounded-full items-center justify-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  </span>
                )}

              </button>

              {/* Dropdown */}
              {showNotifications && (
                <>
                  {/* Overlay */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowNotifications(false)}
                  />

                  <div className={`
                    absolute mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-20
                    
                    /* Mobile: Full width minus padding, centered */
                    w-[calc(100vw-2rem)] left-1/2 -translate-x-1/2
                    max-w-sm
                    
                    /* Tablet: Positioned near button */
                    sm:w-96 sm:left-auto sm:right-0 sm:translate-x-0
                    
                    /* Desktop: Standard dropdown */
                    lg:w-md
                  `}>
                      
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-700">Notifications</p>

                      {unreadCount > 0 && (
                        <button
                          onClick={() => {
                            markAllAsRead();
                            fetchNotifications();
                            fetchUnreadCount();
                          }}
                          className="text-xs text-gray-500 hover:text-gray-800 font-bold cursor-pointer border border-gray-300 rounded shadow-sm px-2 py-1 hover:bg-gray-50 transition"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[60vh] sm:max-h-80 lg:max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((noti) => (
                          <div
                            key={noti._id}
                            className={`px-4 py-3 group transition flex flex-col border-b border-gray-200 last:border-none 
                              ${!noti.read ? "bg-blue-50 hover:bg-blue-100" : "bg-white hover:bg-gray-100"}`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <p className={`text-sm text-gray-900 font-semibold flex-1 wrap-break-word
                                ${!noti.read ? "opacity-100" : "opacity-50"}`}>{noti.message}</p>

                              {/* Delete and Mark as Read Buttons */}
                              <div className="flex flex-col sm:flex-row gap-1 shrink-0">
                                {/* Individual Mark as Read */}
                                {!noti.read && (
                                  <button
                                    onClick={async () => {
                                      await markAsRead(noti._id);
                                      fetchNotifications();
                                      fetchUnreadCount();
                                    }}
                                    className="bg-white text-xs text-gray-500 font-bold hover:text-gray-800 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition cursor-pointer border border-gray-300 rounded shadow-sm px-2 py-1 whitespace-nowrap hover:bg-gray-100"
                                  >
                                    Mark as read
                                  </button>
                                )}
                                <button
                                  onClick={async () => {
                                    await deleteNotification(noti._id);
                                    fetchNotifications();
                                    fetchUnreadCount();
                                  }}
                                  className="bg-white text-xs text-red-500 font-bold hover:text-red-700 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition cursor-pointer border border-gray-300 rounded shadow-sm px-2 py-1 whitespace-nowrap hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            <span className="text-xs text-gray-500 mt-1">
                              {noti.createdAt ? new Date(noti.createdAt).toLocaleString() : "Unknown time"}
                            </span>

                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500 text-sm">
                          No notifications
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

            </div>


            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 transition border border-gray-200"
              >
                <div className="w-8 h-8 bg-linear-to-br from-gray-800 to-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                  {user?.avatar ? (
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
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.name || "User"}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-600 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.name || "User"}</p>
                      <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                      {user?.roles && (
                        <div className="flex gap-1 mt-2">
                          {user.roles.map((role: string) => (
                            <span
                              key={role}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Link
                      to="/manage-profile"
                      className="flex items-center gap-3 px-4 py-2 font-bold text-sm text-gray-700 hover:bg-gray-50 transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    {/* <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </Link> */}
                    <div className="border-t border-gray-200"></div>
                    <button
                      onClick={() => {
                        handleLogout()
                        setShowUserMenu(false)
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition w-full"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col gap-2">
              <Link
                to="/home"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition font-medium"
                onClick={() => setShowMobileMenu(false)}
              >
                Home
              </Link>
              <Link
                to="/workspaces"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition font-medium"
                onClick={() => setShowMobileMenu(false)}
              >
                Workspaces
              </Link>
              {(user?.roles?.includes("ADMIN") || user?.roles?.includes("AUTHOR")) && (
                <Link
                  to="/workspaces"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition font-medium"
                  onClick={() => setShowMobileMenu(false)}
                >
                  My Workspaces
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}



//   return (
//     <header className="bg-white border-b-2 border-gray-400 z-50 shadow-sm"> {/* sticky top-0 */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6">
//         <div className="flex items-center justify-between h-16">
//           {/* Logo and Brand */}
//           <div className="flex items-center gap-8">
//             <Link to="/home" className="flex items-center gap-2 group">
//               <div className="invisible w-10 h-10 bg-linear-to-br from-gray-800 to-gray-600 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition">
//                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                 </svg>
//               </div>
//               <div className="hidden sm:block">
//                 <span className="text-xl font-bold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">SynchroDesk</span>
//                 <p className="text-xs text-gray-500 -mt-1">Collaborative Workspace</p>
//               </div>
//             </Link>

//             {/* Desktop Navigation */}
//             <nav className="hidden md:flex items-center gap-1">
//               <Link
//                 to="/home"
//                 className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition font-medium text-sm"
//               >
//                 Home
//               </Link>
//               <Link
//                 to="/workspaces"
//                 className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition font-medium text-sm"
//               >
//                 Workspaces
//               </Link>
//               {(user?.roles?.includes("ADMIN") || user?.roles?.includes("AUTHOR")) && (
//                 <Link
//                   to="/workspaces"
//                   className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition font-medium text-sm"
//                 >
//                   My Workspaces
//                 </Link>
//               )}
//             </nav>
//           </div>


//           {/* Right Side - User Menu */}
//           <div className="flex items-center gap-3">
//             {/* Theme Toggle */}
            
//             <div className="relative">
//               <button
//                 onClick={() => setShowNotifications(!showNotifications)}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition relative hidden sm:block cursor-pointer"
//               >
//                 <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                     d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
//                   />
//                 </svg>

//                 {unreadCount > 0 && (
//                   <span className="absolute -top-1 -right-1 flex items-center justify-center">
//                     {/* Ping Animation */}
//                     <span className="absolute inline-flex h-5 w-5 rounded-full bg-red-400 opacity-75 animate-ping"></span>

//                     {/* Pill Count Badge */}
//                     <span className="relative inline-flex h-5 min-w-5 px-1.5 bg-red-500 text-white text-[10px] font-semibold rounded-full items-center justify-center">
//                       {unreadCount > 99 ? "99+" : unreadCount}
//                     </span>
//                   </span>
//                 )}

//               </button>

//               {/* Dropdown */}
//               {showNotifications && (
//                 <>
//                   {/* Overlay */}
//                   <div
//                     className="fixed inset-0 z-10"
//                     onClick={() => setShowNotifications(false)}
//                   />

//                   <div className=
//                     {`absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20
//                       md:right-0 md:w-80
//                       sm:left-1/2 sm:translate-x-[-50%] sm:w-[90%]`
//                     }>

//                     {/* Header */}
//                     <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
//                       <p className="text-sm font-bold text-gray-700">Notifications</p>

//                       {unreadCount > 0 && (
//                         <button
//                           onClick={() => {
//                             markAllAsRead();
//                             fetchNotifications();
//                             fetchUnreadCount();
//                           }}
//                           className="text-xs text-gray-500 hover:text-gray-800 font-bold cursor-pointer border border-gray-300 rounded shadow-sm p-1"
//                         >
//                           Mark all as read
//                         </button>
//                       )}
//                     </div>

//                     {/* Notification List */}
//                     <div className="max-h-72 overflow-y-auto">
//                       {notifications.length > 0 ? (
//                         notifications.map((noti) => (
//                           <div
//                             key={noti._id}
//                             className={`px-4 py-3 group transition flex flex-col border-b-2 border-gray-400  last:border-none 
//                               ${!noti.read ? "bg-blue-50" : "bg-white"} 
//                               hover:bg-gray-50`}
//                           >
//                             <div className="flex justify-between items-start">
//                               <p className="text-sm text-gray-800">{noti.message}</p>

//                               {/* Delete and Mark as Read Buttons */}
//                               <div className="flex-1 gap-1">
//                                 {/* Individual Mark as Read */}
//                                 {!noti.read && (
//                                   <button
//                                     onClick={async () => {
//                                       await markAsRead(noti._id);
//                                       fetchNotifications();
//                                       fetchUnreadCount();
//                                     }}
//                                     className="text-xs text-gray-500 font-bold opacity-0 hover:text-gray-800 group-hover:opacity-100 transition cursor-pointer border border-gray-300 rounded shadow-sm"
//                                   >
//                                     Mark as read
//                                   </button>
//                                 )}
//                                 <button
//                                   onClick={async () => {
//                                     await deleteNotification(noti._id);
//                                     fetchNotifications();
//                                     fetchUnreadCount();
//                                   }}
//                                   className="text-xs text-red-400 font-bold opacity-0 hover:text-red-800 group-hover:opacity-100 transition cursor-pointer border border-gray-300 rounded shadow-sm"
//                                 >
//                                   Delete
//                                 </button>
//                               </div>
//                             </div>

//                             <span className="text-xs text-gray-500 mt-1">
//                               {noti.createdAt ? new Date(noti.createdAt).toLocaleString() : "Unknown time"}
//                             </span>

//                           </div>
//                         ))
//                       ) : (
//                         <div className="px-4 py-6 text-center text-gray-500 text-sm">
//                           No notifications
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </>
//               )}

//             </div>


//             {/* User Profile Dropdown */}
//             <div className="relative">
//               <button
//                 onClick={() => setShowUserMenu(!showUserMenu)}
//                 className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 transition border border-gray-200"
//               >
//                 <div className="w-8 h-8 bg-linear-to-br from-gray-800 to-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
//                   {user?.avatar ? (
//                     <img
//                       src={user.avatar}
//                       alt={user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
//                       className="w-full h-full object-cover rounded-full"
//                     />
//                   ) : (
//                     <span>
//                       {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
//                     </span>
//                   )}
//                 </div>
//                 <div className="hidden lg:block text-left">
//                   <p className="text-sm font-medium text-gray-900">{user?.name || "User"}</p>
//                   <p className="text-xs text-gray-500">{user?.email}</p>
//                 </div>
//                 <svg
//                   className={`w-4 h-4 text-gray-600 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                 </svg>
//               </button>

//               {/* Dropdown Menu */}
//               {showUserMenu && (
//                 <>
//                   <div
//                     className="fixed inset-0 z-10"
//                     onClick={() => setShowUserMenu(false)}
//                   />
//                   <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
//                     <div className="px-4 py-3 border-b border-gray-200">
//                       <p className="text-sm font-medium text-gray-900">{user?.name || "User"}</p>
//                       <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
//                       {user?.roles && (
//                         <div className="flex gap-1 mt-2">
//                           {user.roles.map((role: string) => (
//                             <span
//                               key={role}
//                               className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium"
//                             >
//                               {role}
//                             </span>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                     <Link
//                       to="/manage-profile"
//                       className="flex items-center gap-3 px-4 py-2 font-bold text-sm text-gray-700 hover:bg-gray-50 transition"
//                       onClick={() => setShowUserMenu(false)}
//                     >
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                       </svg>
//                       My Profile
//                     </Link>
//                     {/* <Link
//                       to="/settings"
//                       className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
//                       onClick={() => setShowUserMenu(false)}
//                     >
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                       </svg>
//                       Settings
//                     </Link> */}
//                     <div className="border-t border-gray-200"></div>
//                     <button
//                       onClick={() => {
//                         handleLogout()
//                         setShowUserMenu(false)
//                       }}
//                       className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition w-full"
//                     >
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                       </svg>
//                       Logout
//                     </button>
//                   </div>
//                 </>
//               )}
//             </div>

//             {/* Mobile Menu Button */}
//             <button
//               onClick={() => setShowMobileMenu(!showMobileMenu)}
//               className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
//             >
//               <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 {showMobileMenu ? (
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 ) : (
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                 )}
//               </svg>
//             </button>
//           </div>
//         </div>

//         {/* Mobile Navigation */}
//         {showMobileMenu && (
//           <div className="md:hidden border-t border-gray-200 py-4">
//             <nav className="flex flex-col gap-2">
//               <Link
//                 to="/home"
//                 className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition font-medium"
//                 onClick={() => setShowMobileMenu(false)}
//               >
//                 Home
//               </Link>
//               <Link
//                 to="/workspaces"
//                 className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition font-medium"
//                 onClick={() => setShowMobileMenu(false)}
//               >
//                 Workspaces
//               </Link>
//               {(user?.roles?.includes("ADMIN") || user?.roles?.includes("AUTHOR")) && (
//                 <Link
//                   to="/workspaces"
//                   className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition font-medium"
//                   onClick={() => setShowMobileMenu(false)}
//                 >
//                   My Workspaces
//                 </Link>
//               )}
//             </nav>
//           </div>
//         )}
//       </div>
//     </header>
//   )
// }