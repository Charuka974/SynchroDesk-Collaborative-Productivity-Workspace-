// ✔ createTask()
// ✔ updateTask()
// ✔ deleteTask()
// ✔ getTasksByWorkspace()
// ✔ getTasksAssignedToMe()
// ✔ changeTaskStatus()
// ✔ assignTaskToUser()


// 3.2 SubtaskController (premium)

// ✔ createSubtask()
// ✔ updateSubtask()
// ✔ deleteSubtask()

// 3.3 TaskCommentController

// ✔ addComment()
// ✔ updateComment()
// ✔ deleteComment()


import { Request, Response } from "express";
import mongoose from "mongoose";
import { Task, ITask, TaskStatus, TaskPriority } from "../models/task.model";
import { AUthRequest } from "../middleware/auth";
import { User } from "../models/user.model";

// ---------------------------------------------------------------------
// CREATE TASK
// ---------------------------------------------------------------------
export const createTask = async (req: AUthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    const { title, description, workspaceId, assignedTo, priority, tags, dueDate } = req.body;

    if (!title) return res.status(400).json({ message: "Title is required" });

    const task = new Task({
      title,
      description: description || "",
      workspaceId: workspaceId || null,
      createdBy: userId,
      assignedTo: workspaceId ? assignedTo || null : userId,
      priority: priority || TaskPriority.MEDIUM,
      tags: tags || [],
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    await task.save();

    res.status(201).json(task);
  } catch (error) {
    console.error("createTask error:", error);
    res.status(500).json({ message: "Server error creating task" });
  }
};

// ---------------------------------------------------------------------
// UPDATE TASK
// ---------------------------------------------------------------------
export const updateTask = async (req: AUthRequest, res: Response) => {
  try {
    const { taskId } = req.params;

    const updates = req.body;

    const task = await Task.findByIdAndUpdate(taskId, updates, { new: true });

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json(task);
  } catch (error) {
    console.error("updateTask error:", error);
    res.status(500).json({ message: "Server error updating task" });
  }
};

// ---------------------------------------------------------------------
// DELETE TASK
// ---------------------------------------------------------------------
export const deleteTask = async (req: AUthRequest, res: Response) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.deleteOne();

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("deleteTask error:", error);
    res.status(500).json({ message: "Server error deleting task" });
  }
};

// ---------------------------------------------------------------------
// GET TASKS BY WORKSPACE
// ---------------------------------------------------------------------
export const getTasksByWorkspace = async (req: AUthRequest, res: Response) => {
  try {
    const { workspaceId } = req.params;

    if (!workspaceId) return res.status(400).json({ message: "Workspace ID is required" });

    const tasks = await Task.find({ workspaceId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(tasks);
  } catch (error) {
    console.error("getTasksByWorkspace error:", error);
    res.status(500).json({ message: "Server error fetching tasks" });
  }
};

// ---------------------------------------------------------------------
// GET TASKS ASSIGNED TO ME
// ---------------------------------------------------------------------
export const getTasksAssignedToMe = async (req: AUthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    const tasks = await Task.find({ assignedTo: userId }).lean();

    res.status(200).json(tasks);
  } catch (error) {
    console.error("getTasksAssignedToMe error:", error);
    res.status(500).json({ message: "Server error fetching tasks" });
  }
};

// ---------------------------------------------------------------------
// CHANGE STATUS
// ---------------------------------------------------------------------
export const changeTaskStatus = async (req: AUthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!Object.values(TaskStatus).includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const task = await Task.findById(taskId);

    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = status;
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    console.error("changeTaskStatus error:", error);
    res.status(500).json({ message: "Server error updating status" });
  }
};

// ---------------------------------------------------------------------
// ASSIGN TASK TO USER
// ---------------------------------------------------------------------
export const assignTaskToUser = async (req: AUthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.assignedTo = userId;
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    console.error("assignTaskToUser error:", error);
    res.status(500).json({ message: "Server error assigning task" });
  }
};

// ---------------------------------------------------------------------
// SUBTASKS
// ---------------------------------------------------------------------
export const createSubtask = async (req: AUthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;

    if (!title) return res.status(400).json({ message: "Subtask title is required" });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.subtasks?.push({ title, completed: false });
    await task.save();

    res.status(201).json(task);
  } catch (error) {
    console.error("createSubtask error:", error);
    res.status(500).json({ message: "Server error creating subtask" });
  }
};

export const updateSubtask = async (req: AUthRequest, res: Response) => {
  try {
    const { taskId, subtaskIndex } = req.params;
    const { title, completed } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const index = parseInt(subtaskIndex);
    if (!task.subtasks || !task.subtasks[index])
      return res.status(404).json({ message: "Subtask not found" });

    if (title !== undefined) task.subtasks[index].title = title;
    if (completed !== undefined) task.subtasks[index].completed = completed;

    await task.save();

    res.status(200).json(task);
  } catch (error) {
    console.error("updateSubtask error:", error);
    res.status(500).json({ message: "Server error updating subtask" });
  }
};

export const deleteSubtask = async (req: AUthRequest, res: Response) => {
  try {
    const { taskId, subtaskIndex } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const index = parseInt(subtaskIndex);
    if (!task.subtasks || !task.subtasks[index])
      return res.status(404).json({ message: "Subtask not found" });

    task.subtasks.splice(index, 1);
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    console.error("deleteSubtask error:", error);
    res.status(500).json({ message: "Server error deleting subtask" });
  }
};

// ---------------------------------------------------------------------
// COMMENTS
// ---------------------------------------------------------------------
export const addComment = async (req: AUthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { message } = req.body;
    const userId = req.user?.sub;

    if (!message) return res.status(400).json({ message: "Message required" });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.comments?.push({ userId, message, createdAt: new Date() });
    await task.save();

    res.status(201).json(task);
  } catch (error) {
    console.error("addComment error:", error);
    res.status(500).json({ message: "Server error adding comment" });
  }
};

export const updateComment = async (req: AUthRequest, res: Response) => {
  try {
    const { taskId, commentIndex } = req.params;
    const { message } = req.body;
    const userId = req.user?.sub;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const index = Number(commentIndex);
    const comment = task.comments?.[index];

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.userId.toString() !== userId)
      return res.status(403).json({ message: "You can only edit your comments" });

    comment.message = message;

    await task.save();

    res.status(200).json(task);
  } catch (error) {
    console.error("updateComment error:", error);
    res.status(500).json({ message: "Server error updating comment" });
  }
};

export const deleteComment = async (req: AUthRequest, res: Response) => {
  try {
    const { taskId, commentIndex } = req.params;
    const userId = req.user?.sub;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const index = Number(commentIndex);
    const comment = task.comments?.[index];

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.userId.toString() !== userId)
      return res.status(403).json({ message: "You can only delete your comments" });

    task.comments?.splice(index, 1);
    await task.save(); 

    res.status(200).json(task);
  } catch (error) {
    console.error("deleteComment error:", error);
    res.status(500).json({ message: "Server error deleting comment" });
  }
};
