import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  createEvent,
  getMyEvents,
  getEventsByWorkspace,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventcalender.controller";

const router = Router();

// ─────────────────────────────
// EVENT ROUTES
// ─────────────────────────────

// Create an event
router.post("/", authenticate, createEvent);

// Get all personal events created by logged-in user
router.get("/mine", authenticate, getMyEvents);

// Get events inside a workspace
router.get("/workspace/:workspaceId", authenticate, getEventsByWorkspace);

// Get a single event
router.get("/:id", authenticate, getEventById);

// Update event
router.put("/:id", authenticate, updateEvent);

// Delete event
router.delete("/:id", authenticate, deleteEvent);

export default router;
