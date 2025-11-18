import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getMyWorkspacesAPI, createWorkspaceAPI } from "../services/workspace";

interface Member {
  userId: string;
  role: string;
}

export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  members: Member[];
  invitedUsers?: string[];
  isArchived?: boolean;
  settings?: { theme: string; allowUploads: boolean; notifications: boolean };
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace?: Workspace;
  loading: boolean;
  error?: string;
  fetchWorkspaces: () => void;
  selectWorkspace: (workspace: Workspace) => void;
  createWorkspace: (name: string, description?: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const data = await getMyWorkspacesAPI();
      setWorkspaces(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch workspaces");
    } finally {
      setLoading(false);
    }
  };

  const selectWorkspace = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
  };

  const createWorkspace = async (name: string, description?: string) => {
    try {
      const newWorkspace = await createWorkspaceAPI({ name, description });
      setWorkspaces((prev) => [...prev, newWorkspace]);
    } catch (err: any) {
      setError(err.message || "Failed to create workspace");
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{ workspaces, currentWorkspace, loading, error, fetchWorkspaces, selectWorkspace, createWorkspace }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return context;
};
