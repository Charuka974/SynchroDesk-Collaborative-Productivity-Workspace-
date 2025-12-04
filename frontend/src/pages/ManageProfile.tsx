import { useState, useEffect } from "react";
import {
  User,
  Lock,
  Camera,
  Save,
  Building2,
  Crown,
  Shield,
  Users,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useUser } from "../context/profileContext";
import { updateMyProfileAPI, changeMyPasswordAPI } from "../services/profile";
import { getMyWorkspacesAPI } from "../services/workspace";
import Swal from "sweetalert2"; 
import { useNavigate } from "react-router-dom";

export default function ProfileManagement() {
  const { user, refreshUser } = useUser();
  const navigate = useNavigate();

  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string>();

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

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  const fetchWorkspaces = async () => {
    // setLoading(true);
    try {
      const data = await getMyWorkspacesAPI();
      setWorkspaces(data);
    } catch (err: any) {
      // setError(err.message || "Failed to fetch workspaces");
      console.error(err);
    } finally {
      // setLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState<"personal" | "security" | "workspaces">("personal");

  const [profile, setProfile] = useState(user);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Load profile on mount
  useEffect(() => {
    if (!user) return;
    setProfile(user);
    setEditData({ ...editData, name: user.name, email: user.email });
    setAvatarPreview(user.avatar);
  }, [user]);

  // Fetch workspaces on mount
  useEffect(() => {
    refreshUser();
    fetchWorkspaces();
  }, []);

  // Avatar Change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Save Personal Info
  const handleSavePersonal = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", editData.name);
      if (avatarFile) {
        formData.append("avatar", avatarFile); // File object
      }

      await updateMyProfileAPI(formData); // make sure your API accepts FormData
      await refreshUser(); // refresh context
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      console.error(err);
      // setError(err.message || "Failed to update profile");
    }
    setIsSaving(false);
  };



  // Change Password
  const handleChangePassword = async () => {
    if (editData.newPassword !== editData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    setIsSaving(true);
    try {
      await changeMyPasswordAPI({
        currentPassword: editData.currentPassword,
        newPassword: editData.newPassword
      });

      setSuccessMessage("Password changed successfully!");
      setEditData({
        ...editData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
    }
    setIsSaving(false);
  };

  // UI Helper Icons (unchanged)
  const getRoleIcon = (role: any) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="text-red-600" size={16} />;
      case "OWNER":
        return <Crown className="text-yellow-600" size={16} />;
      default:
        return <Users className="text-blue-600" size={16} />;
    }
  };

  // const getStatusBadge = (status: any) => {

  //   return (
  //     <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium`}>
  //       {status}
  //     </span>
  //   );
  // };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent pb-3">Profile Settings</h1>
          <p className="font-semibold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">Manage your account settings and preferences</p>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700"
            >
              <CheckCircle size={20} />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 rounded-t-xl">
          <div className="flex gap-1 px-6">
            {[
              { id: "personal", label: "Personal Info", icon: User },
              { id: "security", label: "Security", icon: Lock },
              { id: "workspaces", label: "Workspaces", icon: Building2 }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`px-4 py-3 text-sm font-medium transition-all duration-200 relative flex items-center gap-2 ${
                  activeTab === tab.id ? "text-blue-900" : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
              >
                <tab.icon size={18} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-800"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 p-6">
          {/* Personal Info Tab */}
          {activeTab === "personal" && (
            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-linear-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-3xl font-semibold overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      profile.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors shadow-lg">
                    <Camera size={16} className="text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-semibold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">{profile.name}</h3>
                  <p className="text-sm text-gray-600">{profile.email}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {/* {getStatusBadge(profile.approved)} */}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      profile.subscriptionPlan === "PREMIUM" 
                        ? "bg-linear-to-r from-yellow-400 to-orange-500 text-white" 
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {profile.subscriptionPlan}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.roles.map((role) => (
                        <span key={role} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                          {getRoleIcon(role)}
                          {role}
                        </span>
                      ))}
                    </div>
                  </div> */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Joined Date</label>
                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700 text-sm">
                      {formatDate(profile.createdAt?.toString() || "")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={handleSavePersonal}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl border-b border-slate-600 font-bold text-white transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={editData.currentPassword}
                      onChange={(e) => setEditData({ ...editData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={editData.newPassword}
                      onChange={(e) => setEditData({ ...editData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={editData.confirmPassword}
                      onChange={(e) => setEditData({ ...editData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Security Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Security Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use at least 8 characters with a mix of letters, numbers, and symbols</li>
                  <li>• Don't reuse passwords from other accounts</li>
                  <li>• Consider using a password manager</li>
                </ul>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={handleChangePassword}
                  disabled={isSaving || !editData.currentPassword || !editData.newPassword}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl border-b border-slate-600 font-bold text-white transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Lock size={18} />
                  {isSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          )}

          {/* Workspaces Tab */}
          {activeTab === "workspaces" && (
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Your Workspaces</h3>
                    <p className="text-sm text-gray-600">Manage your workspace memberships</p>
                </div>

                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {workspaces.length} Workspace{workspaces.length !== 1 ? "s" : ""}
                </span>
                </div>

                <div className="space-y-3">
                    {workspaces.map((workspace) => {
                        // Make sure user and workspace.owner exist
                        // const userIdStr = user?._id?.toString();
                        // const ownerIdStr = workspace.role?.toString();

                        // Determine current user's role safely
                        const myRole = workspace.role

                        return (
                        <motion.div
                            key={workspace.id?.toString() || Math.random()}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-linear-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center text-white font-semibold">
                                    {workspace.name?.charAt(0).toUpperCase() || "?"}
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-900">{workspace.name || "Unnamed Workspace"}</h4>
                                    {workspace.description && (
                                    <p className="text-sm text-gray-600">{workspace.description}</p>
                                    )}
                                </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-600 ml-15">
                                {/* ROLE */}
                                <span className="inline-flex items-center gap-1">
                                    {getRoleIcon(myRole)}
                                    <span className="font-medium">{myRole}</span>
                                </span>

                                {/* MEMBER COUNT */}
                                <span className="inline-flex items-center gap-1">
                                    <Users size={14} />
                                    {workspace.members?.length - 1 || 0} more members
                                </span>

                                {/* JOIN DATE */}
                                {/* <span className="inline-flex items-center gap-1">
                                    <Calendar size={14} />
                                    Joined {formatDate(workspace.invitedUsers?.at.toString() || "")}
                                </span> */}
                                </div>
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
                                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium">
                                    View
                            </button>
                            </div>
                        </motion.div>
                        );
                    })}
                </div>


                {workspaces.length === 0 && (
                <div className="text-center py-12">
                    <Building2 size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-600">You're not part of any workspaces yet</p>
                    <button className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    Create Workspace
                    </button>
                </div>
                )}
            </div>
            )}

        </div>
      </div>
    </div>
  );
}