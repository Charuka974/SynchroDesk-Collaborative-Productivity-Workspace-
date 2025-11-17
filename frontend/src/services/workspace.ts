import api from "./api";

export const getMyWorkspacesAPI = async () => {
  const res = await api.get(`/workspaces/mine`);
  return res.data;
};

export const createWorkspaceAPI = async (payload: { name: string; description?: string }) => {
  const res = await api.post(`/workspaces`, payload);
  return res.data;
};

export const getWorkspaceByIdAPI = async (id: string) => {
  const res = await api.get(`/workspaces/${id}`);
  return res.data;
};

export const updateWorkspaceAPI = async (
  id: string,
  payload: { name?: string; description?: string; settings?: Record<string, any> }
) => {
  const res = await api.put(`/workspaces/${id}`, payload);
  return res.data;
};

export const deleteWorkspaceAPI = async (id: string) => {
  const res = await api.delete(`/workspaces/${id}`);
  return res.data;
};

export const inviteMemberAPI = async (
  workspaceId: string,
  payload: { email: string; role?: string }
) => {
  const res = await api.post(`/workspaces/${workspaceId}/invite`, payload);
  return res.data;
};

export const removeMemberAPI = async (workspaceId: string, userId: string) => {
  const res = await api.delete(`/workspaces/${workspaceId}/remove/${userId}`);
  return res.data;
};

export const changeRoleAPI = async (
  workspaceId: string,
  payload: { userId: string; role: string }
) => {
  const res = await api.patch(`/workspaces/${workspaceId}/role`, payload);
  return res.data;
};

export const leaveWorkspaceAPI = async (workspaceId: string) => {
  const res = await api.post(`/workspaces/${workspaceId}/leave`);
  return res.data;
};
