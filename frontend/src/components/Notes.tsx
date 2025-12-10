import React, { useState, useMemo, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useNotes, type INote } from "../context/noteContext";
import Swal from "sweetalert2";

interface NotesPanelProps {
  workspace?: {
    id: string;
    name: string;
    description?: string;
  } | null;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ workspace = null }) => {

  const [folders] = useState<string[]>(["General", "Work", "Personal"]);
  // const [activeFolder, setActiveFolder] = useState<string>("General");
  const [activeFolder, setActiveFolder] = useState<string>("All");


  const filterFolders = ["All", ...folders];

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<INote | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [showReadModal, setShowReadModal] = useState(false);
  const [readingNote, setReadingNote] = useState<INote | null>(null);

  const { notes, loading, fetchMyNotes, fetchNotesByWorkspace, createNote, updateNote, deleteNote} = useNotes();

  useEffect(() => {
    if (workspace?.id) {
      fetchNotesByWorkspace(workspace.id);
    } else {
      fetchMyNotes();
    }
  }, [workspace]);

  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    workspaceId: workspace?.id ?? null,
    tags: [] as string[],
    isPinned: false,
    folder: "General",
  });

  // ─────────────────────────────────────────────
  // Tags derived from notes
  // ─────────────────────────────────────────────
  const allTags = useMemo(() => {
    return Array.from(new Set(notes.flatMap((n) => n.tags || [])));
  }, [notes]);

  // ─────────────────────────────────────────────
  // Filtered & sorted notes
  // ─────────────────────────────────────────────
  const filteredNotes = useMemo(() => {
    return notes
      // .filter((n) => n.folder === activeFolder)
      .filter((n) => activeFolder === "All" || n.folder === activeFolder)

      .filter((n) => {
        const matchesSearch =
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTag = !selectedTag || n.tags?.includes(selectedTag);
        return matchesSearch && matchesTag;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt || "").getTime() -
          new Date(a.updatedAt || "").getTime()
      );
  }, [notes, activeFolder, searchQuery, selectedTag]);

  // ─────────────────────────────────────────────
  // Save note (create or update)
  // ─────────────────────────────────────────────
  const handleSaveNote = async () => {
    try {
      const noteToCheck = editingNote ?? newNote;

      if (!noteToCheck.title.trim() || !noteToCheck.content.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Validation Error",
          text: "Title and content cannot be empty",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        return;
      }

      if (editingNote) {
        await updateNote(editingNote._id, editingNote);
        setEditingNote(null);
      } else {
        await createNote(newNote);
        setNewNote({
          title: "",
          content: "",
          workspaceId: workspace?.id ?? null,
          tags: [],
          isPinned: false,
          folder: "General",
        });
        editor?.commands.setContent("");
      }
      setShowNoteModal(false);
    } catch (err) {
      console.error("Failed to save note", err);
    }
  };

  // ─────────────────────────────────────────────
  // Move note to another folder
  // ─────────────────────────────────────────────
  const moveNoteToFolder = async (note: INote, folder: string) => {
    try {
      await updateNote(note._id, { ...note, folder });
    } catch (err) {
      console.error("Failed to move note", err);
    }
  };

  const openNoteModal = (note?: INote) => {
    if (note) {
      setEditingNote(note);
      editor?.commands.setContent(note.content || ""); // load content
    } else {
      setEditingNote(null);
      setNewNote({ title: "", content: "", workspaceId: workspace?.id ?? null , tags: [], isPinned: false, folder: "General" });
      editor?.commands.setContent(""); // clear editor
    }
    setShowNoteModal(true);
  };


  const editor = useEditor({
    extensions: [StarterKit],
    onUpdate({ editor }) {
      const html = editor.getHTML();
      if (editingNote) {
        setEditingNote({ ...editingNote, content: html });
      } else {
        setNewNote({ ...newNote, content: html });
      }
    },
  });

  const openReadModal = (note: INote) => {
    setReadingNote(note);
    setShowReadModal(true);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading notes...</div>;
  }

  return (
    <div className="bg-white w-full h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="p-4 bg-linear-to-r from-emerald-600 via-emerald-700 to-emerald-900 flex items-center justify-center shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-white tracking-tight">
          {workspace ? `${workspace?.name || "Workspace"} Notes` : "Personal Notes"}
        </h2> 
      </div>

      {/* Folder Tabs */}
      <div className="flex gap-3 px-6 mt-6 mb-4">
        {filterFolders
          .filter((folder) => !(workspace && folder === "Personal"))
          .map((folder) => (
            <button
              key={folder}
              onClick={() => setActiveFolder(folder)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm ${
                activeFolder === folder
                  ? "bg-linear-to-r from-emerald-600 to-emerald-700 text-white shadow-md scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {folder}
            </button>
          ))}
      </div>


      {/* Search & Add */}
      <div className="flex gap-3 items-center mt-2 mb-5 px-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-12 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white transition-all"
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-4 top-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <button
          // onClick={() => setShowNoteModal(true)}
          onClick={() => openNoteModal()}
          className="px-6 py-3 bg-linear-to-r from-emerald-600 to-emerald-900 text-white rounded hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
        >
          + New Note
        </button>
        
      </div>

      <div className="h-auto flex flex-col p-2 rounded-xl mx-auto">
        <div className="flex gap-2 px-6 overflow-x-auto pb-2 scrollbar-visible w-full max-w-100">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 shadow-sm whitespace-nowrap inline-block ${
              !selectedTag 
                ? "bg-linear-to-r from-emerald-600 to-emerald-700 text-white shadow-md" 
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            All Tags
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-sm whitespace-nowrap truncate ${
                selectedTag === tag
                  ? "bg-linear-to-r from-emerald-600 to-emerald-700 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <span>{tag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="flex-1 h-auto min-h-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 px-6 pb-6 overflow-y-auto mt-2">
        {filteredNotes.map((note) => (
          <div
            key={note._id}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 
                className="relative font-bold text-gray-800 text-lg flex-1 leading-tight cursor-pointer group"
                onClick={() => openReadModal(note)}
              >
                {note.title}
                
                {/* Tooltip */}
                <span className="absolute left-1/2 -bottom-6 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs rounded px-2 py-1 pointer-events-none transition-all duration-300 transform scale-75 group-hover:scale-100">
                  Read
                </span>
              </h3>
            </div>

            {/* Render styled content */}
            <div
              className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: note.content }}
            />

            <div className="flex flex-wrap gap-2 mb-4">
              {note.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-linear-to-r from-emerald-50 to-emerald-100 text-emerald-700 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span className="font-medium">{new Date(note.updatedAt || "").toLocaleDateString()}</span>
                <select
                  className="text-gray-600 bg-transparent font-medium cursor-pointer hover:text-gray-800 focus:outline-none text-xs"
                  value={note.folder || "General"}
                  onChange={(e) => moveNoteToFolder(note, e.target.value)}
                >
                  {folders
                  .filter((folder) => !(workspace && folder === "Personal"))
                  .map((folder) => (
                    <option key={folder} value={folder}>
                      {folder}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  // onClick={() => {
                  //   setEditingNote(note);
                  //   setShowNoteModal(true);
                  // }}
                  onClick={() => openNoteModal(note)}
                  className="text-gray-500 hover:text-gray-800 font-bold transition-colors text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteNote(note._id)}
                  className="text-red-500 hover:text-red-800 font-bold transition-colors text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl text-center font-bold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-4">
              {editingNote ? "Edit Note" : "New Note"}
            </h2>

            <label className="text-sm font-semibold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Title
            </label>
            <input
              type="text"
              placeholder="Note title..."
              value={editingNote ? editingNote.title : newNote.title}
              onChange={(e) =>
                editingNote
                  ? setEditingNote({ ...editingNote, title: e.target.value })
                  : setNewNote({ ...newNote, title: e.target.value })
              }
              className="w-full p-3 border border-gray-300 shadow-sm rounded mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />

            <label className="text-sm font-semibold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Content
            </label>
            {/* TipTap Rich Text Editor */}
            <EditorContent
              editor={editor}
              className="w-full p-4 border border-gray-300 rounded mb-2 h-40 overflow-auto focus-within:ring-2 focus-within:ring-emerald-500 transition-all bg-gray-50"
            />

            <label className="text-sm font-semibold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {["Work", "Personal", "Urgent", "Idea"].map((tag) => {
                const isSelected = editingNote
                  ? editingNote.tags?.includes(tag)
                  : newNote.tags.includes(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (editingNote) {
                        const newTags = isSelected
                          ? editingNote.tags?.filter(t => t !== tag)
                          : [...(editingNote.tags || []), tag];
                        setEditingNote({ ...editingNote, tags: newTags });
                      } else {
                        const newTags = isSelected
                          ? newNote.tags.filter(t => t !== tag)
                          : [...newNote.tags, tag];
                        setNewNote({ ...newNote, tags: newTags });
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      isSelected
                        ? "bg-linear-to-r from-emerald-600 to-emerald-700 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>


            <label className="text-sm font-semibold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Folder
            </label>
            <select
              className="w-full p-3 border border-gray-300 shadow-sm rounded mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer transition-all"
              value={editingNote ? editingNote.folder || "General" : newNote.folder}
              onChange={(e) =>
                editingNote
                  ? setEditingNote({ ...editingNote, folder: e.target.value })
                  : setNewNote({ ...newNote, folder: e.target.value })
              }
            >
              {folders
              .filter((folder) => !(workspace && folder === "Personal"))
              .map((folder) => (
                <option key={folder} value={folder}>
                  {folder}
                </option>
              ))}
            </select>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setEditingNote(null);
                }}
                className="flex-1 p-3 border border-gray-300 shadow-sm rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="flex-1 p-3 bg-linear-to-r from-emerald-600 to-emerald-900 shadow-xl border-b border-slate-600 font-bold text-white rounded "
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Read Modal */}
      {showReadModal && readingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl transform transition-all max-h-[85vh] flex flex-col relative">
            {/* Close button - fixed at top right */}
            <button
              onClick={() => setShowReadModal(false)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-linear-to-r from-emerald-600 to-emerald-700 text-white rounded-full shadow-md flex items-center justify-center hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 z-10 border-2 border-transparent hover:border-white"
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

            <h2 className="text-3xl font-bold mb-4 bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent text-center">{readingNote.title}</h2>

            {/* Scrollable content */}
            <div className="overflow-y-auto p-8">

              <div
                className="text-gray-700 text-base leading-relaxed prose prose-emerald max-w-none"
                dangerouslySetInnerHTML={{ __html: readingNote.content }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};