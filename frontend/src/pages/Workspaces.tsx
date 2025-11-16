// Workspaces.tsx
import { useEffect } from "react";
import { useWorkspace, type Workspace } from "../context/workspaceContext";
import Sidebar from "../components/Sidebar"

export default function Workspaces() {
  const { workspaces, setWorkspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();

  // Mock fetch workspaces (replace with API call)
  useEffect(() => {
    const fetchWorkspaces = async () => {
      // Replace this with actual API call
      const data: Workspace[] = [
        { id: "1", name: "Marketing Team" },
        { id: "2", name: "Product Dev" },
        { id: "3", name: "Design Team" },
      ];
      setWorkspaces(data);
    };

    fetchWorkspaces();
  }, []);

  const handleSelectWorkspace = (workspace: Workspace) => {
    setActiveWorkspace(workspace);
    alert(`You selected workspace: ${workspace.name}`);
    // You can navigate to workspace dashboard if needed
    // navigate(`/workspace/${workspace.id}`);
  };

  return (
    <div className="p-6">

      {/* Sidebar */}
      
      <h1 className="text-2xl font-bold mb-4">Your Workspaces</h1>

      {workspaces.length === 0 ? (
        <p>No workspaces available.</p>
      ) : (
        <ul className="space-y-3">
          {workspaces.map((ws) => (
            <li
              key={ws.id}
              onClick={() => handleSelectWorkspace(ws)}
              className={`p-4 border rounded-lg cursor-pointer hover:bg-indigo-50 ${
                activeWorkspace?.id === ws.id ? "border-indigo-600 bg-indigo-100" : "border-gray-200"
              }`}
            >
              <h2 className="font-semibold text-lg">{ws.name}</h2>
              {ws.description && <p className="text-gray-600 text-sm">{ws.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
