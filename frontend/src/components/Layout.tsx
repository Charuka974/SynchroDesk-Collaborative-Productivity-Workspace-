// import Header from "./Header"
// import { Outlet } from "react-router-dom"
// import Sidebar from "./Sidebar"

// function Layout() {
//   return (
//     <div className="min-h-screen flex flex-col bg-gray-50">
//       <Sidebar />
//       {/* <Header /> */}
//       <main className="flex-1 container mx-auto p-4">
//         <Outlet />
//       </main>
//     </div>
//   )
// }

// export default Layout


import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header"
import Footer from "./Footer"
import { NotificationsProvider } from "../context/notificationContext";
// import FloatButtonContainer from "./FloatButton"

function Layout() {
  // Lift the sidebar collapsed state to layout to adjust main content
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onCollapseToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      

      {/* Main content area */}
      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        {/* Header */}
        <NotificationsProvider>
          <Header />
        </NotificationsProvider>
        
        {/* Page content */}
        <div className="flex-1">
          <Outlet />
        </div>

        {/* Page Footer */}
        <Footer />

        {/* Floating Action Buttons */}
        {/* <FloatButtonContainer /> */}

      </main>
    </div>
  );
}

export default Layout;
