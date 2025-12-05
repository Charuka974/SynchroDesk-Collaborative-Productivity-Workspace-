import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/authContext";
import {
  type TaskPriority,
  type TaskStatus,
  useTasks,
  type ITask,
} from "../context/taskContext";
import { CheckCircle2, Clock, ListTodo } from "lucide-react";
import Swal from "sweetalert2";

export default function SynchroDeskDashboard() {
  const { user } = useAuth();
  const {
    tasks,
    allWorkspaceTasks,
    loadPersonalTasks,
    loadAllWorkspaceTasks,
    createTask,
    updateTask,
    changeStatus,
    deleteTask
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

  const [activeFilter, setActiveFilter] = useState("Pending");
  const TASK_PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
  const [workspaceFilter, setWorkspaceFilter] = useState("Pending");


  // Load tasks (workspace or personal)
  useEffect(() => {
    loadAllWorkspaceTasks();
    loadPersonalTasks();
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
    refreshWorkspaceTasks();
  };

  const saveCommentEdit = async (task: ITask, index: number) => {
    const updated = [...(task.comments || [])];
    updated[index].message = editingText[task._id!] || "";

    await updateTask(task._id!, { comments: updated });

    setEditingIndex(prev => ({ ...prev, [task._id!]: null }));
    setEditingText(prev => ({ ...prev, [task._id!]: "" }));
    refreshTasks();
    refreshWorkspaceTasks();
  };

  const deleteComment = async (task: ITask, index: number) => {
    const updated = task.comments?.filter((_, i) => i !== index) || [];

    await updateTask(task._id!, { comments: updated });
    refreshTasks();
    refreshWorkspaceTasks();
  };

  const refreshTasks = async () => {
    // if (workspaceId) loadWorkspaceTasks(workspaceId);
    await loadPersonalTasks();
  };

  const refreshWorkspaceTasks = async () => {
    await loadAllWorkspaceTasks();
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
    refreshTasks();
  };


  // Filters
  const filteredTasks = tasks.filter(task => {
    if (activeFilter === "All") return true;

    const map: Record<string, TaskStatus> = {
      Pending: "TODO",
      // "In Progress": "IN_PROGRESS",
      Done: "DONE"
    };

    return task.status === map[activeFilter];
  });


  const allTasksCombined = [
    ...tasks, // personal tasks
    ...allWorkspaceTasks.flatMap(ws => ws.tasks) // workspace tasks
  ];

  const stats = {
    total: allTasksCombined.length,
    pending: allTasksCombined.filter(t => t.status === "TODO").length,
    // inProgress: allTasksCombined.filter(t => t.status === "IN_PROGRESS").length,
    done: allTasksCombined.filter(t => t.status === "DONE").length
  };

  // const stats = {
  //   total: tasks.length,
  //   pending: tasks.filter(t => t.status === "TODO").length,
  //   inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
  //   done: tasks.filter(t => t.status === "DONE").length
  // };

  const filteredWorkspaceTasks = allWorkspaceTasks?.map(ws => ({
    ...ws,
    tasks: ws.tasks.filter(task => {
      if (workspaceFilter === "All") return true;

      const map: Record<string, TaskStatus> = {
        Pending: "TODO",
        // "In Progress": "IN_PROGRESS",
        Done: "DONE"
      };

      return task.status === map[workspaceFilter];
    })
  }));


  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <main className="p-6">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between mb-8">
          <h1 className="text-2xl font-bold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
            Welcome back, {user.name}
          </h1>
          <p className="font-semibold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent mt-1">Here's your targets for today</p>
        </header>

        {/* STATS */}
        <div className="p-8 bg-linear-to-br from-gray-50 to-gray-100">
          <div className="max-w-7xl mx-auto">
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"></div> */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Total Tasks */}
              <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-blue-100 text-sm font-semibold uppercase tracking-wide">
                      Total Tasks
                    </span>
                    <ListTodo className="w-8 h-8 text-blue-200 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <p className="text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stats.total}
                  </p>
                  <div className="h-1 w-16 bg-blue-300 rounded-full group-hover:w-24 transition-all duration-300"></div>
                </div>
              </div>

              {/* Pending */}
              <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-amber-500 to-orange-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-orange-100 text-sm font-semibold uppercase tracking-wide">
                      Pending
                    </span>
                    <Clock className="w-8 h-8 text-orange-200 group-hover:animate-pulse" />
                  </div>
                  <p className="text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stats.pending}
                  </p>
                  <div className="h-1 w-16 bg-orange-300 rounded-full group-hover:w-24 transition-all duration-300"></div>
                </div>
              </div>

              {/* In Progress */}
              {/* <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-purple-500 to-purple-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-purple-100 text-sm font-semibold uppercase tracking-wide">
                      In Progress
                    </span>
                    <PlayCircle className="w-8 h-8 text-purple-200 group-hover:rotate-90 transition-transform duration-500" />
                  </div>
                  <p className="text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stats.inProgress}
                  </p>
                  <div className="h-1 w-16 bg-purple-300 rounded-full group-hover:w-24 transition-all duration-300"></div>
                </div>
              </div> */}

              {/* Completed */}
              <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-500 to-green-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-green-100 text-sm font-semibold uppercase tracking-wide">
                      Completed
                    </span>
                    <CheckCircle2 className="w-8 h-8 text-green-200 group-hover:scale-125 transition-transform duration-300" />
                  </div>
                  <p className="text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stats.done}
                  </p>
                  <div className="h-1 w-16 bg-green-300 rounded-full group-hover:w-24 transition-all duration-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        

        {/* MAIN TASKS PANEL */}
        <div className="space-y-6 rounded-xl bg-white shadow-sm border border-gray-300 p-6 ">
          {/* Personal Tasks */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-extrabold text-2xl bg-linear-to-r from-slate-600 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              My Tasks
            </h2>

            <button
              onClick={() => setShowTaskModal(true)}
              className="px-4 py-2 bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl border-b border-slate-600 font-bold text-white rounded-lg"
            >
              Add Personal Task
            </button>
          </div>

          {/* FILTER TABS */}
          <div className="flex gap-2 mb-4 border-b border-gray-300 shadow-sm">
            {/* {["All", "Pending", "In Progress", "Done"].map(f => ( */}
            {["All", "Pending", "Done"].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeFilter === f
                    ? "border-blue-900 text-blue-900"
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
                  className={`p-4 rounded-lg border-l-4 border-b-2 ${
                    task.status === "DONE"
                      ? "border-green-500 bg-green-100"
                      : task.status === "IN_PROGRESS"
                      ? "border-purple-500 bg-purple-100"
                      : "border-yellow-500 bg-yellow-100"
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
                          className="w-6 h-6 bg-white border-2 border-gray-300 shadow-sm rounded-md
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

                    <div className="relative flex items-center gap-2 h-full">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenTaskId(id); // keep row open
                          setEditingIndex({}); // close comment edits
                          setEditTaskData(task); // <-- THIS OPENS THE EDIT MODAL
                        }}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-800 font-bold text-s"
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
                      <div className="border border-gray-400 h-7"></div>
                      <button
                        onClick={async () => {
                          const result = await Swal.fire({
                            title: "Delete Task?",
                            text: "This action cannot be undone.",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#dc2626", // red-600
                            cancelButtonColor: "#6b7280",  // gray-500
                            confirmButtonText: "Yes, delete it",
                          });

                          if (result.isConfirmed) {
                            handleDeleteTask(task._id);
                            Swal.fire({
                              icon: "success",
                              title: "Deleted!",
                              text: "The task has been removed.",
                              timer: 1400,
                              showConfirmButton: false
                            });
                          }
                        }}
                        className="flex items-center gap-1 text-red-400 hover:text-red-600 font-bold text-s"
                      >
                        <span>Delete</span>

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 text-red-500 hover:text-red-700 transition"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m1 0v14a2 2 0 01-2 2H9a2 2 0 01-2-2V6h10z"
                          />
                        </svg>
                      </button>
                    </div>

                  </div>

                  {/* EXPANDED SECTION */}
                  {isOpen && (
                    <div className="mt-3 bg-white p-3 rounded border border-gray-300 shadow-sm">
                      <p className="text-gray-700 mb-3">
                        {task.description || "No description"}
                      </p>

                      {/* COMMENTS */}
                      <h4 className="font-bold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-2">Comments</h4>

                      {(task.comments || []).map((c, index) => {
                        const editing = editingIndex[id] === index;

                        return (
                          <div
                            key={index}
                            className="bg-gray-50 p-2 rounded border border-gray-300 shadow-sm mb-2"
                          >
                            {editing ? (
                              <>
                                <textarea
                                  className="w-full p-2 border border-gray-300 shadow-sm rounded"
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
                                    className="px-3 py-1 bg-gray-500 text-white rounded"
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
                                    className="hover:text-gray-600"
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
                        className="w-full p-2 border border-gray-300 shadow-sm rounded mt-2"
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
                        className="mt-2 px-4 py-2 bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl border-b border-slate-600 font-bold text-white rounded"
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

        {/* WORKSPACE TASKS PANEL */}
        <div className="space-y-6 rounded-xl bg-white shadow-sm border border-gray-300 p-6 mt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-extrabold text-2xl bg-linear-to-r from-slate-600 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                Workspace Tasks
              </h2>

              <label 
              className="opacity-80 px-2 py-2 text-end text-xs font-bold text-gray-800"
              >You Can Only Add New Tasks To Workspaces In The Workspace Page</label>
            </div>

            {/* FILTER TABS */}
            <div className="flex gap-2 mb-4 border-b border-gray-300 shadow-sm">
              {/* {["All", "Pending", "In Progress", "Done"].map(f => ( */}
              {["All", "Pending", "Done"].map(f => (
                <button
                  key={f}
                  onClick={() => setWorkspaceFilter(f)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${
                    workspaceFilter === f
                      ? "border-blue-900 text-blue-900"
                      : "border-transparent text-gray-600"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>


            {(!allWorkspaceTasks || allWorkspaceTasks.length === 0) && (
              <p className="text-gray-600">No workspace tasks found.</p>
            )}

            {filteredWorkspaceTasks?.map(ws => (
              <div key={ws.workspaceId} className="mb-6">
                {/* Workspace Header */}
                <h3 className="text-xl font-bold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-3">{ws.workspaceName}</h3>

                {/* Tasks list */}
                <div className="space-y-3 pl-4 border-l-4 border-gray-500">
                  {ws.tasks.length === 0 && (
                    <p className="text-gray-500">No tasks in this workspace.</p>
                  )}

                  {ws.tasks.map((task) => {
                    const id = task._id!;
                    const isOpen = openTaskId === id;

                    return (
                      <div
                        key={id}
                        className={`p-4 rounded-lg border-l-4 border-b-2 ${
                          task.status === "DONE"
                            ? "border-green-500 bg-green-100"
                            : task.status === "IN_PROGRESS"
                            ? "border-purple-500 bg-purple-100"
                            : "border-yellow-500 bg-yellow-100"
                        }`}
                      >
                        {/* Header row */}
                        <div
                          className="flex justify-between cursor-pointer"
                          onClick={() => setOpenTaskId((prev) => (prev === id ? null : id))}
                        >
                          <div className="flex gap-2 items-center">
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={task.status === "DONE"}
                                onChange={async e => {
                                  e.stopPropagation();
                                  const newStatus = task.status === "DONE" ? "TODO" : "DONE";
                                  await changeStatus(id, newStatus);
                                  refreshWorkspaceTasks();
                                }}
                                className="sr-only peer" // hide default checkbox
                              />
                              <div
                                className="w-6 h-6 bg-white border-2 border-gray-300 shadow-sm rounded-md
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

                          {/* Edit button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditTaskData(task);
                            }}
                            className="text-gray-600 hover:text-gray-800 inline-flex items-center gap-1"
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

                        {/* Expanded details with comments */}
                        {isOpen && (
                          <div className="mt-3 bg-white p-3 rounded border border-gray-300 shadow-sm">
                            <p className="text-gray-700 mb-3">{task.description || "No description"}</p>

                            {/* Due Date */}
                            <p className="text-xs text-gray-600 mb-2">
                              Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                            </p>

                            {/* COMMENTS */}
                            <h4 className="font-bold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-2">
                              Comments
                            </h4>

                            {(task.comments || []).map((c, index) => {
                              const editing = editingIndex[id] === index;

                              return (
                                <div key={index} className="bg-gray-50 p-2 rounded border border-gray-300 shadow-sm mb-2">
                                  {editing ? (
                                    <>
                                      <textarea
                                        className="w-full p-2 border border-gray-300 shadow-sm rounded"
                                        value={editingText[id] || ""}
                                        onChange={(e) =>
                                          setEditingText((prev) => ({ ...prev, [id]: e.target.value }))
                                        }
                                      />
                                      <div className="flex gap-2 mt-2">
                                        <button
                                          onClick={() => saveCommentEdit(task, index)}
                                          className="px-3 py-1 bg-gray-500 text-white rounded"
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={() =>
                                            setEditingIndex((prev) => ({ ...prev, [id]: null }))
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
                                            setEditingIndex((prev) => ({ ...prev, [id]: index }));
                                            setEditingText((prev) => ({ ...prev, [id]: c.message }));
                                          }}
                                          className="hover:text-gray-600"
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
                              className="w-full p-2 border border-gray-300 shadow-sm rounded mt-2"
                              placeholder="Write a comment..."
                              value={newCommentText[id] || ""}
                              onChange={(e) =>
                                setNewCommentText((prev) => ({ ...prev, [id]: e.target.value }))
                              }
                            />
                            <button
                              onClick={() => addComment(task)}
                              className="mt-2 px-4 py-2 bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl border-b border-slate-600 font-bold text-white rounded"
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
            ))}
        </div>


      </main>

      {/* ADD TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-4 text-center">Add New Task</h2>

            <label className="text-sm font-semibold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Title
            </label>
            <input
              type="text"
              placeholder="Task title..."
              value={newTaskData.title}
              onChange={e =>
                setNewTaskData({ ...newTaskData, title: e.target.value })
              }
              className="w-full p-3 border border-gray-300 shadow-sm rounded mb-2"
            />

            <label className="text-sm font-semibold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Description
            </label>
            <textarea
              placeholder="Description..."
              value={newTaskData.description}
              onChange={e =>
                setNewTaskData({ ...newTaskData, description: e.target.value })
              }
              className="w-full p-3 border border-gray-300 shadow-sm rounded mb-2"
            />

            <label className="text-sm font-semibold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Due Date
            </label>
            <input
              type="date"
              value={newTaskData.dueDate}
              onChange={e =>
                setNewTaskData({ ...newTaskData, dueDate: e.target.value })
              }
              className="w-full p-3 border border-gray-300 shadow-sm rounded mb-2"
            />

            <label className="text-sm font-semibold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Priority
            </label>
            <select
              value={newTaskData.priority}
              onChange={e =>
                setNewTaskData({
                  ...newTaskData,
                  priority: e.target.value as TaskPriority
                })
              }
              className="w-full p-3 border border-gray-300 shadow-sm rounded mb-4"
            >
              {TASK_PRIORITIES.map(p => (
                <option key={p}>{p}</option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTaskModal(false)}
                className="flex-1 p-3 border border-gray-300 shadow-sm rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleAddTask}
                className="flex-1 p-3 bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl border-b border-slate-600 font-bold text-white rounded"
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
            <h2 className="text-2xl font-bold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-4 text-center">Edit Task</h2>

            <label className="text-sm font-semibold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Title
            </label>
            <input
              type="text"
              value={editTaskData.title}
              onChange={e =>
                setEditTaskData({ ...editTaskData, title: e.target.value })
              }
              className="w-full p-3 border border-gray-300 shadow-sm rounded mb-2"
            />

            <label className="text-sm font-semibold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Description
            </label>
            <textarea
              value={editTaskData.description}
              onChange={e =>
                setEditTaskData({
                  ...editTaskData,
                  description: e.target.value
                })
              }
              className="w-full p-3 border border-gray-300 shadow-sm rounded mb-2"
            />

            <label className="text-sm font-semibold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Due Date
            </label>
            <input
              type="date"
              value={editTaskData.dueDate?.slice(0, 10) || ""}
              onChange={e =>
                setEditTaskData({
                  ...editTaskData,
                  dueDate: e.target.value
                })
              }
              className="w-full p-3 border border-gray-300 shadow-sm rounded mb-2"
            />

            <label className="text-sm font-semibold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Priority
            </label>
            <select
              value={editTaskData.priority}
              onChange={e =>
                setEditTaskData({
                  ...editTaskData,
                  priority: e.target.value as TaskPriority
                })
              }
              className="w-full p-3 border border-gray-300 shadow-sm rounded mb-4"
            >
              {TASK_PRIORITIES.map(p => (
                <option key={p}>{p}</option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => setEditTaskData(null)}
                className="flex-1 p-3 border border-gray-300 shadow-sm rounded"
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
                  refreshWorkspaceTasks();
                  setEditTaskData(null);
                }}
                className="flex-1 p-3 bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl border-b border-slate-600 font-bold text-white rounded"
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
