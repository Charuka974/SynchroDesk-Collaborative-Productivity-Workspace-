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
export const updateMyProfileAPI = async (data: { name?: string; avatar?: File | string } | FormData) => {
  // Detect FormData
  if (data instanceof FormData) {
    const res = await api.post("/users/me", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }

  // Previous logic for JSON / base64
  if (data.avatar instanceof File) {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    formData.append("avatar", data.avatar);
    const res = await api.put("/users/me", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }

  if (typeof data.avatar === "string" && data.avatar.startsWith("data:image")) {
    const blob = await (await fetch(data.avatar)).blob();
    const file = new File([blob], "avatar.png", { type: blob.type });

    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    formData.append("avatar", file);

    const res = await api.put("/users/me", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }

  const res = await api.put("/users/me", data);
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
