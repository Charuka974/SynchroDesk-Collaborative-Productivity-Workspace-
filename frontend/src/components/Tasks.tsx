import React, { useState } from "react";
import type { ICreateTaskPayload, ITask, TaskPriority, TaskStatus } from "../context/taskContext";
import { useAuth } from "../context/authContext";

interface TaskPanelProps {
  tasks: ITask[];
  activeFilter: string;
  setActiveFilter: (f: string) => void;
  createTask: (task: ICreateTaskPayload) => Promise<void>;
  updateTask: (id: string, updates: Partial<ITask>) => Promise<void>;
  changeStatus: (id: string, status: TaskStatus) => Promise<void>;
  refreshTasks: () => void;
}

export const TaskPanel: React.FC<TaskPanelProps> = ({
  tasks,
  activeFilter,
  setActiveFilter,
  createTask,
  updateTask,
  changeStatus,
  refreshTasks
}) => {
  const { user } = useAuth();
  const TASK_PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editTaskData, setEditTaskData] = useState<ITask | null>(null);
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "MEDIUM" as TaskPriority,
    workspaceId: ""
  });

  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});
  const [editingIndex, setEditingIndex] = useState<Record<string, number | null>>({});
  const [editingText, setEditingText] = useState<Record<string, string>>({});

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === "All") return true;
    const map: Record<string, TaskStatus> = {
      Pending: "TODO",
      "In Progress": "IN_PROGRESS",
      Done: "DONE"
    };
    return task.status === map[activeFilter];
  });

  const handleAddTask = async () => {
    if (!newTaskData.title.trim()) return;

    await createTask({
      title: newTaskData.title,
      description: newTaskData.description,
      dueDate: newTaskData.dueDate ? new Date(newTaskData.dueDate).toISOString() : undefined,
      priority: newTaskData.priority,
      workspaceId: newTaskData.workspaceId
    });

    setNewTaskData({ title: "", description: "", dueDate: "", priority: "MEDIUM", workspaceId: "" });
    setShowTaskModal(false);
    refreshTasks();
  };

  const saveEditTask = async () => {
    if (!editTaskData || !editTaskData._id) return;

    await updateTask(editTaskData._id, {
      title: editTaskData.title,
      description: editTaskData.description,
      dueDate: editTaskData.dueDate ? new Date(editTaskData.dueDate).toISOString() : undefined,
      priority: editTaskData.priority
    });

    setEditTaskData(null);
    refreshTasks();
  };

  const addComment = async (task: ITask) => {
    const text = newCommentText[task._id!] || "";
    if (!text.trim()) return;

    const updated = [...(task.comments || []), { userId: user._id, message: text, createdAt: new Date() }];
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

  return (
    <div className="bg-white shadow-sm border border-gray-200 p-6 w-full h-full flex flex-col ">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Tasks</h2>
        <button
          onClick={() => setShowTaskModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 border-b border-gray-200">
        {["All", "Pending", "In Progress", "Done"].map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeFilter === f ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredTasks.map(task => {
          const id = task._id!;
          const isOpen = openTaskId === id;

          return (
            <div key={id} 
              className={`p-4 rounded-lg border-l-4 border-b-2 
              ${task.status === "DONE" ? "border-green-500 bg-green-100" : 
              task.status === "IN_PROGRESS" ? "border-purple-500 bg-purple-100" : 
              "border-yellow-500 bg-yellow-100"}`}>
              <div className="flex justify-between cursor-pointer" onClick={() => setOpenTaskId(prev => (prev === id ? null : id))}>
                <div className="flex gap-2 items-center">
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
                      className="sr-only peer"
                    />
                    <div className="w-6 h-6 bg-white border-2 border-gray-300 shadow-sm rounded-md peer-checked:bg-green-500 peer-checked:border-green-500 transition-colors shrink-0">
                      {task.status === "DONE" && (
                        <svg className="w-4 h-4 text-white mx-auto my-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </label>
                  <h3 className={`font-semibold ${task.status === "DONE" ? "line-through text-gray-500" : "text-gray-900"}`}>
                    {task.title}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-600 mt-1 items-center">
                    {/* Calendar / Due Date */}
                    {task.dueDate && (
                        <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                    {/* Priority */}
                    <span
                        className={`px-2 py-1 rounded text-white text-xs font-medium ${
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

                    {/* Comments */}
                    <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4-.84L3 20l.84-4A9.863 9.863 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                        </svg>
                        {(task.comments || []).length}
                    </span>
                  </div>
                </div>

                <button onClick={e => { e.stopPropagation(); setEditTaskData(task); }} className="text-gray-400 hover:text-gray-600">Edit</button>
              </div>

              {isOpen && (
                <div className="mt-3 bg-white p-3 rounded border border-gray-300 shadow-sm">
                  <p className="text-gray-700 mb-3">{task.description || "No description"}</p>
                  <h4 className="font-semibold mb-2">Comments</h4>
                  {(task.comments || []).map((c, index) => {
                    const editing = editingIndex[id] === index;
                    return (
                      <div key={index} className="bg-gray-50 p-2 border border-gray-300 shadow-sm rounded mb-2">
                        {editing ? (
                          <>
                            <textarea
                              className="w-full p-2 border border-gray-300 shadow-sm rounded"
                              value={editingText[id] || ""}
                              onChange={e => setEditingText(prev => ({ ...prev, [id]: e.target.value }))}
                            />
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => saveCommentEdit(task, index)} className="px-3 py-1 bg-indigo-500 text-white rounded">Save</button>
                              <button onClick={() => setEditingIndex(prev => ({ ...prev, [id]: null }))} className="px-3 py-1 bg-gray-300 rounded">Cancel</button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p>{c.message}</p>
                            <div className="flex gap-3 mt-1 text-xs text-gray-500">
                              <button onClick={() => { setEditingIndex(prev => ({ ...prev, [id]: index })); setEditingText(prev => ({ ...prev, [id]: c.message })); }} className="hover:text-indigo-600">Edit</button>
                              <button onClick={() => deleteComment(task, index)} className="hover:text-red-600">Delete</button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}

                  <textarea
                    className="w-full p-2 border border-gray-300 shadow-sm rounded mt-2"
                    placeholder="Write a comment..."
                    value={newCommentText[id] || ""}
                    onChange={e => setNewCommentText(prev => ({ ...prev, [id]: e.target.value }))}
                  />
                  <button onClick={() => addComment(task)} className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded">Add Comment</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add New Task</h2>
            <input
              type="text"
              placeholder="Task title..."
              value={newTaskData.title}
              onChange={e => setNewTaskData({ ...newTaskData, title: e.target.value })}
              className="w-full p-3 border border-gray-300 shadow-sm rounded mb-2"
            />
            <textarea
              placeholder="Description..."
              value={newTaskData.description}
              onChange={e => setNewTaskData({ ...newTaskData, description: e.target.value })}
              className="w-full p-3 border border-gray-300 shadow-sm rounded mb-2"
            />
            <input
              type="date"
              value={newTaskData.dueDate}
              onChange={e => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
              className="w-full p-3 border border-gray-300 shadow-sm rounded mb-2"
            />
            <select
              value={newTaskData.priority}
              onChange={e => setNewTaskData({ ...newTaskData, priority: e.target.value as TaskPriority })}
              className="w-full p-3 border border-gray-300 shadow-sm rounded mb-4"
            >
              {TASK_PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setShowTaskModal(false)} className="flex-1 p-3 border border-gray-300 shadow-sm rounded">Cancel</button>
              <button onClick={handleAddTask} className="flex-1 p-3 bg-indigo-600 text-white rounded">Add Task</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editTaskData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit Task</h2>
            <input
              type="text"
              value={editTaskData.title}
              onChange={e => setEditTaskData({ ...editTaskData, title: e.target.value })}
              className="w-full p-3 border border-gray-300 shadow-sm rounded mb-2"
            />
            <textarea
              value={editTaskData.description}
              onChange={e => setEditTaskData({ ...editTaskData, description: e.target.value })}
              className="w-full p-3 border border-gray-300 shadow-sm rounded mb-2"
            />
            <input
              type="date"
              value={editTaskData.dueDate?.slice(0, 10) || ""}
              onChange={e => setEditTaskData({ ...editTaskData, dueDate: e.target.value })}
              className="w-full p-3 border border-gray-300 shadow-sm rounded mb-2"
            />
            <select
              value={editTaskData.priority}
              onChange={e => setEditTaskData({ ...editTaskData, priority: e.target.value as TaskPriority })}
              className="w-full p-3 border border-gray-300 shadow-sm rounded mb-4"
            >
              {TASK_PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setEditTaskData(null)} className="flex-1 p-3 border border-gray-300 shadow-sm rounded">Cancel</button>
              <button onClick={saveEditTask} className="flex-1 p-3 bg-indigo-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
