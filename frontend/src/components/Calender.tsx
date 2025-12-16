import { useState, useMemo, type JSX, useEffect } from "react";
import { useEvents } from "../context/eventContext";
import Swal from "sweetalert2";
import HolidayCalendarModal from "./HolidayCalendarModal"; // adjust the path


type EventType = "meeting" | "deadline" | "reminder" | "other";
type RecurrenceType = "" | "daily" | "weekly" | "monthly" | "yearly";

interface UIEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: EventType;
  description: string;
  recurrence?: RecurrenceType;
}

interface EventPanelProps {
  workspace?: {
    id: string;
    name: string;
    description?: string;
  } | null;
}

export const CalendarPanel: React.FC<EventPanelProps> = ({ workspace = null }) => {
  const { events, loading, fetchMyEvents, fetchEventsByWorkspace, createEvent, updateEvent, deleteEvent } = useEvents();

  const [showCalendar, setShowCalendar] = useState(false);  

  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<UIEvent, "id">>({
    title: "",
    date: "",
    time: "",
    type: "meeting",
    description: "",
    recurrence: "",
  });
  const [editingEvent, setEditingEvent] = useState<UIEvent | null>(null);

  const [viewMode, setViewMode] = useState<"list" | "upcoming">("list");

  // ─────────────────────────────
  // Fetch events
  // ─────────────────────────────
  useEffect(() => {
    if (workspace?.id) {
      fetchEventsByWorkspace(workspace.id);
    } else {
      fetchMyEvents();
    }
  }, [workspace?.id]); // ONLY depend on workspace id


  // ─────────────────────────────
  // Map backend → UI
  // ─────────────────────────────
  const uiEvents: UIEvent[] = useMemo(
    () =>
      events.map((e) => {
        const start = new Date(e.start);
        return {
          id: e._id,
          title: e.title,
          date: start.toISOString().split("T")[0],
          time: start.toTimeString().slice(0, 5),
          type: (e.eventType as EventType) || "other",
          description: e.description || "",
          recurrence: e.recurrence?.frequency || "",
        };
      }),
    [events]
  );

  // ─────────────────────────────
  // Helpers
  // ─────────────────────────────
  const getEventDateTime = (e: UIEvent) => new Date(`${e.date} ${e.time || "00:00"}`).getTime();
  const sortedEvents = useMemo(() => [...uiEvents].sort((a, b) => getEventDateTime(a) - getEventDateTime(b)), [
    uiEvents,
  ]);

  const eventTypes: Record<EventType, { color: string; icon: JSX.Element }> = {
    meeting: { color: "bg-blue-500", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg> },
    deadline: { color: "bg-red-500", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg> },
    reminder: { color: "bg-green-500", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V9c0-3.07-1.63-5.64-4.5-6.32V2h-3v.68C7.63 3.36 6 5.92 6 9v7l-2 2v1h16v-1l-2-2z"/></svg> },
    other: { color: "bg-gray-500", icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 18v-8l-10-5v8l10 5 10-5v-8l-10 5v8z"/></svg> },
  };

  const recurrenceIcons: Record<RecurrenceType, JSX.Element> = {
    "": <></>,

    daily: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.1-.9 2-2 2h-1v2h1c2.21 0 4-1.79 4-4 0-3.31-2.69-6-6-6z" />
      </svg>
    ),

    weekly: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 5h18v2H3V5zm0 4h3v10H3V9zm5 0h3v10H8V9zm5 0h3v10h-3V9zm5 0h3v10h-3V9z" />
      </svg>
    ),

    monthly: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 8h18v13H3V8zm0-2V4h2V2h2v2h10V2h2v2h2v2H3z" />
      </svg>
    ),

    yearly: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4 3h16v2H4V3zm0 4h16v14H4V7zm2 2v10h12V9H6z" />
      </svg>
    ),
  };



  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const upcomingEvents = sortedEvents.filter((e) => getEventDateTime(e) >= todayStart.getTime());
  const visibleEvents = viewMode === "upcoming" ? upcomingEvents : sortedEvents;

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date) return;
    await createEvent({
      title: newEvent.title,
      start: new Date(`${newEvent.date} ${newEvent.time || "00:00"}`),
      end: new Date(`${newEvent.date} ${newEvent.time || "00:00"}`),
      description: newEvent.description,
      eventType: newEvent.type,
      recurrence: newEvent.recurrence ? { frequency: newEvent.recurrence } : undefined,
      workspaceId: workspace?.id ?? null,
    });
    setShowEventModal(false);
    setNewEvent({ title: "", date: "", time: "", type: "meeting", description: "", recurrence: "" });
  };

  const handleEditEvent = async () => {
    if (!editingEvent) return;
    await updateEvent(editingEvent.id, {
      title: editingEvent.title,
      start: new Date(`${editingEvent.date} ${editingEvent.time || "00:00"}`),
      end: new Date(`${editingEvent.date} ${editingEvent.time || "00:00"}`),
      description: editingEvent.description,
      eventType: editingEvent.type,
      recurrence: editingEvent.recurrence ? { frequency: editingEvent.recurrence } : undefined,
    });
    setEditingEvent(null);
    setShowEventModal(false);
  };

  const handleDeleteEvent = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete event?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Delete",
    });
    if (result.isConfirmed) await deleteEvent(id);
  };

  if (loading) return <div className="p-6 text-center">Loading events...</div>;

  return (
    <div className="bg-white w-full h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="p-4 bg-linear-to-r from-indigo-500 via-indigo-700 to-indigo-900 flex items-center justify-center shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-white tracking-tight">Calendar & Events</h2>
      </div>

      <div className="flex justify-end items-center mt-4 mb-4 px-6">
        <button
          onClick={() => setShowCalendar(true)}
          className="px-4 py-2 bg-linear-to-r font-bold from-blue-600 to-blue-900 text-white rounded-lg shadow-md"
        >
          Show Calendar
        </button>
      </div>

      <HolidayCalendarModal
        show={showCalendar}
        onClose={() => setShowCalendar(false)}
      />




      {/* Controls */}
      <div className="flex justify-between items-center mt-4 mb-4 px-6">
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode("list")}
            className={`px-2 py-2 rounded-lg font-medium transition-colors ${
              viewMode === "list" ? "bg-linear-to-r from-indigo-600 via-indigo-800 to-indigo-900 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode("upcoming")}
            className={`px-2 py-2 rounded-lg font-medium transition-colors ${
              viewMode === "upcoming" ? "bg-linear-to-r from-indigo-600 via-indigo-800 to-indigo-900 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Upcoming
          </button>
        </div>
        <button
          onClick={() => {
            setEditingEvent(null);
            setShowEventModal(true);
          }}
          className="px-2 py-2 bg-linear-to-r from-indigo-600 via-indigo-800 to-indigo-900 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md"
        >
          + New Event
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-3 px-6 pb-6 overflow-y-auto max-h-[600px]">
        {visibleEvents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No events found</p>
            <p className="text-sm">Click "New Event" to create one</p>
          </div>
        ) : (
          visibleEvents.map((event) => (
            <div key={event.id} className="p-4 rounded-lg border-l-4 border-b-2 border-indigo-800 bg-indigo-50 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex-1 justify-between items-start">
                <div className="flex gap-3 flex-1 items-center">
                  <div className={`w-10 h-10 ${eventTypes[event.type].color} rounded-lg flex items-center justify-center text-white`}>
                    {eventTypes[event.type].icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{event.title}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(event.date).toLocaleDateString()} {event.time && `• ${event.time}`}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">{event.description}</p>
                    <div className="flex gap-2 mt-1">
                      {event.recurrence && (
                        <div className="flex items-center gap-1 text-gray-600">
                          {recurrenceIcons[event.recurrence]} <span className="text-sm capitalize">{event.recurrence}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-gray-600">
                        {eventTypes[event.type].icon} <span className="text-sm capitalize">{event.type}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center mt-2 text-xs">
                  <div className="ml-auto flex gap-3">
                    <button
                      onClick={() => {
                        setEditingEvent(event);
                        setShowEventModal(true);
                      }}
                      className="text-gray-500 hover:text-gray-800 font-bold"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteEvent(event.id)} 
                      className="text-red-500 hover:text-red-800 font-bold">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Event Modal */}
      {(showEventModal || editingEvent) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl text-center font-bold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-4">
              {editingEvent ? "Edit Event" : "New Event"}
            </h2>

            {/* Title */}
            <label className="text-sm font-semibold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Title
            </label>
            <input
              className="w-full p-3 border border-gray-300 shadow-sm rounded mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Event title..."
              value={editingEvent?.title ?? newEvent.title}
              onChange={(e) =>
                editingEvent
                  ? setEditingEvent({ ...editingEvent, title: e.target.value })
                  : setNewEvent({ ...newEvent, title: e.target.value })
              }
            />

            {/* Date */}
            <label className="text-sm font-semibold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Date (Required)
            </label>
            <input
              type="date"
              className="w-full p-3 border border-gray-300 shadow-sm rounded mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={editingEvent?.date ?? newEvent.date}
              onChange={(e) =>
                editingEvent
                  ? setEditingEvent({ ...editingEvent, date: e.target.value })
                  : setNewEvent({ ...newEvent, date: e.target.value })
              }
            />

            {/* Time */}
            <label className="text-sm font-semibold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Time
            </label>
            <input
              type="time"
              className="w-full p-3 border border-gray-300 shadow-sm rounded mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={editingEvent?.time ?? newEvent.time}
              onChange={(e) =>
                editingEvent
                  ? setEditingEvent({ ...editingEvent, time: e.target.value })
                  : setNewEvent({ ...newEvent, time: e.target.value })
              }
            />

            {/* Description */}
            <label className="text-sm font-semibold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Description
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 shadow-sm rounded mb-2 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="Event description..."
              value={editingEvent?.description ?? newEvent.description}
              onChange={(e) =>
                editingEvent
                  ? setEditingEvent({ ...editingEvent, description: e.target.value })
                  : setNewEvent({ ...newEvent, description: e.target.value })
              }
            />

            {/* Event Type */}
            <label className="text-sm font-semibold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Event Type
            </label>
            <select
              className="w-full p-3 border border-gray-300 shadow-sm rounded mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer transition-all"
              value={editingEvent?.type ?? newEvent.type}
              onChange={(e) =>
                editingEvent
                  ? setEditingEvent({ ...editingEvent, type: e.target.value as EventType })
                  : setNewEvent({ ...newEvent, type: e.target.value as EventType })
              }
            >
              <option value="meeting">Meeting</option>
              <option value="deadline">Deadline</option>
              <option value="reminder">Reminder</option>
              <option value="other">Other</option>
            </select>

            {/* Recurrence */}
            <label className="text-sm font-semibold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Recurrence
            </label>
            <select
              className="w-full p-3 border border-gray-300 shadow-sm rounded mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer transition-all"
              value={editingEvent?.recurrence ?? newEvent.recurrence ?? ""}
              onChange={(e) => {
                editingEvent
                  ? setEditingEvent({ ...editingEvent, recurrence: e.target.value as RecurrenceType })
                  : setNewEvent({ ...newEvent, recurrence: e.target.value as RecurrenceType });
              }}
            >
              <option value="">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setEditingEvent(null);
                }}
                className="flex-1 p-3 border border-gray-300 shadow-sm rounded transition-all hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={editingEvent ? handleEditEvent : handleAddEvent}
                className="flex-1 p-3 bg-linear-to-r from-indigo-600 to-indigo-800 shadow-xl font-bold text-white rounded transition-all hover:brightness-110"
              >
                {editingEvent ? "Save Changes" : "Add Event"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
