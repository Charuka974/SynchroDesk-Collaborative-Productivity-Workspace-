import axios from "axios";

const API_URL = "/api/workspaces";

export const getMyWorkspacesAPI = async () => {
  const res = await axios.get(`${API_URL}/mine`);
  return res.data;
};

export const createWorkspaceAPI = async (payload: { name: string; description?: string }) => {
  const res = await axios.post(API_URL, payload);
  return res.data;
};
