import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  getMyWorkspacesAPI,
  createWorkspaceAPI,
  updateWorkspaceAPI,
  deleteWorkspaceAPI,
  inviteMemberAPI,
  removeMemberAPI,
  changeRoleAPI,
  leaveWorkspaceAPI,
  getWorkspaceByIdAPI,
} from "../services/workspace";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  role: string; // role of current user in this workspace
  members: Member[];
  taskCount?: number;
  color?: string;
  createdAt?: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace?: Workspace;
  loading: boolean;
  error?: string;
  fetchWorkspaces: () => void;
  selectWorkspace: (workspace: Workspace) => void;
  createWorkspace: (name: string, description?: string) => Promise<Workspace | undefined>;
  updateWorkspace: (workspaceId: string, data: Partial<Workspace>) => Promise<Workspace | undefined>;
  deleteWorkspace: (workspaceId: string) => Promise<boolean>;
  leaveWorkspace: (workspaceId: string, userId: string) => Promise<boolean>;
  inviteMember: (workspaceId: string, email: string, role: string) => Promise<Workspace | undefined>;
  removeMember: (workspaceId: string, userId: string) => Promise<Workspace | undefined>;
  changeRole: (workspaceId: string, userId: string, role: string) => Promise<Workspace | undefined>;
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
      const newWS = await createWorkspaceAPI({ name, description });
      setWorkspaces((prev) => [...prev, newWS]);
      return newWS;
    } catch (err: any) {
      setError(err.message || "Failed to create workspace");
      return undefined;
    }
  };

  const updateWorkspace = async (workspaceId: string, data: Partial<Workspace>) => {
    try {
      const updatedWS = await updateWorkspaceAPI(workspaceId, data);
      setWorkspaces((prev) => prev.map((w) => (w.id === updatedWS.id ? updatedWS : w)));
      return updatedWS;
    } catch (err: any) {
      setError(err.message || "Failed to update workspace");
      return undefined;
    }
  };

  const deleteWorkspace = async (workspaceId: string) => {
    try {
      await deleteWorkspaceAPI(workspaceId);
      setWorkspaces((prev) => prev.filter((w) => w.id !== workspaceId));
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to delete workspace");
      return false;
    }
  };

  const leaveWorkspace = async (workspaceId: string) => {
    try {
      await leaveWorkspaceAPI(workspaceId);
      setWorkspaces((prev) => prev.filter((w) => w.id !== workspaceId));
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to leave workspace");
      return false;
    }
  };


  const inviteMember = async (workspaceId: string, email: string, role: string) => {
    try {
      const updatedWS = await inviteMemberAPI(workspaceId, { email, role });
      setWorkspaces((prev) => prev.map((w) => (w.id === updatedWS.id ? updatedWS : w)));
      return updatedWS;
    } catch (err: any) {
      setError(err.message || "Failed to invite member");
      return undefined;
    }
  };

  const removeMember = async (workspaceId: string, userId: string) => {
    try {
      const updatedWS = await removeMemberAPI(workspaceId, userId);
      setWorkspaces((prev) => prev.map((w) => (w.id === updatedWS.id ? updatedWS : w)));
      return updatedWS;
    } catch (err: any) {
      setError(err.message || "Failed to remove member");
      return undefined;
    }
  };

  const changeRole = async (workspaceId: string, userId: string, role: string) => {
    try {
      const updatedWS = await changeRoleAPI(workspaceId, { userId, role });
      setWorkspaces((prev) => prev.map((w) => (w.id === updatedWS.id ? updatedWS : w)));
      return updatedWS;
    } catch (err: any) {
      setError(err.message || "Failed to change role");
      return undefined;
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        loading,
        error,
        fetchWorkspaces,
        selectWorkspace,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        leaveWorkspace,
        inviteMember,
        removeMember,
        changeRole,
      }}
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

export const getWorkspaceDataContext = async () => {
    return await getMyWorkspacesAPI();
};

export const getWorkspaceByIdContext = async (id: string) => {
    return await getWorkspaceByIdAPI(id);
};