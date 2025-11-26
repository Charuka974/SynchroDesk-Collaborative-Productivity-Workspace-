import { useState, useEffect } from "react"
// import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/authContext"

export default function SynchroDeskDashboard() {

  // const navigate = useNavigate()

  const [tasks, setTasks] = useState([
    { id: 1, title: "Design project wireframe", dueDate: "2025-11-20", status: "In Progress", priority: "high", assignedTo: "You" },
    { id: 2, title: "Team meeting preparation", dueDate: "2025-11-18", status: "Pending", priority: "medium", assignedTo: "You" },
    { id: 3, title: "Review pull requests", dueDate: "2025-11-17", status: "Done", priority: "low", assignedTo: "You" },
    { id: 4, title: "Update documentation", status: "Pending", priority: "medium", assignedTo: "Team" },
  ])

  const [events, setEvents] = useState([
    { id: 1, title: "Sprint Planning", date: "2025-11-18", time: "10:00 AM", type: "meeting" },
    { id: 2, title: "Client Call", date: "2025-11-19", time: "2:00 PM", type: "call" },
    { id: 3, title: "Project Deadline", date: "2025-11-22", time: "EOD", type: "deadline" },
  ])

  const [notes, setNotes] = useState("")
  const [savedNotes, setSavedNotes] = useState([
    { id: 1, content: "Remember to follow up with design team", timestamp: "2025-11-15 09:30" },
    { id: 2, content: "API integration needs testing", timestamp: "2025-11-14 14:20" },
  ])

  const [newTask, setNewTask] = useState("")
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")

  // Mock user data
  const { user, setUser } = useAuth()

  const handleSaveNote = () => {
    if (notes.trim()) {
      const newNote = {
        id: Date.now(),
        content: notes,
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ')
      }
      setSavedNotes([newNote, ...savedNotes])
      setNotes("")
      alert("Note saved!")
    }
  }

  const handleAddTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        title: newTask,
        status: "Pending",
        priority: "medium",
        assignedTo: "You"
      }
      setTasks([...tasks, task])
      setNewTask("")
      setShowTaskModal(false)
    }
  }

  // const handleLogout = () => {
  //   setUser(null)
  //   localStorage.removeItem("accessToken")
  //   localStorage.removeItem("refreshToken")
  //   navigate("/login")
  // }

  const getTaskStats = () => {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === "Pending").length,
      inProgress: tasks.filter(t => t.status === "In Progress").length,
      done: tasks.filter(t => t.status === "Done").length,
    }
  }

  const stats = getTaskStats()

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === "all") return true
    return task.status === activeFilter
  })

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* <Sidebar /> */}

      {/* Main Content */}
      <main className="p-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}</h1>
            <p className="text-gray-600 mt-1">Here's what's happening today</p>

          </div>
          {/* <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-2 border border-gray-200">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user.avatar ?? user.name?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              Logout
            </button>
          </div> */}
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Total Tasks</span>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">All tasks</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Pending</span>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
            <p className="text-xs text-gray-500 mt-1">Need attention</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">In Progress</span>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
            <p className="text-xs text-gray-500 mt-1">Active now</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Completed</span>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.done}</p>
            <p className="text-xs text-gray-500 mt-1">This week</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks Panel */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Tasks</h2>
              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Task
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 border-b border-gray-200">
              {["all", "Pending", "In Progress", "Done"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
                    activeFilter === filter
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {filter === "all" ? "All" : filter}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    task.status === "Done"
                      ? "bg-green-50 border-green-500"
                      : task.status === "In Progress"
                      ? "bg-purple-50 border-purple-500"
                      : "bg-yellow-50 border-yellow-500"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <input type="checkbox" checked={task.status === "Done"} className="w-4 h-4 rounded" readOnly />
                        <h3 className={`font-semibold ${task.status === "Done" ? "line-through text-gray-500" : "text-gray-900"}`}>
                          {task.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        {task.dueDate && (
                          <span className="flex items-center gap-1 text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {task.dueDate}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          task.priority === "high" ? "bg-red-100 text-red-700" :
                          task.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-gray-600">{task.assignedTo}</span>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 bg-linear-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{event.date} at {event.time}</p>
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
                className="mt-3 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
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

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Task</h2>
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Task title..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTaskModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}