import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  createNote,
  getMyNotes,
  getNotesByWorkspace,
  getNoteById,
  updateNote,
  deleteNote,
  getMyPersonalNotes
} from "../controllers/note.controller";

const router = Router();

// ─────────────────────────────
// NOTE ROUTES
// ─────────────────────────────

// Create a note
router.post("/", authenticate, createNote);

// Get all notes created by logged-in user
router.get("/mine", authenticate, getMyNotes);

router.get("/mypersonal", authenticate, getMyPersonalNotes);

// Get notes inside a workspace
router.get("/workspace/:workspaceId", authenticate, getNotesByWorkspace);

// Get a single note
router.get("/:id", authenticate, getNoteById);

// Update note
router.put("/:id", authenticate, updateNote);

// Delete note
router.delete("/:id", authenticate, deleteNote);

export default router;
