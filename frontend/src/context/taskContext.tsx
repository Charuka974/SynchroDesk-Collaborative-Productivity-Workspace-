import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

import {
  getTasksByWorkspaceAPI,
  createTaskAPI,
  updateTaskAPI,
  deleteTaskAPI,
  changeTaskStatusAPI,
  assignTaskToUserAPI,
  createSubtaskAPI,
  updateSubtaskAPI,
  deleteSubtaskAPI,
  addCommentAPI,
  updateCommentAPI,
  deleteCommentAPI,
  getTasksAssignedToMeAPI,
} from "../services/tasks";

// Frontend Task interface
export interface ITask {
  _id: string;
  title: string;
  description?: string;
  workspaceId?: string | null;
  createdBy: string;
  assignedTo?: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  tags?: string[];
  dueDate?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  subtasks?: { title: string; completed: boolean }[];
  attachments?: { resourceId: string }[];
  comments?: { userId: string; message: string; createdAt?: Date; }[];
  createdAt?: string;
  updatedAt?: string;
}

// Payload for creating a task
export interface ICreateTaskPayload {
  title: string; // required
  description?: string;
  workspaceId?: string;
  assignedTo?: string | null;
  priority?: ITask["priority"];
  tags?: string[];
  dueDate?: string;
}

// Task priorities
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
// Task statuses
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

interface TaskContextType {
  tasks: ITask[];
  loading: boolean;
  loadWorkspaceTasks: (workspaceId: string) => Promise<void>;
  loadPersonalTasks: () => Promise<void>;   // <-- ADD THIS
  createTask: (taskData: ICreateTaskPayload) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<ITask>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  changeStatus: (taskId: string, status: ITask["status"]) => Promise<void>;
  assignToUser: (taskId: string, userId: string) => Promise<void>;
  createSubtask: (taskId: string, title: string) => Promise<void>;
  updateSubtask: (
    taskId: string,
    subtaskId: string,
    payload: { title?: string; completed?: boolean }
  ) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addComment: (taskId: string, message: string) => Promise<void>;
  updateComment: (taskId: string, commentId: string, message: string) => Promise<void>;
  deleteComment: (taskId: string, commentId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export const TaskProvider = ({ children }: Props) => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(false);

  const loadWorkspaceTasks = async (workspaceId: string) => {
    setLoading(true);
    const data = await getTasksByWorkspaceAPI(workspaceId);
    setTasks(data);
    setLoading(false);
  };

  const loadPersonalTasks = async () => {
    try {
        const data = await getTasksAssignedToMeAPI();
        setTasks(data);
    } catch (error) {
        console.error("Error loading personal tasks:", error);
    }
  };


  const createTask = async (taskData: ICreateTaskPayload) => {
    const task = await createTaskAPI(taskData);
    setTasks(prev => [...prev, task]);
  };

  const updateTask = async (taskId: string, updates: Partial<ITask>) => {
    const updated = await updateTaskAPI(taskId, updates);
    setTasks(prev => prev.map(t => (t._id === taskId ? updated : t)));
  };

  const deleteTask = async (taskId: string) => {
    await deleteTaskAPI(taskId);
    setTasks(prev => prev.filter(t => t._id !== taskId));
  };

  const changeStatus = async (taskId: string, status: ITask["status"]) => {
    const updated = await changeTaskStatusAPI(taskId, { status });
    setTasks(prev => prev.map(t => (t._id === taskId ? updated : t)));
  };

  const assignToUser = async (taskId: string, userId: string) => {
    const updated = await assignTaskToUserAPI(taskId, userId);
    setTasks(prev => prev.map(t => (t._id === taskId ? updated : t)));
  };

  const createSubtask = async (taskId: string, title: string) => {
    const updated = await createSubtaskAPI(taskId, { title });
    setTasks(prev => prev.map(t => (t._id === taskId ? updated : t)));
  };

  const updateSubtask = async (
    taskId: string,
    subtaskId: string,
    payload: { title?: string; completed?: boolean }
  ) => {
    const updated = await updateSubtaskAPI(taskId, subtaskId, payload);
    setTasks(prev => prev.map(t => (t._id === taskId ? updated : t)));
  };

  const deleteSubtask = async (taskId: string, subtaskId: string) => {
    const updated = await deleteSubtaskAPI(taskId, subtaskId);
    setTasks(prev => prev.map(t => (t._id === taskId ? updated : t)));
  };

  const addComment = async (taskId: string, message: string) => {
    const updated = await addCommentAPI(taskId, { message });
    setTasks(prev => prev.map(t => (t._id === taskId ? updated : t)));
  };

  const updateComment = async (taskId: string, commentId: string, message: string) => {
    const updated = await updateCommentAPI(taskId, commentId, { message });
    setTasks(prev => prev.map(t => (t._id === taskId ? updated : t)));
  };

  const deleteComment = async (taskId: string, commentId: string) => {
    const updated = await deleteCommentAPI(taskId, commentId);
    setTasks(prev => prev.map(t => (t._id === taskId ? updated : t)));
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        loadWorkspaceTasks,
        loadPersonalTasks,
        createTask,
        updateTask,
        deleteTask,
        changeStatus,
        assignToUser,
        createSubtask,
        updateSubtask,
        deleteSubtask,
        addComment,
        updateComment,
        deleteComment,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used within a TaskProvider");
  return context;
};
