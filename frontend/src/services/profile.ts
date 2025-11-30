import api from "./api";

// ─────────────────────────────
// USER PROFILE SERVICES
// ─────────────────────────────

// Get my profile
export const getMyProfileAPI = async () => {
  const res = await api.get("/users/me");
  return res.data;
};

// Update my profile (name, avatar, etc.)
export const updateMyProfileAPI = async (payload: {
  name?: string;
  avatar?: string;
}) => {
  const res = await api.put("/users/me", payload);
  return res.data;
};

// Change my password
export const changeMyPasswordAPI = async (payload: {
  currentPassword: string;
  newPassword: string;
}) => {
  const res = await api.put("/users/me/password", payload);
  return res.data;
};

// ─────────────────────────────
// USER LIST SERVICES
// ─────────────────────────────

// Get all users (admin or dropdown list)
export const getAllUsersAPI = async () => {
  const res = await api.get("/users");
  return res.data;
};

// ─────────────────────────────
// WORKSPACE RELATED USERS
// ─────────────────────────────

// Get users in all my workspaces (sidebar chat list)
export const getWorkspaceMembersAPI = async () => {
  const res = await api.get("/users/workspace-members");
  return res.data;
};

// ─────────────────────────────
// WORKSPACES WITH MY ROLE
// ─────────────────────────────
export const getMyWorkspaceRolesAPI = async () => {
  const res = await api.get("/users/workspace-my-roles");
  return res.data; // returns array of { _id, name, description, myRole, memberCount, owner }
};
