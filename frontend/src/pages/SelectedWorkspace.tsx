import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getMyWorkspacesAPI, getWorkspaceByIdAPI } from "../services/workspace";
import Swal from "sweetalert2";
import ChatWindow from "../components/Chat";
import { motion } from "framer-motion";
import { TaskProvider, useTasks, type ICreateTaskPayload} from "../context/taskContext";
import { TaskPanel } from "../components/Tasks";


export default function WorkspacesPage() {
  const [params] = useSearchParams();
  const id = params.get("id");
  const [currentTab, setCurrentTab] = useState("Woerkspace");

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

  // const [showTaskModal, setShowTaskModal] = useState(false);
  // const [activeFilter, setActiveFilter] = useState("Pending");
  // const [editTaskData, setEditTaskData] = useState<ITask | null>(null);
  // const { tasks, loadPersonalTasks, changeStatus } = useTasks();
  // const refreshTasks = () => {
  //   loadPersonalTasks();
  // };

  const WorkspaceTasks = ({ workspaceId }: { workspaceId: string }) => {
    const { tasks,loadWorkspaceTasks, loadPersonalTasks, changeStatus, updateTask, createTask } = useTasks();
    const [activeFilter, setActiveFilter] = useState("Pending");

    // Load tasks for this workspace
    useEffect(() => {
      loadWorkspaceTasks(workspaceId); // You may need to adjust API to accept workspaceId
    }, [workspaceId]);
    const refreshTasks = () => loadPersonalTasks();
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
      />

    );
  };



  // Load workspace list
  useEffect(() => {
    getMyWorkspacesAPI()
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
      const ws = await getWorkspaceByIdAPI(workspaceId);
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
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 bg-linear-to-r from-indigo-500 to-purple-600 text-white">
          <h1 className="text-2xl font-bold">{workspace.name}</h1>
          <p className="text-white text-opacity-90">{workspace.description}</p>
        </div>

        {/* Members */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
            Team Members
          </h3>
          <div className="space-y-2">
            {workspace.members.map((m, index) => (
              <div
                key={m.id ?? m.email ?? index} // <= safe and guaranteed unique
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
              >
                <div className="w-10 h-10 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {m.avatar ?? m.name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {m.name ?? "Unknown User"}
                  </p>
                  <p className="text-xs text-gray-500">{m.role ?? "Member"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
            Quick Actions
          </h3>
          <button className="w-full mb-2 px-4 py-2 bg-indigo-50 text-red-600 rounded-lg"
            onClick={() => setCurrentTab("Chat")}
            >
            Chat
          </button>
          <button className="w-full mb-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg"
            onClick={() => setCurrentTab("Tasks")}
            >
            Tasks
          </button>
          <button className="w-full mb-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg"
            onClick={() => setCurrentTab("Notes")}
            >
            Notes
          </button>
          <button className="w-full mb-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg"
            onClick={() => setCurrentTab("Events")}
            >
            Events
          </button>
          <button className="w-full px-4 py-2 bg-orange-50 text-orange-600 rounded-lg"
            onClick={() => setCurrentTab("Files")}
            >
            Files
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6">
          <div className="flex gap-1">
            {["Home", "Chat", "Tasks", "Notes", "Files", "Calendar"].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-3 text-sm font-medium transition-all duration-200 relative ${
                  currentTab === tab 
                    ? "text-indigo-600" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setCurrentTab(tab)}
              >
                {tab}
                {currentTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 flex bg-gray-300 h-100">
          {currentTab === "Chat" && (
            <div className="w-full h-full">
              <ChatWindow
                userId="me"
                workspaceId={workspace.id}
              />
            </div>
          )}

          {currentTab !== "Chat" && (
            <div className="flex-1 overflow-y-auto">
              {currentTab === "Home" && (
                <>
                  <h2 className="text-xl font-bold mb-4">
                    Welcome to {workspace.name}
                  </h2>
                  <p>Workspace details and tasks will appear here.</p>
                </>
              )}

              {currentTab === "Tasks" && (
                <TaskProvider>
                  <WorkspaceTasks workspaceId={workspace.id} />
                </TaskProvider>
              )}


              {currentTab === "Notes" && <p>Notes panel</p>}
              {currentTab === "Files" && <p>Files list</p>}
              {currentTab === "Events" && <p>Calendar UI</p>}
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
          <h1 className="text-3xl font-bold mb-6">Workspaces</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md"
                onClick={() => openWorkspace(ws.id)}
              >
                <h3 className="text-xl font-bold mb-1">{ws.name}</h3>
                <p className="text-gray-500 text-sm mb-2">{ws.description}</p>

                <span className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-medium">
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
