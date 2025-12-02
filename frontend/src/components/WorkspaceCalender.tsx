import { useState } from "react";

type EventType = "meeting" | "deadline" | "reminder" | "other";

interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: EventType;
  description: string;
}

export const CalendarPanel = () => {
  const [events, setEvents] = useState<Event[]>([
    { id: "1", title: "Team Standup", date: "2024-12-03", time: "09:00", type: "meeting", description: "Daily team sync" },
    { id: "2", title: "Project Deadline", date: "2024-12-05", time: "17:00", type: "deadline", description: "Submit final deliverables" },
    { id: "3", title: "Client Call", date: "2024-12-04", time: "14:00", type: "meeting", description: "Quarterly review" }
  ]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Omit<Event, "id">>({ title: "", date: "", time: "", type: "meeting", description: "" });
  const [viewMode, setViewMode] = useState<"list" | "upcoming">("list");

  const eventTypes: Record<EventType, { color: string; icon: string }> = {
    meeting: { color: "bg-blue-500", icon: "👥" },
    deadline: { color: "bg-red-500", icon: "⏰" },
    reminder: { color: "bg-green-500", icon: "🔔" },
    other: { color: "bg-gray-500", icon: "📌" }
  };

  const handleAddEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date) return;
    const event: Event = { id: Date.now().toString(), ...newEvent };
    setEvents([...events, event].sort((a, b) => new Date(a.date + " " + a.time).getTime() - new Date(b.date + " " + b.time).getTime()));
    setNewEvent({ title: "", date: "", time: "", type: "meeting", description: "" });
    setShowEventModal(false);
  };

  const handleEditEvent = () => {
    if (!editingEvent) return;
    setEvents(events.map(e => e.id === editingEvent.id ? editingEvent : e)
      .sort((a, b) => new Date(a.date + " " + a.time).getTime() - new Date(b.date + " " + b.time).getTime()));
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const upcomingEvents = events.filter(e => new Date(e.date).getTime() >= new Date().setHours(0, 0, 0, 0));

  return (
    <div className="bg-white w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-linear-to-r from-indigo-600 via-indigo-700 to-indigo-800 flex items-center justify-center shadow-xl border-b border-indigo-600">
        <h2 className="text-3xl font-bold text-center text-white tracking-tight">Calendar & Events</h2>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mt-4 mb-4 px-6">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === "list" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode("upcoming")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === "upcoming" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            Upcoming
          </button>
        </div>
        <button
          onClick={() => setShowEventModal(true)}
          className="px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md"
        >
          + New Event
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-3 px-6 pb-6 overflow-y-auto max-h-[600px]">
        {(viewMode === "upcoming" ? upcomingEvents : events).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium">No events found</p>
            <p className="text-sm">Click "New Event" to create one</p>
          </div>
        ) : (
          (viewMode === "upcoming" ? upcomingEvents : events).map(event => (
            <div key={event.id} className="p-4 rounded-lg border-l-4 border-indigo-500 bg-indigo-50 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex gap-3 flex-1">
                  <div className={`w-10 h-10 ${eventTypes[event.type].color} rounded-lg flex items-center justify-center text-white text-xl shrink-0`}>
                    {eventTypes[event.type].icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{event.title}</h3>
                    <div className="flex gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      {event.time && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {event.time}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-2">{event.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingEvent(event)} 
                    className="text-gray-600 hover:text-indigo-600 transition-colors p-1"
                    title="Edit event"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDeleteEvent(event.id)} 
                    className="text-gray-600 hover:text-red-600 transition-colors p-1"
                    title="Delete event"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Event Modal */}
      {(showEventModal || editingEvent) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">{editingEvent ? "Edit Event" : "New Event"}</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  placeholder="Enter event title..."
                  value={editingEvent ? editingEvent.title : newEvent.title}
                  onChange={(e) => editingEvent ? setEditingEvent({...editingEvent, title: e.target.value}) : setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={editingEvent ? editingEvent.date : newEvent.date}
                  onChange={(e) => editingEvent ? setEditingEvent({...editingEvent, date: e.target.value}) : setNewEvent({...newEvent, date: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={editingEvent ? editingEvent.time : newEvent.time}
                  onChange={(e) => editingEvent ? setEditingEvent({...editingEvent, time: e.target.value}) : setNewEvent({...newEvent, time: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select
                  value={editingEvent ? editingEvent.type : newEvent.type}
                  onChange={(e) => editingEvent ? setEditingEvent({...editingEvent, type: e.target.value as EventType}) : setNewEvent({...newEvent, type: e.target.value as EventType})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Deadline</option>
                  <option value="reminder">Reminder</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Add event description..."
                  value={editingEvent ? editingEvent.description : newEvent.description}
                  onChange={(e) => editingEvent ? setEditingEvent({...editingEvent, description: e.target.value}) : setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => {setShowEventModal(false); setEditingEvent(null);}} 
                className="flex-1 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={editingEvent ? handleEditEvent : handleAddEvent} 
                className="flex-1 p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-md"
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
