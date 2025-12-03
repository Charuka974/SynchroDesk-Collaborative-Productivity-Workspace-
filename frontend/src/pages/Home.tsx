import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { AIAssistant } from "../components/AiAssistant";
import { AIProvider } from "../context/aiContext";
import { TaskPanel } from "../components/Tasks";
import { TaskProvider, useTasks, type ICreateTaskPayload } from "../context/taskContext";
// import { useNavigate } from "react-router-dom";

export default function SynchroDeskDashboard() {
  const { user } = useAuth();
  // const navigate = useNavigate();


  // const handleNavigation = (navipath: string) => {
  //   navigate(navipath);
  // };

  // Tasks functions
  // const [activeFilter, setActiveFilter] = useState("Pending");
  // const { tasks, loadPersonalTasks, changeStatus, createTask, updateTask } = useTasks();
  // const refreshTasks = () => loadPersonalTasks();
  // useEffect(() => {
  //   loadPersonalTasks();
  // }, [loadPersonalTasks]);

  const DashboardTasks = () => {
    const { tasks, loadPersonalTasks, changeStatus, updateTask, createTask } = useTasks();
    const [activeFilter, setActiveFilter] = useState("Pending");

    // Load personal tasks (assigned to me)
    useEffect(() => {
      loadPersonalTasks();
    }, []);   //  Only load once

    const refreshTasks = () => loadPersonalTasks();

    const createTaskNoWorkspace = async (task: Omit<ICreateTaskPayload, "workspaceId">) => {
      await createTask(task);  // dashboard tasks are personal
      refreshTasks();
    };

    return (
      <TaskPanel
        tasks={tasks}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        createTask={createTaskNoWorkspace}
        updateTask={updateTask}
        changeStatus={changeStatus}
        refreshTasks={refreshTasks}
      />
    );
  };

  

  const [events] = useState([
    { id: 1, title: "Sprint Planning", date: "2025-11-18", time: "10:00 AM", type: "meeting" },
    { id: 2, title: "Client Call", date: "2025-11-19", time: "2:00 PM", type: "call" },
    { id: 3, title: "Project Deadline", date: "2025-11-22", time: "EOD", type: "deadline" },
  ]);

  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState([
    { id: 1, content: "Remember to follow up with design team", timestamp: "2025-11-15 09:30" },
    { id: 2, content: "API integration needs testing", timestamp: "2025-11-14 14:20" },
  ]);

  
  const handleSaveNote = () => {
    if (!notes.trim()) return;
    const newNote = {
      id: Date.now(),
      content: notes,
      timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    setSavedNotes([newNote, ...savedNotes]);
    setNotes("");
    alert("Note saved!");
  };


  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <main className="p-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">Welcome back, {user.name}</h1>
            <p className="font-semibold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent mt-1">Here's what's happening today</p>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[65%_30%] gap-6">

          {/* Left Column */}
          <div className="space-y-6 rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200">
            {/* Tasks Panel */}
            {/* <TaskPanel
              tasks={tasks}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              createTask={createTask}
              updateTask={updateTask}
              changeStatus={changeStatus}
              refreshTasks={refreshTasks}
            /> */}
            <TaskProvider>
              <DashboardTasks />
            </TaskProvider>
          </div>

          {/* Right Column */}
          <div className="space-y-6 rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200">
            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Upcoming Events</h2>
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 bg-linear-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl border-b border-slate-600 font-bold text-white rounded-lg flex items-center justify-center shrink-0">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {event.date} at {event.time}
                        </p>
                        <span className="inline-block mt-2 px-2 py-1 bg-white rounded text-xs font-medium text-indigo-600">
                          {event.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Notes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Notes</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Write a quick note..."
              />
              <button
                onClick={handleSaveNote}
                className="mt-3 w-full px-4 py-2 bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl border-b border-slate-600 font-bold text-white rounded-lg transition"
              >
                Save Note
              </button>

              {savedNotes.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700">Recent Notes</h3>
                  {savedNotes.slice(0, 2).map((note) => (
                    <div key={note.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                      <p className="text-gray-700">{note.content}</p>
                      <p className="text-xs text-gray-500 mt-1">{note.timestamp}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* AI Assistant */}
      <AIProvider>
        <AIAssistant />
      </AIProvider>

    </div>
  );
}
