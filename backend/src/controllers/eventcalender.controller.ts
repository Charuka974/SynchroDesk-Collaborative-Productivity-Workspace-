// ✔ createEvent()
// ✔ updateEvent()
// ✔ deleteEvent()
// ✔ getEventsByWorkspace()
// ✔ getMyEvents() 

import { Request, Response } from "express";
import mongoose from "mongoose";
import { Event } from "../models/eventcalender.model";
import { Workspace } from "../models/workspace.model";
import { AUthRequest } from "../middleware/auth";

// ================================================================
// CREATE EVENT
// ================================================================
export const createEvent = async (req: AUthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    const {
      title,
      start,
      end,
      workspaceId,
      description,
      eventType,
      location,
      recurrence,
    } = req.body;

    if (!title || !start || !end) {
      return res.status(400).json({ message: "Title, start, and end are required" });
    }

    // Workspace validation
    if (workspaceId) {
      if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        return res.status(400).json({ message: "Invalid workspaceId" });
      }

      const ws = await Workspace.findById(workspaceId);
      if (!ws) return res.status(404).json({ message: "Workspace not found" });
    }

    let validatedRecurrence;
    try {
      validatedRecurrence = validateRecurrence(recurrence);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }

    const event = await Event.create({
      title,
      start,
      end,
      workspaceId: workspaceId || null,
      description,
      eventType,
      location,
      recurrence: validatedRecurrence,
      createdBy: userId,
    });

    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Server error creating event" });
  }
};


// ================================================================
// GET MY EVENTS (PERSONAL)
// ================================================================
export const getMyEvents = async (req: AUthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    const events = await Event.find({
      createdBy: userId,
      workspaceId: null,
    })
      .sort({ start: 1 })
      .lean();

    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server error fetching events" });
  }
};

// ================================================================
// GET EVENTS BY WORKSPACE
// ================================================================
export const getEventsByWorkspace = async (req: AUthRequest, res: Response) => {
  try {
    const { workspaceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ message: "Invalid workspaceId" });
    }

    const events = await Event.find({ workspaceId })
      .sort({ start: 1 })
      .lean();

    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching workspace events:", error);
    res.status(500).json({ message: "Server error fetching workspace events" });
  }
};

// ================================================================
// GET SINGLE EVENT
// ================================================================
export const getEventById = async (req: AUthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event id" });
    }

    const event = await Event.findById(id).lean();
    if (!event) return res.status(404).json({ message: "Event not found" });

    res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Server error fetching event" });
  }
};

// ================================================================
// UPDATE EVENT
// ================================================================
export const updateEvent = async (req: AUthRequest, res: Response) => {
  try {
    const eventId = req.params.id;
    const userId = req.user?.sub;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Authorization: personal events only
    if (!event.workspaceId && event.createdBy.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const {
      title,
      start,
      end,
      description,
      eventType,
      location,
      recurrence,
    } = req.body;

    let validatedRecurrence;
    if (recurrence !== undefined) {
      try {
        validatedRecurrence = validateRecurrence(recurrence);
      } catch (err: any) {
        return res.status(400).json({ message: err.message });
      }
    }

    event.title = title ?? event.title;
    event.start = start ?? event.start;
    event.end = end ?? event.end;
    event.description = description ?? event.description;
    event.eventType = eventType ?? event.eventType;
    event.location = location ?? event.location;

    if (recurrence !== undefined) {
      event.recurrence = validatedRecurrence;
    }

    const updated = await event.save();
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Server error updating event" });
  }
};


// ================================================================
// DELETE EVENT
// ================================================================
export const deleteEvent = async (req: AUthRequest, res: Response) => {
  try {
    const eventId = req.params.id;
    const userId = req.user?.sub;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Authorization: personal events only
    if (!event.workspaceId && event.createdBy.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await event.deleteOne();
    res.status(200).json({ message: "Event deleted" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Server error deleting event" });
  }
};


const validateRecurrence = (
  recurrence: any
): {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval?: number;
  daysOfWeek?: number[];
  until?: Date;
  count?: number;
  exceptions?: Date[];
} | undefined => {
  if (!recurrence) return undefined;

  const { frequency, interval, daysOfWeek, until, count, exceptions } = recurrence;

  if (!["daily", "weekly", "monthly", "yearly"].includes(frequency)) {
    throw new Error("Invalid recurrence frequency");
  }

  if (interval && interval < 1) {
    throw new Error("Recurrence interval must be >= 1");
  }

  if (daysOfWeek) {
    if (!Array.isArray(daysOfWeek) || daysOfWeek.some((d) => d < 0 || d > 6)) {
      throw new Error("daysOfWeek must be numbers between 0 and 6");
    }
  }

  if (until && isNaN(new Date(until).getTime())) {
    throw new Error("Invalid recurrence until date");
  }

  if (count && count < 1) {
    throw new Error("Recurrence count must be >= 1");
  }

  return {
    frequency,
    interval: interval ?? 1,
    daysOfWeek,
    until: until ? new Date(until) : undefined,
    count,
    exceptions: exceptions?.map((d: any) => new Date(d)),
  };
};
