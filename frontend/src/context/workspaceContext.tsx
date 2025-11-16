// workspaceContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";

export type Workspace = {
  id: string;
  name: string;
  description?: string;
};

type WorkspaceContextType = {
  workspaces: Workspace[];
  setWorkspaces: (ws: Workspace[]) => void;
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (ws: Workspace) => void;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  return (
    <WorkspaceContext.Provider value={{ workspaces, setWorkspaces, activeWorkspace, setActiveWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return context;
};
