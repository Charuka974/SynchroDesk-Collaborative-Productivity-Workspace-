import api from "./api";

// ─────────────────────────────
// EVENT CALENDAR SERVICES
// ─────────────────────────────
export type EventRecurrence = {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval?: number;
  daysOfWeek?: number[]; // 0 = Sunday ... 6 = Saturday
  until?: string | Date;
  count?: number;
  exceptions?: (string | Date)[];
};


// Create a new event
export const createEventAPI = async (payload: {
  title: string;
  start: string | Date;
  end: string | Date;
  workspaceId?: string | null;
  description?: string;
  eventType?: string;
  location?: string;
  recurrence?: EventRecurrence;
}) => {
  const res = await api.post("/events", payload);
  return res.data;
};


// Get all personal events created by logged-in user
export const getMyEventsAPI = async () => {
  const res = await api.get("/events/mine");
  return res.data;
};

// Get events by workspace
export const getEventsByWorkspaceAPI = async (workspaceId: string) => {
  const res = await api.get(`/events/workspace/${workspaceId}`);
  return res.data;
};

// Get a single event by ID
export const getEventAPI = async (eventId: string) => {
  const res = await api.get(`/events/${eventId}`);
  return res.data;
};

// Update an event
export const updateEventAPI = async (
  eventId: string,
  payload: {
    title?: string;
    start?: string | Date;
    end?: string | Date;
    description?: string;
    eventType?: string;
    location?: string;
    recurrence?: EventRecurrence | null; // null = remove recurrence
  }
) => {
  const res = await api.put(`/events/${eventId}`, payload);
  return res.data;
};


// Delete an event
export const deleteEventAPI = async (eventId: string) => {
  const res = await api.delete(`/events/${eventId}`);
  return res.data;
};