import api from "./api";

// ─────────────────────────────
// TASK CRUD
// ─────────────────────────────

// Create a task
export const createTaskAPI = async (payload: {
  title: string;
  description?: string;
  workspaceId?: string;
  assignedTo?: string | null;
  priority?: string;
  tags?: string[];
  dueDate?: string;
}) => {
  const res = await api.post(`/tasks`, payload);
  return res.data;
};

// Update a task
export const updateTaskAPI = async (
  taskId: string,
  payload: {
    title?: string;
    description?: string;
    assignedTo?: string | null;
    priority?: string;
    tags?: string[];
    dueDate?: string;
  }
) => {
  const res = await api.put(`/tasks/${taskId}`, payload);
  return res.data;
};

// Delete a task
export const deleteTaskAPI = async (taskId: string) => {
  const res = await api.delete(`/tasks/${taskId}`);
  return res.data;
};

// ─────────────────────────────
// FETCH TASKS
// ─────────────────────────────

// Tasks in workspace
export const getTasksByWorkspaceAPI = async (workspaceId: string) => {
  const res = await api.get(`/tasks/workspace/${workspaceId}`);
  return res.data;
};

// Tasks assigned to logged-in user
export const getTasksAssignedToMeAPI = async () => {
  const res = await api.get(`/tasks/assigned/me`);
  return res.data;
};

// All workspace tasks
export const getAllWorkspaceTasksAPI = async () => {
  const res = await api.get(`/tasks/workspace-all`);
  return res.data;
}

// ─────────────────────────────
// TASK OPERATIONS
// ─────────────────────────────

// Change task status (TODO → IN_PROGRESS → DONE)
export const changeTaskStatusAPI = async (
  taskId: string,
  payload: { status: string }
) => {
  const res = await api.patch(`/tasks/${taskId}/status`, payload);
  return res.data;
};

// Assign task to a user
export const assignTaskToUserAPI = async (taskId: string, userId: string) => {
  const res = await api.patch(`/tasks/${taskId}/assign/${userId}`);
  return res.data;
};

// ─────────────────────────────
// SUBTASKS
// ─────────────────────────────

// Create subtask
export const createSubtaskAPI = async (
  taskId: string,
  payload: { title: string }
) => {
  const res = await api.post(`/tasks/${taskId}/subtasks`, payload);
  return res.data;
};

// Update subtask
export const updateSubtaskAPI = async (
  taskId: string,
  subtaskId: string,
  payload: { title?: string; completed?: boolean }
) => {
  const res = await api.put(`/tasks/${taskId}/subtasks/${subtaskId}`, payload);
  return res.data;
};

// Delete subtask
export const deleteSubtaskAPI = async (taskId: string, subtaskId: string) => {
  const res = await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
  return res.data;
};

// ─────────────────────────────
// COMMENTS
// ───────────────────────────── 

// Add comment
export const addCommentAPI = async (
  taskId: string,
  payload: { message: string }
) => {
  const res = await api.post(`/tasks/${taskId}/comments`, payload);
  return res.data;
};

// Update comment
export const updateCommentAPI = async (
  taskId: string,
  commentId: string,
  payload: { message: string }
) => {
  const res = await api.put(`/tasks/${taskId}/comments/${commentId}`, payload);
  return res.data;
};

// Delete comment
export const deleteCommentAPI = async (taskId: string, commentId: string) => {
  const res = await api.delete(`/tasks/${taskId}/comments/${commentId}`);
  return res.data;
};
