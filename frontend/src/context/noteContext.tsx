import {
  createContext,
  useContext,
  useState,
  // useEffect,
  type ReactNode
} from "react";

import {
  createNoteAPI,
  // getMyNotesAPI,
  getNotesByWorkspaceAPI,
  getNoteAPI,
  updateNoteAPI,
  deleteNoteAPI,
  getMyPersonalNotesAPI
} from "../services/notes";

export interface INote {
  _id: string;
  title: string;
  content: string;    // styled HTML or rich text
  workspaceId?: string | null;
  folder?: string;
  tags?: string[];
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

interface NotesContextType {
  notes: INote[];
  loading: boolean;
  error?: string;

  fetchMyNotes: () => Promise<void>;
  fetchNotesByWorkspace: (workspaceId: string) => Promise<void>;
  getNote: (id: string) => Promise<INote | null>;

  createNote: (payload: {
    title: string;
    content: string;
    workspaceId?: string | null;
    folder?: string;
    tags?: string[];
  }) => Promise<void>;

  updateNote: (
    id: string,
    payload: {
      title?: string;
      content?: string;
      folder?: string;
      tags?: string[];
    }
  ) => Promise<void>;

  deleteNote: (id: string) => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<INote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  // ─────────────────────────────
  // Load all my notes
  // ─────────────────────────────
  const fetchMyNotes = async () => {
    try {
      setLoading(true);
      const data = await getMyPersonalNotesAPI();
      setNotes(data);
      setError(undefined);
    } catch (err: any) {
      setError(err.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  // const fetchMyNotes = async () => {
  //   try {
  //     setLoading(true);
  //     const data = await getMyNotesAPI();
  //     setNotes(data);
  //     setError(undefined);
  //   } catch (err: any) {
  //     setError(err.message || "Failed to load notes");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // ─────────────────────────────
  // Load notes from workspace
  // ─────────────────────────────
  const fetchNotesByWorkspace = async (workspaceId: string) => {
    try {
      setLoading(true);
      const data = await getNotesByWorkspaceAPI(workspaceId);
      setNotes(data);
      setError(undefined);
    } catch (err: any) {
      setError(err.message || "Failed to load workspace notes");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────
  // Get single note
  // ─────────────────────────────
  const getNote = async (id: string) => {
    try {
      const note = await getNoteAPI(id);
      return note;
    } catch (err: any) {
      setError(err.message || "Failed to load note");
      return null;
    }
  };

  // ─────────────────────────────
  // Create note
  // ─────────────────────────────
  const createNote = async (payload: {
    title: string;
    content: string;
    workspaceId?: string | null;
    folder?: string;
    tags?: string[];
  }) => {
    try {
      const newNote = await createNoteAPI(payload);
      setNotes((prev) => [newNote, ...prev]); // Insert at top
      setError(undefined);
    } catch (err: any) {
      setError(err.message || "Failed to create note");
    }
  };

  // ─────────────────────────────
  // Update a note
  // ─────────────────────────────
  const updateNote = async (
    id: string,
    payload: {
      title?: string;
      content?: string;
      folder?: string;
      tags?: string[];
    }
  ) => {
    try {
      const updated = await updateNoteAPI(id, payload);
      setNotes((prev) => prev.map((n) => (n._id === id ? updated : n)));
      setError(undefined);
    } catch (err: any) {
      setError(err.message || "Failed to update note");
    }
  };

  // ─────────────────────────────
  // Delete a note
  // ─────────────────────────────
  const deleteNote = async (id: string) => {
    try {
      await deleteNoteAPI(id);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      setError(undefined);
    } catch (err: any) {
      setError(err.message || "Failed to delete note");
    }
  };

  // // Auto-load personal notes on mount
  // useEffect(() => {
  //   fetchMyNotes();
  // }, []);

  return (
    <NotesContext.Provider
      value={{
        notes,
        loading,
        error,
        fetchMyNotes,
        fetchNotesByWorkspace,
        getNote,
        createNote,
        updateNote,
        deleteNote
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used inside NotesProvider");
  return ctx;
};
