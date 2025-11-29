import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../context/authContext"
import { type TaskPriority, type TaskStatus, useTasks, type ITask } from "../context/taskContext";

export default function SynchroDeskDashboard() {

  const { user } = useAuth();
  const { tasks, loadWorkspaceTasks, loadPersonalTasks, createTask, updateTask } = useTasks();
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "MEDIUM" as TaskPriority,
  });

  const [activeFilter, setActiveFilter] = useState("all");
  const TASK_PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
  const [editTaskData, setEditTaskData] = useState<ITask | null>(null);
  

  useEffect(() => {
    if (workspaceId) {
      loadWorkspaceTasks(workspaceId);
    } else {
      loadPersonalTasks();
    }
  }, [workspaceId]);




  const handleAddTask = async () => {
    if (!newTaskData.title.trim()) return;

    await createTask({
      title: newTaskData.title,
      description: newTaskData.description,
      dueDate: newTaskData.dueDate ? new Date(newTaskData.dueDate).toISOString() : undefined,
      priority: newTaskData.priority,
      workspaceId,
    });

    setNewTaskData({ title: "", description: "", dueDate: "", priority: "MEDIUM" as TaskPriority });
    setShowTaskModal(false);
  };

  const handleCommentUpdate = async (task: ITask, index: number, newMessage: string) => {
    const updatedComments = [...(task.comments || [])];
    updatedComments[index].message = newMessage;
    if (!task._id) return;
    await updateTask(task._id!, { comments: updatedComments });
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === "TODO" as TaskStatus).length,
    inProgress: tasks.filter(t => t.status === "IN_PROGRESS" as TaskStatus).length,
    done: tasks.filter(t => t.status === "DONE" as TaskStatus).length,
  };

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === "all") return true;
    const map: Record<string, TaskStatus> = {
      Pending: "TODO" as TaskStatus,
      "In Progress": "IN_PROGRESS" as TaskStatus,
      Done: "DONE" as TaskStatus,
    };
    return task.status === (map[activeFilter] || activeFilter);
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* <Sidebar /> */}

      {/* Main Content */}
      <main className="p-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}</h1>
            <p className="text-gray-600 mt-1">Here's your targets for today</p>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Total Tasks</span>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">All tasks</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Pending</span>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
            <p className="text-xs text-gray-500 mt-1">Need attention</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">In Progress</span>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
            <p className="text-xs text-gray-500 mt-1">Active now</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Completed</span>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.done}</p>
            <p className="text-xs text-gray-500 mt-1">This week</p>
          </div>
        </div> 

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Tasks Panel */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Tasks</h2>
              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Task
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 border-b border-gray-200">
              {["all", "Pending", "In Progress", "Done"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
                    activeFilter === filter
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {filter === "all" ? "All" : filter}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredTasks.map((task) => (
                <div
                  key={task._id} // use _id from backend
                  className={`p-4 rounded-lg border-l-4 ${
                    task.status === "DONE"
                      ? "bg-green-50 border-green-500"
                      : task.status === "IN_PROGRESS"
                      ? "bg-purple-50 border-purple-500"
                      : "bg-yellow-50 border-yellow-500"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={task.status === "DONE"}
                          onChange={async () => {
                            if (!workspaceId) return;
                            const newStatus = task.status === "DONE" ? "TODO" : "DONE";
                            await updateTask(task._id!, { status: newStatus });
                            await loadWorkspaceTasks(workspaceId); // refresh tasks after completion
                          }}
                          className="w-4 h-4 rounded"
                        />

                        <h3
                          className={`font-semibold ${
                            task.status === "DONE"
                              ? "line-through text-gray-500"
                              : "text-gray-900"
                          }`}
                        >
                          {task.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        {task.dueDate && (
                          <span className="flex items-center gap-1 text-gray-600">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            task.priority === "HIGH"
                              ? "bg-red-100 text-red-700"
                              : task.priority === "MEDIUM"
                              ? "bg-yellow-100 text-yellow-700"
                              : task.priority === "LOW"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-gray-600">{task.assignedTo}</span>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Task</h2>
            <input
              type="text"
              placeholder="Task title..."
              value={newTaskData.title}
              onChange={e => setNewTaskData({ ...newTaskData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              placeholder="Description..."
              value={newTaskData.description}
              onChange={e => setNewTaskData({ ...newTaskData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="date"
              value={newTaskData.dueDate}
              onChange={e => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={newTaskData.priority}
              onChange={e => setNewTaskData({ ...newTaskData, priority: e.target.value as TaskPriority })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {TASK_PRIORITIES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <div className="flex gap-3">
              <button onClick={() => setShowTaskModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddTask} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Task</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editTaskData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Task</h2>
            <input
              type="text"
              value={editTaskData.title}
              onChange={e => setEditTaskData({...editTaskData, title: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-2"
            />
            <textarea
              value={editTaskData.description}
              onChange={e => setEditTaskData({...editTaskData, description: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-2"
            />
            <input
              type="date"
              value={editTaskData.dueDate?.slice(0,10) || ""}
              onChange={e => setEditTaskData({...editTaskData, dueDate: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-2"
            />
            <select
              value={editTaskData.priority}
              onChange={e => setEditTaskData({...editTaskData, priority: e.target.value as TaskPriority})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
            >
              {TASK_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setEditTaskData(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
              <button
                onClick={async () => {
                  if (!editTaskData._id || !workspaceId) return;
                  await updateTask(editTaskData._id, {
                    title: editTaskData.title,
                    description: editTaskData.description,
                    dueDate: editTaskData.dueDate ? new Date(editTaskData.dueDate).toISOString() : undefined,
                    priority: editTaskData.priority,
                  });
                  await loadWorkspaceTasks(workspaceId);
                  setEditTaskData(null);
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}