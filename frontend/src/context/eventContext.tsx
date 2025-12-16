import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import {
  createEventAPI,
  getMyEventsAPI,
  getEventsByWorkspaceAPI,
  getEventAPI,
  updateEventAPI,
  deleteEventAPI,
  type EventRecurrence,
} from "../services/events";

// ─────────────────────────────
// TYPES
// ─────────────────────────────
export interface IEvent {
  _id: string;
  title: string;
  start: string;     // ISO
  end: string;       // ISO
  workspaceId?: string | null;
  description?: string;
  eventType?: string;
  location?: string;

  recurrence?: EventRecurrence | null;

  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}


interface EventContextType {
  events: IEvent[];
  loading: boolean;
  error?: string;

  fetchMyEvents: () => Promise<void>;
  fetchEventsByWorkspace: (workspaceId: string) => Promise<void>;
  getEvent: (id: string) => Promise<IEvent | null>;

  createEvent: (payload: {
    title: string;
    start: string | Date;
    end: string | Date;
    workspaceId?: string | null;
    description?: string;
    eventType?: string;
    location?: string;
    recurrence?: EventRecurrence;
  }) => Promise<void>;


  updateEvent: (
    id: string,
    payload: {
      title?: string;
      start?: string | Date;
      end?: string | Date;
      description?: string;
      eventType?: string;
      location?: string;
      recurrence?: EventRecurrence | null; // null removes recurrence
    }
  ) => Promise<void>;


  deleteEvent: (id: string) => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

// ─────────────────────────────
// PROVIDER
// ─────────────────────────────
export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  // ─────────────────────────────
  // Load my personal events
  // ─────────────────────────────
  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const data = await getMyEventsAPI();
      setEvents(data);
      setError(undefined);
    } catch (err: any) {
      setError(err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────
  // Load workspace events
  // ─────────────────────────────
  const fetchEventsByWorkspace = async (workspaceId: string) => {
    try {
      setLoading(true);
      const data = await getEventsByWorkspaceAPI(workspaceId);
      setEvents(data);
      setError(undefined);
    } catch (err: any) {
      setError(err.message || "Failed to load workspace events");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────
  // Get single event
  // ─────────────────────────────
  const getEvent = async (id: string) => {
    try {
      const event = await getEventAPI(id);
      return event;
    } catch (err: any) {
      setError(err.message || "Failed to load event");
      return null;
    }
  };

  // ─────────────────────────────
  // Create event
  // ─────────────────────────────
  const createEvent = async (payload: {
    title: string;
    start: string | Date;
    end: string | Date;
    workspaceId?: string | null;
    description?: string;
    eventType?: string;
    location?: string;
    recurrence?: EventRecurrence;
  }) => {
    try {
      const newEvent = await createEventAPI(payload);
      setEvents((prev) => [newEvent, ...prev]);
      setError(undefined);
    } catch (err: any) {
      setError(err.message || "Failed to create event");
    }
  };


  // ─────────────────────────────
  // Update event
  // ─────────────────────────────
  const updateEvent = async (
    id: string,
    payload: {
      title?: string;
      start?: string | Date;
      end?: string | Date;
      description?: string;
      eventType?: string;
      location?: string;
      recurrence?: EventRecurrence | null;
    }
  ) => {
    try {
      const updated = await updateEventAPI(id, payload);
      setEvents((prev) =>
        prev.map((e) => (e._id === id ? updated : e))
      );
      setError(undefined);
    } catch (err: any) {
      setError(err.message || "Failed to update event");
    }
  };


  // ─────────────────────────────
  // Delete event
  // ─────────────────────────────
  const deleteEvent = async (id: string) => {
    try {
      await deleteEventAPI(id);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      setError(undefined);
    } catch (err: any) {
      setError(err.message || "Failed to delete event");
    }
  };

  return (
    <EventContext.Provider
      value={{
        events,
        loading,
        error,
        fetchMyEvents,
        fetchEventsByWorkspace,
        getEvent,
        createEvent,
        updateEvent,
        deleteEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

// ─────────────────────────────
// HOOK
// ─────────────────────────────
export const useEvents = () => {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEvents must be used inside EventProvider");
  return ctx;
};
