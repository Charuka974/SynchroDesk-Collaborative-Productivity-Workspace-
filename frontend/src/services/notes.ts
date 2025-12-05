import api from "./api";

// ─────────────────────────────
// NOTE SERVICES
// ─────────────────────────────

// Create a new note
export const createNoteAPI = async (payload: {
  title: string;
  content: string;       // HTML or styled rich text
  workspaceId?: string | null;
  folder?: string;
  tags?: string[];
}) => {
  const res = await api.post("/notes", payload);
  return res.data;
};

// Get all notes created by logged-in user
export const getMyNotesAPI = async () => {
  const res = await api.get("/notes/mine");
  return res.data;
};

export const getMyPersonalNotesAPI = async () => {
  const res = await api.get("/notes/mypersonal");
  return res.data;
};

// Get notes by workspace
export const getNotesByWorkspaceAPI = async (workspaceId: string) => {
  const res = await api.get(`/notes/workspace/${workspaceId}`);
  return res.data;
};

// Get a single note by ID
export const getNoteAPI = async (noteId: string) => {
  const res = await api.get(`/notes/${noteId}`);
  return res.data;
};

// Update a note
export const updateNoteAPI = async (
  noteId: string,
  payload: {
    title?: string;
    content?: string;    // HTML or styled
    folder?: string | null;
    tags?: string[];
  }
) => {
  const res = await api.put(`/notes/${noteId}`, payload);
  return res.data;
};

// Delete a note
export const deleteNoteAPI = async (noteId: string) => {
  const res = await api.delete(`/notes/${noteId}`);
  return res.data;
};
