import React, { useState } from "react";

interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const NotesPanel: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      _id: "1",
      title: "Meeting Notes",
      content: "Discussed project timeline and deliverables for Q1.",
      tags: ["work", "important"],
      isPinned: true,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15")
    },
    {
      _id: "2",
      title: "Project Ideas",
      content: "New feature ideas for the mobile app including dark mode and offline support.",
      tags: ["ideas", "development"],
      isPinned: false,
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-12")
    }
  ]);

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: [] as string[],
    isPinned: false
  });

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)));

  const filteredNotes = notes
    .filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !selectedTag || note.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const handleSaveNote = () => {
    if (editingNote) {
      setNotes(notes.map(n => n._id === editingNote._id ? { ...editingNote, updatedAt: new Date() } : n));
      setEditingNote(null);
    } else {
      const note: Note = {
        ...newNote,
        _id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setNotes([...notes, note]);
      setNewNote({ title: "", content: "", tags: [], isPinned: false });
    }
    setShowNoteModal(false);
  };

  const togglePin = (id: string) => {
    setNotes(notes.map(n => n._id === id ? { ...n, isPinned: !n.isPinned } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n._id !== id));
  };

  return (
    <div className="bg-white w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-linear-to-r from-emerald-600 via-emerald-700 to-teal-800 flex items-center justify-center shadow-xl border-b border-emerald-500">
        <h2 className="text-3xl font-bold text-center text-white tracking-tight">Notes</h2>
      </div>

      {/* Search & Add Button */}
      <div className="flex gap-3 items-center mt-4 mb-4 px-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          onClick={() => setShowNoteModal(true)}
          className="px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          New Note
        </button>
      </div>

      {/* Tags Filter */}
      <div className="flex gap-2 mb-4 px-6 overflow-x-auto">
        <button
          onClick={() => setSelectedTag(null)}
          className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
            !selectedTag ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          All
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedTag === tag ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-6 pb-6 overflow-y-auto">
        {filteredNotes.map(note => (
          <div key={note._id} className="bg-linear-to-br from-white to-gray-50 p-4 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900 text-lg flex-1">{note.title}</h3>
              <div className="flex gap-2">
                <button onClick={() => togglePin(note._id)} className="text-gray-400 hover:text-yellow-500">
                  {note.isPinned ? (
                    <svg className="w-5 h-5 fill-yellow-500" viewBox="0 0 24 24">
                      <path d="M16 12V4h1a1 1 0 000-2H7a1 1 0 000 2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">{note.content}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {note.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
              <div className="flex gap-2">
                <button onClick={() => { setEditingNote(note); setShowNoteModal(true); }} className="text-blue-600 hover:text-blue-800">Edit</button>
                <button onClick={() => deleteNote(note._id)} className="text-red-600 hover:text-red-800">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">{editingNote ? "Edit Note" : "New Note"}</h2>
            <input
              type="text"
              placeholder="Note title..."
              value={editingNote ? editingNote.title : newNote.title}
              onChange={e => editingNote ? setEditingNote({ ...editingNote, title: e.target.value }) : setNewNote({ ...newNote, title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded mb-3"
            />
            <textarea
              placeholder="Write your note..."
              value={editingNote ? editingNote.content : newNote.content}
              onChange={e => editingNote ? setEditingNote({ ...editingNote, content: e.target.value }) : setNewNote({ ...newNote, content: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded mb-3 h-48 resize-none"
            />
            <input
              type="text"
              placeholder="Tags (comma separated)..."
              value={editingNote ? editingNote.tags.join(", ") : newNote.tags.join(", ")}
              onChange={e => {
                const tags = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                editingNote ? setEditingNote({ ...editingNote, tags }) : setNewNote({ ...newNote, tags });
              }}
              className="w-full p-3 border border-gray-300 rounded mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowNoteModal(false); setEditingNote(null); }} className="flex-1 p-3 border border-gray-300 rounded">Cancel</button>
              <button onClick={handleSaveNote} className="flex-1 p-3 bg-emerald-600 text-white rounded">Save Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};