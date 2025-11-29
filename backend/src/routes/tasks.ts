import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  createTask,
  updateTask,
  deleteTask,
  getTasksByWorkspace,
  getTasksAssignedToMe,
  changeTaskStatus,
  assignTaskToUser,
  
  // Subtasks 
  createSubtask,
  updateSubtask,
  deleteSubtask,

  // Comments
  addComment,
  updateComment,
  deleteComment
} from "../controllers/task.controller";

const router = Router();

// ─────────────────────────────
// TASK CRUD
// ─────────────────────────────

// Create a task
router.post("/", authenticate, createTask);

// Update a task
router.put("/:taskId", authenticate, updateTask);

// Delete a task
router.delete("/:taskId", authenticate, deleteTask);

// ─────────────────────────────
// FETCHING TASKS
// ─────────────────────────────

// Get tasks in a workspace
router.get("/workspace/:workspaceId", authenticate, getTasksByWorkspace);

// Tasks assigned to the logged-in user
router.get("/assigned/me", authenticate, getTasksAssignedToMe);

// ─────────────────────────────
// TASK OPERATIONS
// ─────────────────────────────

// Change status (TODO → IN_PROGRESS → DONE)
router.patch("/:taskId/status", authenticate, changeTaskStatus);

// Assign task to a user
router.patch("/:taskId/assign/:userId", authenticate, assignTaskToUser);

// ─────────────────────────────
// SUBTASKS (PREMIUM)
// ─────────────────────────────

// Create a subtask
router.post("/:taskId/subtasks", authenticate, createSubtask);

// Update a subtask
router.put("/:taskId/subtasks/:subtaskId", authenticate, updateSubtask);

// Delete a subtask
router.delete("/:taskId/subtasks/:subtaskId", authenticate, deleteSubtask);

// ─────────────────────────────
// COMMENTS
// ─────────────────────────────

// Add a comment
router.post("/:taskId/comments", authenticate, addComment);

// Update a comment
router.put("/:taskId/comments/:commentId", authenticate, updateComment);

// Delete a comment
router.delete("/:taskId/comments/:commentId", authenticate, deleteComment);

export default router;
