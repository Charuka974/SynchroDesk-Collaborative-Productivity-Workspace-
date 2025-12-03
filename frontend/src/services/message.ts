import api from "./api";

export interface IUser {
  avatar: string | undefined;
  _id: string;
  name: string;
  email: string;
}

export interface IWorkspace {
  _id: string;
  name: string;
  members: { userId: string; role: string }[];
}

export interface IMessage {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  receiverId?: string;
  text?: string;
  image?: string;
  file?: string;
  audio?: string;
  createdAt: string;
}

// Get all users except logged-in user
// export const getUsersAPI = async (): Promise<IUser[]> => {
//   const res = await api.get("/messages/users");
//   return res.data; 
// };

export interface GetUsersResponse {
  users: IUser[];
  workspaces: IWorkspace[];
}

export const getUsersAPI = async (): Promise<GetUsersResponse> => {
  const res = await api.get("/messages/users");
  return res.data; // { users: [...], workspaces: [...] }
};


// Get messages between logged-in user and another user
export const getMessagesAPI = async (userId: string): Promise<IMessage[]> => {
  const res = await api.get(`/messages/dm/${userId}`);
  return res.data;
};

export const getGroupMessagesAPI = async (workspaceId: string): Promise<IMessage[]> => {
  const res = await api.get(`/messages/group/${workspaceId}`);
  return res.data;
};

// Send a new message to a specific user
// export const sendMessageAPI = async (
//   receiverId: string,
//   messageData: { text?: string; image?: string; file?: string; audio?: string }
// ): Promise<IMessage> => {
//   const res = await api.post(`/messages/send/${receiverId}`, messageData);
//   return res.data;
// };

export const sendMessageAPI = async (data: {
  receiverId?: string;
  workspaceId?: string;
  text?: string;
  image?: File;
  file?: File;
  audio?: File;
}): Promise<IMessage> => {
  const form = new FormData();

  if (data.receiverId) form.append("receiverId", data.receiverId);
  if (data.workspaceId) form.append("workspaceId", data.workspaceId);
  if (data.text) form.append("text", data.text);

  // Append files only if they exist
  if (data.image) form.append("image", data.image);
  if (data.file) form.append("file", data.file);
  if (data.audio) form.append("audio", data.audio);

  const url = data.receiverId
    ? `/messages/send/dm/${data.receiverId}`
    : `/messages/send/group/${data.workspaceId}`;

  const res = await api.post(url, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};
