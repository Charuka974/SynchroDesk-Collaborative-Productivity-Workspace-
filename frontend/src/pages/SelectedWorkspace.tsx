import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";

import { motion } from "framer-motion";
import { TaskProvider, useTasks, type ICreateTaskPayload} from "../context/taskContext";
import { TaskPanel } from "../components/Tasks";
import { ChatProvider } from "../context/messageContext";
import { useAuth } from "../context/authContext";
import { Chat } from "../components/Chat";
import { NotesPanel } from "../components/Notes";
import { ResourcesPanel } from "../components/WorkspaceFiles";
import {CalendarPanel} from "../components/WorkspaceCalender";
import { getWorkspaceByIdContext, getWorkspaceDataContext } from "../context/workspaceContext";
import { NotesProvider } from "../context/noteContext";

export default function WorkspacesPage() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const id = params.get("id");
  const [currentTab, setCurrentTab] = useState("Tasks");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  type Member = {
    id: string;
    name: string;
    email: string;
    role: string;
    online?: boolean;
    avatar?: string;
  };

  type Workspace = {
    id: string;
    name: string;
    description: string;
    role: string;
    members: Member[];
    color: string;
    taskCount: number;
  };

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const WorkspaceTasks = ({ workspaceId }: { workspaceId: string }) => {
    const { tasks,loadWorkspaceTasks, changeStatus, updateTask, createTask, deleteTask } = useTasks();
    const [activeFilter, setActiveFilter] = useState("Pending");

    // Load tasks for this workspace
    useEffect(() => {
      loadWorkspaceTasks(workspaceId); // You may need to adjust API to accept workspaceId
    }, [workspaceId]);
    const refreshTasks = () => loadWorkspaceTasks(workspaceId);
    const createTaskWithWorkspace = async (task: Omit<ICreateTaskPayload, "workspaceId">) => {
      await createTask({ ...task, workspaceId });
      refreshTasks();
    };

    return (
      <TaskPanel
        tasks={tasks}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        createTask={createTaskWithWorkspace}
        updateTask={updateTask}
        changeStatus={changeStatus}
        refreshTasks={refreshTasks}
        deleteTask={deleteTask}
      />

    );
  };


  // Load workspace list
  useEffect(() => {
    getWorkspaceDataContext()
      .then(setWorkspaces)
      .finally(() => setLoading(false));
  }, []);

  // If URL has ?id=xxx → auto-open workspace
  useEffect(() => {
    if (!id) return;
    openWorkspace(id);
  }, [id]);

  const openWorkspace = async (workspaceId: string) => {
    setLoading(true);
    try {
      const ws = await getWorkspaceByIdContext(workspaceId);
      setActiveWorkspace(ws);
    } catch (err) {
      console.error(err);
      Toast.fire({ icon: "error", title: "Failed to load workspace" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  // Workspace inner layout UI
  const WorkspaceLayout = ({ workspace }: { workspace: Workspace }) => (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-60 bg-white border-r-2 border-gray-400 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Close button for mobile */}
        <button
          className="lg:hidden absolute top-4 right-4 text-white hover:text-gray-200"
          onClick={() => setSidebarOpen(false)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-4 sm:p-6 bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl border-b border-slate-600 text-white">
          <h1 className="text-xl sm:text-2xl font-bold wrap-break-word">{workspace.name}</h1>
          <p className="text-white text-opacity-90 text-sm wrap-break-word">{workspace.description}</p>
        </div>

        {/* Members */}
        <div className="p-3 sm:p-4 border-b-2 border-gray-400">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
            Team Members
          </h3>
          <div className="space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
            {workspace.members.map((m, index) => (
              <div
                key={m.id ?? m.email ?? index}
                className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-gray-50 rounded-lg"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-linear-to-r from-gray-500 to-gray-900 flex items-center justify-center text-white font-semibold shrink-0">
                  {m.avatar
                  ? <img src={m.avatar} className="w-full h-full object-cover rounded-4xl" />
                  : (m.name?.charAt(0)?.toUpperCase() || "?")}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                    {m.name ?? "Unknown User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{m.role ?? "Member"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
            Quick Actions
          </h3>
          <button className="w-full mb-2 px-3 sm:px-4 py-2 bg-gray-50 text-red-600 rounded-lg text-sm"
            onClick={() => {
              setCurrentTab("Chat");
              setSidebarOpen(false);
            }}
            >
            Chat
          </button>
          <button className="w-full mb-2 px-3 sm:px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm"
            onClick={() => {
              setCurrentTab("Tasks");
              setSidebarOpen(false);
            }}
            >
            Tasks
          </button>
          <button className="w-full mb-2 px-3 sm:px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm"
            onClick={() => {
              setCurrentTab("Notes");
              setSidebarOpen(false);
            }}
            >
            Notes
          </button>
          <button className="w-full mb-2 px-3 sm:px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm"
            onClick={() => {
              setCurrentTab("Events");
              setSidebarOpen(false);
            }}
            >
            Events
          </button>
          <button className="w-full px-3 sm:px-4 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm"
            onClick={() => {
              setCurrentTab("Files");
              setSidebarOpen(false);
            }}
            >
            Files
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">

        {/* Mobile Header with Hamburger */}
        <div className="lg:hidden bg-white border-b border-gray-600 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold truncate">{workspace.name}</h2>
          <div className="w-10"></div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-600 px-2 sm:px-6 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {["Chat", "Tasks", "Notes", "Events", "Files"].map((tab) => (
              <button
                key={tab}
                className={`px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-all duration-200 relative whitespace-nowrap ${
                  currentTab === tab 
                    ? "text-gray-600" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setCurrentTab(tab)}
              >
                {tab}
                {currentTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-600"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col min-h-0 bg-gray-300 overflow-y-auto">
          {currentTab === "Chat" && (
            <div className="w-full h-full">
              <ChatProvider currentUser={user}>
                <Chat initialWorkspaceId={workspace.id} />
              </ChatProvider>
            </div>
          )} 

          {currentTab !== "Chat" && (
            <div className="flex-1 min-h-0">
              {currentTab === "Tasks" && (
                <TaskProvider>
                  <WorkspaceTasks workspaceId={workspace.id} />
                </TaskProvider>
              )}

              {currentTab === "Notes" && (
                <NotesProvider>
                  <NotesPanel workspace={workspace}/>
                </NotesProvider>
              )}

              {currentTab === "Events" && (
                <CalendarPanel />
              )}

              {currentTab === "Files" && (
                <ResourcesPanel />
              )}
              
            </div>
          )}
        </div>

      </div>

    </div>

  );

  return (
    <div className="min-h-screen bg-gray-50">
      {!activeWorkspace ? (
        <>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Workspaces</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openWorkspace(ws.id)}
              >
                <h3 className="text-lg sm:text-xl font-bold mb-1 wrap-break-word">{ws.name}</h3>
                <p className="text-gray-500 text-sm mb-2 wrap-break-word">{ws.description}</p>

                <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                  {ws.role}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <WorkspaceLayout workspace={activeWorkspace} />
      )}
    </div>
  );
}