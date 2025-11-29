import { useState, useEffect } from "react";
import { X, Calendar, Tag, User, AlignLeft, Plus, Trash2, MessageSquare, Send, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

interface Subtask {
  title: string;
  completed: boolean;
}

interface Comment {
  userId: string;
  message: string;
  createdAt?: Date;
}

interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  tags: string[];
  assignedTo: string;
  subtasks: Subtask[];
  comments?: Comment[];
}

interface ITask {
  _id?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | Date;
  tags?: string[];
  assignedTo?: string;
  subtasks?: Subtask[];
  comments?: Comment[];
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: TaskFormData) => void;
  editTask?: ITask | null;
  workspaceMembers?: Array<{ id: string; name: string }>;
  currentUserId?: string;
  currentUserName?: string;
}

export default function TaskModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editTask,
  workspaceMembers = [],
  currentUserId = "current-user",
  currentUserName = "You"
}: TaskModalProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    priority: "MEDIUM",
    status: "TODO",
    dueDate: "",
    tags: [],
    assignedTo: "",
    subtasks: [],
    comments: []
  });

  const [currentTag, setCurrentTag] = useState("");
  const [currentSubtask, setCurrentSubtask] = useState("");
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "comments">("details");

  // Load existing task data when editing
  useEffect(() => {
    if (editTask) {
      setFormData({
        title: editTask.title || "",
        description: editTask.description || "",
        priority: editTask.priority || "MEDIUM",
        status: editTask.status || "TODO",
        dueDate: editTask.dueDate 
          ? (typeof editTask.dueDate === 'string' 
              ? editTask.dueDate.split('T')[0] 
              : new Date(editTask.dueDate).toISOString().split('T')[0])
          : "",
        tags: editTask.tags || [],
        assignedTo: editTask.assignedTo || "",
        subtasks: editTask.subtasks || [],
        comments: editTask.comments || []
      });
    } else {
      // Reset form for new task
      setFormData({
        title: "",
        description: "",
        priority: "MEDIUM",
        status: "TODO",
        dueDate: "",
        tags: [],
        assignedTo: "",
        subtasks: [],
        comments: []
      });
    }
    setActiveTab("details");
  }, [editTask, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSave(formData);
      onClose();
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, currentTag.trim()] });
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const addSubtask = () => {
    if (currentSubtask.trim()) {
      setFormData({ 
        ...formData, 
        subtasks: [...formData.subtasks, { title: currentSubtask.trim(), completed: false }] 
      });
      setCurrentSubtask("");
    }
  };

  const removeSubtask = (index: number) => {
    setFormData({ 
      ...formData, 
      subtasks: formData.subtasks.filter((_, i) => i !== index) 
    });
  };

  const toggleSubtaskComplete = (index: number) => {
    const updatedSubtasks = [...formData.subtasks];
    updatedSubtasks[index].completed = !updatedSubtasks[index].completed;
    setFormData({ ...formData, subtasks: updatedSubtasks });
  };

  const addComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        userId: currentUserId,
        message: newComment.trim(),
        createdAt: new Date()
      };
      setFormData({
        ...formData,
        comments: [...(formData.comments || []), comment]
      });
      setNewComment("");
    }
  };

  const formatCommentTime = (date?: Date) => {
    if (!date) return "";
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now.getTime() - commentDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return commentDate.toLocaleDateString();
  };

  const getUserName = (userId: string) => {
    if (userId === currentUserId) return currentUserName;
    const member = workspaceMembers.find(m => m.id === userId);
    return member?.name || "Unknown User";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl max-w-3xl w-full my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {editTask ? "Edit Task" : "Create New Task"}
              </h2>
              {editTask && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  formData.status === "DONE"
                    ? "bg-green-100 text-green-700"
                    : formData.status === "IN_PROGRESS"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {formData.status.replace("_", " ")}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 px-6">
            <div className="flex gap-1">
              {["details", "comments"].map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-3 text-sm font-medium transition-all duration-200 relative capitalize ${
                    activeTab === tab 
                      ? "text-indigo-600" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setActiveTab(tab as "details" | "comments")}
                >
                  {tab}
                  {tab === "comments" && formData.comments && formData.comments.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full text-xs">
                      {formData.comments.length}
                    </span>
                  )}
                  {activeTab === tab && (
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

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto">
            {activeTab === "details" ? (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter task title..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <AlignLeft size={16} />
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add a description..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Priority and Status Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                </div>

                {/* Due Date and Assigned To Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={16} />
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <User size={16} />
                      Assign To
                    </label>
                    <select
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Unassigned</option>
                      {workspaceMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Tag size={16} />
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      placeholder="Add a tag..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:bg-indigo-200 rounded-full p-0.5"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Subtasks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtasks
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={currentSubtask}
                      onChange={(e) => setCurrentSubtask(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSubtask())}
                      placeholder="Add a subtask..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addSubtask}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.subtasks.map((subtask, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={subtask.completed}
                          onChange={() => toggleSubtaskComplete(index)}
                          className="w-4 h-4 rounded"
                        />
                        <span
                          className={`flex-1 text-sm ${
                            subtask.completed ? "line-through text-gray-500" : "text-gray-900"
                          }`}
                        >
                          {subtask.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSubtask(index)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            ) : (
              // Comments Tab
              <div className="p-6 space-y-4">
                {/* Comments List */}
                <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                  {formData.comments && formData.comments.length > 0 ? (
                    formData.comments.map((comment, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {getUserName(comment.userId).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold text-gray-900">
                                {getUserName(comment.userId)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatCommentTime(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {comment.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare size={48} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No comments yet</p>
                      <p className="text-xs">Be the first to comment!</p>
                    </div>
                  )}
                </div>

                {/* Add Comment Input */}
                <div className="border-t pt-4">
                  <div className="flex gap-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          addComment();
                        }
                      }}
                      placeholder="Write a comment... (Shift+Enter for new line)"
                      rows={3}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                    <button
                      onClick={addComment}
                      disabled={!newComment.trim()}
                      className={`px-4 py-2 rounded-lg transition-colors h-fit ${
                        newComment.trim()
                          ? "bg-indigo-600 text-white hover:bg-indigo-700"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              {editTask ? "Update Task" : "Create Task"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}