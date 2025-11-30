import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/authContext";
import {
  type TaskPriority,
  type TaskStatus,
  useTasks,
  type ITask
} from "../context/taskContext";

export default function SynchroDeskDashboard() {
  const { user } = useAuth();
  const {
    tasks,
    loadWorkspaceTasks,
    loadPersonalTasks,
    createTask,
    updateTask,
    changeStatus
  } = useTasks();

  const { workspaceId } = useParams<{ workspaceId: string }>();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editTaskData, setEditTaskData] = useState<ITask | null>(null);

  const [newTaskData, setNewTaskData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "MEDIUM" as TaskPriority
  });

  // Comment UI state (per-task)
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>(
    {}
  );
  const [editingIndex, setEditingIndex] = useState<Record<string, number | null>>(
    {}
  );
  const [editingText, setEditingText] = useState<Record<string, string>>({});

  const [activeFilter, setActiveFilter] = useState("all");
  const TASK_PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

  // Load tasks (workspace or personal)
  useEffect(() => {
    if (workspaceId) loadWorkspaceTasks(workspaceId);
    else loadPersonalTasks();
  }, [workspaceId]);

  // Add new task
  const handleAddTask = async () => {
    if (!newTaskData.title.trim()) return;

    await createTask({
      title: newTaskData.title,
      description: newTaskData.description,
      dueDate: newTaskData.dueDate
        ? new Date(newTaskData.dueDate).toISOString()
        : undefined,
      priority: newTaskData.priority,
      workspaceId
    });

    setNewTaskData({
      title: "",
      description: "",
      dueDate: "",
      priority: "MEDIUM"
    });

    setShowTaskModal(false);
  };

  // Comments
  const addComment = async (task: ITask) => {
    const text = newCommentText[task._id!] || "";
    if (!text.trim()) return;

    const updated = [
      ...(task.comments || []),
      {
        userId: user._id,
        message: text.trim(),
        createdAt: new Date()
      }
    ];

    await updateTask(task._id!, { comments: updated });

    setNewCommentText(prev => ({ ...prev, [task._id!]: "" }));
    refreshTasks();
  };

  const saveCommentEdit = async (task: ITask, index: number) => {
    const updated = [...(task.comments || [])];
    updated[index].message = editingText[task._id!] || "";

    await updateTask(task._id!, { comments: updated });

    setEditingIndex(prev => ({ ...prev, [task._id!]: null }));
    setEditingText(prev => ({ ...prev, [task._id!]: "" }));
    refreshTasks();
  };

  const deleteComment = async (task: ITask, index: number) => {
    const updated = task.comments?.filter((_, i) => i !== index) || [];

    await updateTask(task._id!, { comments: updated });
    refreshTasks();
  };

  const refreshTasks = () => {
    if (workspaceId) loadWorkspaceTasks(workspaceId);
    else loadPersonalTasks();
  };

  // Filters
  const filteredTasks = tasks.filter(task => {
    if (activeFilter === "all") return true;

    const map: Record<string, TaskStatus> = {
      Pending: "TODO",
      "In Progress": "IN_PROGRESS",
      Done: "DONE"
    };

    return task.status === map[activeFilter];
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === "TODO").length,
    inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
    done: tasks.filter(t => t.status === "DONE").length
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <main className="p-6">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}
          </h1>
          <p className="text-gray-600 mt-1">Here's your targets for today</p>
        </header>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* CARD */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <span className="text-gray-600 text-sm font-medium">
              Total Tasks
            </span>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <span className="text-gray-600 text-sm font-medium">Pending</span>
            <p className="text-3xl font-bold">{stats.pending}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <span className="text-gray-600 text-sm font-medium">
              In Progress
            </span>
            <p className="text-3xl font-bold">{stats.inProgress}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <span className="text-gray-600 text-sm font-medium">
              Completed
            </span>
            <p className="text-3xl font-bold">{stats.done}</p>
          </div>
        </div>

        {/* MAIN TASKS PANEL */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">My Tasks</h2>

            <button
              onClick={() => setShowTaskModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Add Task
            </button>
          </div>

          {/* FILTER TABS */}
          <div className="flex gap-2 mb-4 border-b">
            {["all", "Pending", "In Progress", "Done"].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeFilter === f
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-600"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* TASK LIST */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredTasks.map(task => {
              const id = task._id!;
              const isOpen = openTaskId === id;

              return (
                <div
                  key={id}
                  className={`p-4 rounded-lg border-l-4 ${
                    task.status === "DONE"
                      ? "border-green-500 bg-green-50"
                      : task.status === "IN_PROGRESS"
                      ? "border-purple-500 bg-purple-50"
                      : "border-yellow-500 bg-yellow-50"
                  }`}
                >
                  {/* TOP AREA */}
                  <div
                    className="flex justify-between cursor-pointer"
                    onClick={() =>
                      setOpenTaskId(prev => (prev === id ? null : id))
                    }
                  >
                    <div className="flex gap-2 items-center">
                      {/* COMPLETE TOGGLE */}
                      {/* <input
                        type="checkbox"
                        checked={task.status === "DONE"}
                        onChange={async e => {
                          e.stopPropagation();

                          const newStatus =
                            task.status === "DONE" ? "TODO" : "DONE";

                          await changeStatus(id, newStatus);
                          refreshTasks();
                        }}
                      /> */}
                      <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={task.status === "DONE"}
                        onChange={async e => {
                          e.stopPropagation();
                          const newStatus = task.status === "DONE" ? "TODO" : "DONE";
                          await changeStatus(id, newStatus);
                          refreshTasks();
                        }}
                        className="sr-only peer" // hide default checkbox
                      />
                      <div
                        className="w-6 h-6 bg-white border-2 border-gray-300 rounded-md
                                  peer-checked:bg-green-500 peer-checked:border-green-500
                                  transition-colors shrink-0"
                      >
                        {/* Optional: checkmark */}
                        {task.status === "DONE" && (
                          <svg
                            className="w-4 h-4 text-white mx-auto my-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </label>

                      <h3
                        className={`font-semibold ${
                          task.status === "DONE"
                            ? "line-through text-gray-500"
                            : "text-gray-900"
                        }`}
                      >
                        {task.title}
                      </h3>
                      {/* Task meta info */}
                      <div className="flex flex-wrap gap-3 text-xs text-gray-600 mt-1">

                        {/* DUE DATE */}
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                        </span>

                        {/* PRIORITY */}
                        <span
                          className={`px-2 py-1 rounded text-white ${
                            task.priority === "URGENT"
                              ? "bg-red-600"
                              : task.priority === "HIGH"
                              ? "bg-orange-500"
                              : task.priority === "MEDIUM"
                              ? "bg-blue-500"
                              : "bg-gray-500"
                          }`}
                        >
                          {task.priority}
                        </span>

                        {/* COMMENT COUNT */}
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 8h10M7 12h4m1 8l-5-5H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-5 5z"
                            />
                          </svg>
                          {(task.comments || []).length}
                        </span>

                      </div>

                    </div>

                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenTaskId(id); // keep row open
                          setEditingIndex({}); // close comment edits
                          setEditTaskData(task); // <-- THIS OPENS THE EDIT MODAL
                        }}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                      >
                        <span>Edit</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 text-gray-600 hover:text-gray-800"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-4-4l5-5m0 0l-5 5m5-5L13 7"
                          />
                        </svg>
                      </button>
                    </div>

                  </div>

                  {/* EXPANDED SECTION */}
                  {isOpen && (
                    <div className="mt-3 bg-white p-3 rounded border">
                      <p className="text-gray-700 mb-3">
                        {task.description || "No description"}
                      </p>

                      {/* COMMENTS */}
                      <h4 className="font-semibold mb-2">Comments</h4>

                      {(task.comments || []).map((c, index) => {
                        const editing = editingIndex[id] === index;

                        return (
                          <div
                            key={index}
                            className="bg-gray-50 p-2 rounded border mb-2"
                          >
                            {editing ? (
                              <>
                                <textarea
                                  className="w-full p-2 border rounded"
                                  value={editingText[id] || ""}
                                  onChange={e =>
                                    setEditingText(prev => ({
                                      ...prev,
                                      [id]: e.target.value
                                    }))
                                  }
                                />
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => saveCommentEdit(task, index)}
                                    className="px-3 py-1 bg-indigo-500 text-white rounded"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() =>
                                      setEditingIndex(prev => ({
                                        ...prev,
                                        [id]: null
                                      }))
                                    }
                                    className="px-3 py-1 bg-gray-300 rounded"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <p>{c.message}</p>

                                <div className="flex gap-3 mt-1 text-xs text-gray-500">
                                  <button
                                    onClick={() => {
                                      setEditingIndex(prev => ({
                                        ...prev,
                                        [id]: index
                                      }));
                                      setEditingText(prev => ({
                                        ...prev,
                                        [id]: c.message
                                      }));
                                    }}
                                    className="hover:text-indigo-600"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteComment(task, index)}
                                    className="hover:text-red-600"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}

                      {/* ADD COMMENT */}
                      <textarea
                        className="w-full p-2 border rounded mt-2"
                        placeholder="Write a comment..."
                        value={newCommentText[id] || ""}
                        onChange={e =>
                          setNewCommentText(prev => ({
                            ...prev,
                            [id]: e.target.value
                          }))
                        }
                      />

                      <button
                        onClick={() => addComment(task)}
                        className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded"
                      >
                        Add Comment
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ADD TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add New Task</h2>

            <input
              type="text"
              placeholder="Task title..."
              value={newTaskData.title}
              onChange={e =>
                setNewTaskData({ ...newTaskData, title: e.target.value })
              }
              className="w-full p-3 border rounded mb-2"
            />

            <textarea
              placeholder="Description..."
              value={newTaskData.description}
              onChange={e =>
                setNewTaskData({ ...newTaskData, description: e.target.value })
              }
              className="w-full p-3 border rounded mb-2"
            />

            <input
              type="date"
              value={newTaskData.dueDate}
              onChange={e =>
                setNewTaskData({ ...newTaskData, dueDate: e.target.value })
              }
              className="w-full p-3 border rounded mb-2"
            />

            <select
              value={newTaskData.priority}
              onChange={e =>
                setNewTaskData({
                  ...newTaskData,
                  priority: e.target.value as TaskPriority
                })
              }
              className="w-full p-3 border rounded mb-4"
            >
              {TASK_PRIORITIES.map(p => (
                <option key={p}>{p}</option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTaskModal(false)}
                className="flex-1 p-3 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleAddTask}
                className="flex-1 p-3 bg-indigo-600 text-white rounded"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL (unchanged but working) */}
      {editTaskData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit Task</h2>

            <input
              type="text"
              value={editTaskData.title}
              onChange={e =>
                setEditTaskData({ ...editTaskData, title: e.target.value })
              }
              className="w-full p-3 border rounded mb-2"
            />

            <textarea
              value={editTaskData.description}
              onChange={e =>
                setEditTaskData({
                  ...editTaskData,
                  description: e.target.value
                })
              }
              className="w-full p-3 border rounded mb-2"
            />

            <input
              type="date"
              value={editTaskData.dueDate?.slice(0, 10) || ""}
              onChange={e =>
                setEditTaskData({
                  ...editTaskData,
                  dueDate: e.target.value
                })
              }
              className="w-full p-3 border rounded mb-2"
            />

            <select
              value={editTaskData.priority}
              onChange={e =>
                setEditTaskData({
                  ...editTaskData,
                  priority: e.target.value as TaskPriority
                })
              }
              className="w-full p-3 border rounded mb-4"
            >
              {TASK_PRIORITIES.map(p => (
                <option key={p}>{p}</option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => setEditTaskData(null)}
                className="flex-1 p-3 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  if (!editTaskData._id) return;

                  await updateTask(editTaskData._id, {
                    title: editTaskData.title,
                    description: editTaskData.description,
                    dueDate: editTaskData.dueDate
                      ? new Date(editTaskData.dueDate).toISOString()
                      : undefined,
                    priority: editTaskData.priority
                  });

                  refreshTasks();
                  setEditTaskData(null);
                }}
                className="flex-1 p-3 bg-indigo-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
