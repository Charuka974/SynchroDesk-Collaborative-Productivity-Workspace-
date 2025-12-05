// ✔ createNote()
// ✔ updateNote()
// ✔ deleteNote()
// ✔ getNotesByWorkspace()
// ✔ getNoteById()


// 4.2 NoteVersionController (premium)

// ✔ saveVersion()
// ✔ getVersions()
// ✔ restoreVersion()

import { Request, Response } from "express";
import mongoose from "mongoose";
import { Note } from "../models/note.model";
import { Workspace } from "../models/workspace.model";
import { AUthRequest } from "../middleware/auth";

// ================================================================
// CREATE NOTE
// ================================================================
export const createNote = async (req: AUthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    const { title, content, workspaceId, folder, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // Optional: Validate workspace
    if (workspaceId) {
      const ws = await Workspace.findById(workspaceId);
      if (!ws) return res.status(404).json({ message: "Workspace not found" });
    }

    const note = await Note.create({
      title,
      content, // HTML or styled rich text allowed ✔
      workspaceId: workspaceId || null,
      folder: folder || null,
      tags: tags || [],
      createdBy: userId,
    });

    res.status(201).json(note);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ message: "Server error creating note" });
  }
};

// ================================================================
// GET ALL NOTES FOR THE CURRENT USER
// ================================================================
export const getMyNotes = async (req: AUthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    const notes = await Note.find({ createdBy: userId })
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Server error fetching notes" });
  }
};

export const getMyPersonalNotes = async (req: AUthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    // Only fetch notes created by this user AND where workspaceId is null
    const notes = await Note.find({ 
      createdBy: userId, 
      workspaceId: null 
    })
    .sort({ updatedAt: -1 })
    .lean();

    res.status(200).json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Server error fetching notes" });
  }
};


// ================================================================
// GET NOTES BY WORKSPACE
// ================================================================
export const getNotesByWorkspace = async (req: AUthRequest, res: Response) => {
  try {
    const { workspaceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ message: "Invalid workspaceId" });
    }

    const notes = await Note.find({ workspaceId })
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json(notes);
  } catch (error) {
    console.error("Error fetching workspace notes:", error);
    res.status(500).json({ message: "Server error fetching workspace notes" });
  }
};

// ================================================================
// GET SINGLE NOTE
// ================================================================
export const getNoteById = async (req: AUthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const note = await Note.findById(id).lean();
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Optional: Only creator or workspace member can view
    res.status(200).json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    res.status(500).json({ message: "Server error fetching note" });
  }
};

// ================================================================
// UPDATE NOTE
// ================================================================
// export const updateNote = async (req: AUthRequest, res: Response) => {
//   try {
//     const noteId = req.params.id;
//     const userId = req.user?.sub;

//     const note = await Note.findById(noteId);
//     if (!note) return res.status(404).json({ message: "Note not found" });

//     if (note.createdBy.toString() !== userId) {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     const { title, content, folder, tags } = req.body;

//     note.title = title ?? note.title;
//     note.content = content ?? note.content;
//     note.folder = folder ?? note.folder;
//     note.tags = tags ?? note.tags;

//     const updated = await note.save();
//     res.status(200).json(updated);
//   } catch (error) {
//     console.error("Error updating note:", error);
//     res.status(500).json({ message: "Server error updating note" });
//   }
// };

export const updateNote = async (req: AUthRequest, res: Response) => {
  try {
    const noteId = req.params.id;
    const userId = req.user?.sub;

    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Authorization check: only for personal notes
    if (!note.workspaceId && note.createdBy.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, content, folder, tags } = req.body;

    note.title = title ?? note.title;
    note.content = content ?? note.content;
    note.folder = folder ?? note.folder;
    note.tags = tags ?? note.tags;

    const updated = await note.save();
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ message: "Server error updating note" });
  }
};


// ================================================================
// DELETE NOTE
// ================================================================
// export const deleteNote = async (req: AUthRequest, res: Response) => {
//   try {
//     const noteId = req.params.id;
//     const userId = req.user?.sub;

//     const note = await Note.findById(noteId);
//     if (!note) return res.status(404).json({ message: "Note not found" });

//     if (note.createdBy.toString() !== userId) {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     await note.deleteOne();
//     res.status(200).json({ message: "Note deleted" });
//   } catch (error) {
//     console.error("Error deleting note:", error);
//     res.status(500).json({ message: "Server error deleting note" });
//   }
// };


export const deleteNote = async (req: AUthRequest, res: Response) => {
  try {
    const noteId = req.params.id;
    const userId = req.user?.sub;

    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Authorization check: only for personal notes
    if (!note.workspaceId && note.createdBy.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await note.deleteOne();
    res.status(200).json({ message: "Note deleted" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ message: "Server error deleting note" });
  }
};
