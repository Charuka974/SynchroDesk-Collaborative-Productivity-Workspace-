import { useState, useEffect } from "react";
import {
  changeRoleAPI,
  createWorkspaceAPI,
  deleteWorkspaceAPI,
  getMyWorkspacesAPI,
  inviteMemberAPI,
  leaveWorkspaceAPI,
  removeMemberAPI,
  updateWorkspaceAPI,
} from "../services/workspace";
import Swal from "sweetalert2";
import { useAuth } from "../context/authContext";

import { useNavigate } from "react-router-dom"



export default function WorkspacesPage() {
  const navigate = useNavigate()
  
  type Member = {
    id: string;
    name: string;
    email: string;
    role: string;
  };

  type Workspace = {
    id: string;
    name: string;
    description: string;
    role: string;
    members: Member[];
    createdAt: string;
    taskCount: number;
    color: string;
  };

  // Toast notification
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end", // top-right
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  // ----------------------
  // State
  // ----------------------
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  // const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(
  //   null
  // );

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null
  );

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"MEMBER" | "ADMIN">("MEMBER");

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Current user
  const currentUser = useAuth();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const data = await getMyWorkspacesAPI();
        setWorkspaces(data);
      } catch (error) {
        console.error(error);
        Toast.fire({
          icon: "error",
          title: "Error fetching workspaces",
        });
      }
    };

    fetchWorkspaces();
  }, []);

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Please enter a workspace name",
      });
      return;
    }

    try {
      const newWS = await createWorkspaceAPI({
        name: newWorkspaceName,
        description: newWorkspaceDescription,
      });

      setWorkspaces((prev) => [...prev, newWS]);
      setShowCreateModal(false);
      setNewWorkspaceName("");
      setNewWorkspaceDescription("");

      Toast.fire({
        icon: "success",
        title: "Workspace created successfully!",
      });
    } catch (error) {
      console.error(error);
      Toast.fire({
        icon: "error",
        title: "Error creating workspace",
      });
    }
  };

  const handleUpdateWorkspace = async () => {
    if (!selectedWorkspace) return;
    if (!editName.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Please enter a workspace name",
      });
      return;
    }

    try {
      const updatedWS = await updateWorkspaceAPI(selectedWorkspace.id, {
        name: editName,
        description: editDescription,
      });

      setWorkspaces((ws) =>
        ws.map((w) => (w.id === updatedWS.id ? updatedWS : w))
      );

      setShowSettingsModal(false);
      Toast.fire({
        icon: "success",
        title: "Workspace updated successfully!",
      });
    } catch (error) {
      console.error(error);
      Toast.fire({
        icon: "error",
        title: "Error updating workspace",
      });
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!selectedWorkspace) return;

    if (
      selectedWorkspace.role !== "ADMIN" &&
      selectedWorkspace.role !== "OWNER"
    ) {
      Toast.fire({
        icon: "warning",
        title: "Only admins can delete workspaces",
      });
      return;
    }

    if (!window.confirm(`Delete "${selectedWorkspace.name}"?`)) return;

    try {
      await deleteWorkspaceAPI(selectedWorkspace.id);
      setWorkspaces((ws) => ws.filter((w) => w.id !== selectedWorkspace.id));
      setShowSettingsModal(false);

      Toast.fire({
        icon: "success",
        title: "Workspace deleted successfully!",
      });
    } catch (error) {
      console.error(error);
      Toast.fire({
        icon: "error",
        title: "Error deleting workspace",
      });
    }
  };

  const handleLeaveWorkspace = async () => {
    if (!selectedWorkspace) return;

    if (selectedWorkspace.role === "ADMIN") {
      Toast.fire({
        icon: "warning",
        title: "Admins cannot leave the workspace.",
      });
      return;
    }

    // Use Swal instead of native confirm
    const result = await Swal.fire({
      title: `Leave "${selectedWorkspace.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, leave",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return; // User canceled

    try {
      await leaveWorkspaceAPI( selectedWorkspace.id, currentUser.id);

      setWorkspaces((ws) => ws.filter((w) => w.id !== selectedWorkspace.id));
      setShowSettingsModal(false);

      Toast.fire({
        icon: "success",
        title: "You left the workspace",
      });
    } catch (error) {
      console.error(error);
      Toast.fire({
        icon: "error",
        title: "Error leaving workspace",
      });
    }
  };


  const handleInviteMember = async () => {
    if (!selectedWorkspace) return;
    if (!inviteEmail.trim()) {
      Toast.fire({
        icon: "warning",
        title: "Please enter an email",
      });
      return;
    }

    try {
      const updatedWS = await inviteMemberAPI(selectedWorkspace.id, {
        email: inviteEmail,
        role: inviteRole,
      });

      setWorkspaces((ws) =>
        ws.map((w) => (w.id === updatedWS.id ? updatedWS : w))
      );

      setInviteEmail("");
      setInviteRole("MEMBER");
      setShowInviteModal(false);

      Toast.fire({
        icon: "success",
        title: `Invitation sent to ${inviteEmail}`,
      });
    } catch (error) {
      console.error(error);
      Toast.fire({
        icon: "error",
        title: "Error inviting member",
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedWorkspace) return;
    if (
      selectedWorkspace.role !== "ADMIN" &&
      selectedWorkspace.role !== "OWNER"
    ) {
      Toast.fire({
        icon: "warning",
        title: "Only admins can remove members",
      });
      return;
    }

    try {
      const updatedWS = await removeMemberAPI(selectedWorkspace.id, memberId);

      setWorkspaces((ws) =>
        ws.map((w) => (w.id === updatedWS.id ? updatedWS : w))
      );

      setSelectedWorkspace(updatedWS);

      Toast.fire({
        icon: "success",
        title: "Member removed successfully",
      });
    } catch (error) {
      console.error(error);
      Toast.fire({
        icon: "error",
        title: "Error removing member",
      });
    }
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    if (!selectedWorkspace) return;
    if (
      selectedWorkspace.role !== "ADMIN" &&
      selectedWorkspace.role !== "OWNER"
    ) {
      Toast.fire({
        icon: "warning",
        title: "Only admins can change roles",
      });
      return;
    }

    try {
      const updatedWS = await changeRoleAPI(selectedWorkspace.id, {
        userId: memberId,
        role: newRole,
      });

      setWorkspaces((ws) =>
        ws.map((w) => (w.id === updatedWS.id ? updatedWS : w))
      );

      setSelectedWorkspace(updatedWS);

      Toast.fire({
        icon: "success",
        title: "Member role updated",
      });
    } catch (error) {
      console.error(error);
      Toast.fire({
        icon: "error",
        title: "Error changing role",
      });
    }
  };

  const openSettings = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setEditName(workspace.name);
    setEditDescription(workspace.description || "");
    setShowSettingsModal(true);
  };

  const openInvite = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setShowInviteModal(true);
  };

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      indigo: "from-indigo-500 to-indigo-600",
      purple: "from-purple-500 to-purple-600",
      pink: "from-pink-500 to-pink-600",
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      slate: "from-slate-700 via-slate-800 to-slate-900",
    };

    return colors[color] || colors.indigo;
  };


  return (
    <div className="min-h-screen w-full bg-linear-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-extrabold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">Workspaces</h1>
              <p className="text-gray-600 mt-1">
                Manage and collaborate across multiple workspaces
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 border-b border-slate-600 text-white rounded-lg hover:bg-gray-700 transition font-medium shadow-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Workspace
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-md transition ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-gray-800"
                    : "text-gray-600"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-md transition ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-gray-800"
                    : "text-gray-600"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
            <div className="text-sm text-gray-600">
              {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 py-8 max-w-7xl mx-auto">
        {workspaces.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No workspaces yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first workspace to start collaborating with your team
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl border-b border-slate-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
            >
              Create Workspace
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group"
              >
                <div
                  className={`h-24 bg-linear-to-r ${getColorClass(
                    "slate" // or get from backend
                  )} p-6 relative`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {workspace.name}
                      </h3>
                      <span className="inline-flex items-center px-2 py-1 bg-white bg-opacity-20 backdrop-blur-sm rounded text-xs text-gray-500 font-bold">
                        {workspace.role}
                      </span>
                    </div>
                    <button
                      onClick={() => openSettings(workspace)}
                      className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                    >
                      <svg
                        className="w-5 h-5 text-slate-300 hover:text-white transition-colors duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-10">
                    {workspace.description || "No description"}
                  </p>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <span>{workspace.taskCount} tasks</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <span>{workspace.members.length} members</span>
                    </div>
                  </div>

                  <div className="flex items-center mb-4">
                    <div className="flex -space-x-2">
                      {workspace.members.slice(0, 3).map((member, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                          title={member.name}
                        >
                          {(member.name?.charAt(0) ?? "?").toUpperCase()}
                        </div>
                      ))}
                      {workspace.members.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-semibold border-2 border-white">
                          +{workspace.members.length - 3}
                        </div>
                      )}
                    </div>
                    {workspace.role === "ADMIN" ||
                      (workspace.role === "OWNER" && (
                        <button 
                          onClick={() => openInvite(workspace)} 
                          className="ml-3 px-4 py-2 text-sm font-bold text-white bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl border-b border-slate-600 rounded-md hover:from-slate-600 hover:via-slate-700 hover:to-slate-800 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out hover:animate-none" 
                        > 
                          + Invite 
                        </button>
                      ))}
                  </div>

                  <button
                    onClick={() => {
                      if (
                        workspace.role === "ADMIN" ||
                        workspace.role === "OWNER" ||
                        workspace.role === "MEMBER"
                      ) {
                        navigate(`/selected-workspace?id=${workspace.id}`)
                        Toast.fire({
                          icon: "info",
                          title: `Open workspace: ${workspace.name}`,
                        });
                      }
                    }}
                    className="w-full px-6 py-3 font-bold text-white bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 rounded-lg shadow-lg hover:shadow-2xl hover:from-slate-600 hover:via-slate-700 hover:to-slate-800 active:scale-98 transform transition-all duration-300 ease-out hover:scale-[1.02] border border-slate-600/50 hover:border-slate-500 relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <svg 
                        className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M13 7l5 5m0 0l-5 5m5-5H6" 
                        />
                      </svg>
                      Open {workspace.name}
                    </span>
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-out"></div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto"
          onClick={() => setShowSettingsModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 mt-8 mb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-4">
              Create New Workspace
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workspace Name *
                </label>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="e.g., Marketing Team"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newWorkspaceDescription}
                  onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                  placeholder="What is this workspace for?"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkspace}
                className="flex-1 px-4 py-2 bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl border-b border-slate-600 font-bold text-white rounded-lg hover:bg-gray-700 transition"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && selectedWorkspace && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto"
          onClick={() => setShowSettingsModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 mt-8 mb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                Workspace Settings
              </h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Name & Description */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={
                    !(
                      selectedWorkspace.role === "ADMIN" ||
                      selectedWorkspace.role === "OWNER"
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={
                    !(
                      selectedWorkspace.role === "ADMIN" ||
                      selectedWorkspace.role === "OWNER"
                    )
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none disabled:bg-gray-100"
                />
              </div>
              {(selectedWorkspace.role === "ADMIN" ||
                selectedWorkspace.role === "OWNER") && (
                <button
                  onClick={handleUpdateWorkspace}
                  className="px-4 py-2 bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl border-b border-slate-600 font-bold text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Save Changes
                </button>
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Members ({selectedWorkspace.members.length})
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {selectedWorkspace.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {(member.name?.charAt(0) ?? "?").toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.name}
                        </p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Only Admins/Owner can change roles or remove members */}
                      {(selectedWorkspace.role === "ADMIN" ||
                        selectedWorkspace.role === "OWNER") &&
                      member.id !== currentUser.id ? (
                        <>
                          {member.role !== "OWNER" && (
                            <>
                              <select
                                value={member.role}
                                onChange={(e) =>
                                  handleChangeRole(member.id, e.target.value)
                                }
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="ADMIN">Admin</option>
                                <option value="MEMBER">Member</option>
                              </select>

                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Remove member"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <span className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm text-gray-700">
                          {member.role}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-red-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-red-600 mb-4">
                Danger Zone
              </h3>
              <div className="space-y-3">
                {selectedWorkspace.role === "OWNER" ? (
                  <button
                    onClick={handleDeleteWorkspace}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    Delete Workspace
                  </button>
                ) : (
                  <button
                    onClick={handleLeaveWorkspace}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    Leave Workspace
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showInviteModal && selectedWorkspace && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto"
          onClick={() => setShowSettingsModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 mt-8 mb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-4">
              Invite Member
            </h2>
            <p className="text-gray-600 mb-4">
              Invite someone to join {selectedWorkspace.name}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as "MEMBER" | "ADMIN")
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="member">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteMember}
                className="flex-1 px-4 py-2 bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl border-b border-slate-600 font-bold text-white rounded-lg hover:bg-gray-700 transition"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
