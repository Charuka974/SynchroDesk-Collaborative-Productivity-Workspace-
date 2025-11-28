import { useState } from "react"

export default function FloatingActionButtons() {
  const [open, setOpen] = useState(false)

  const handleAIAssistant = () => {
    // Navigate to AI Assistant or open modal
    console.log("Opening AI Assistant...")
    setOpen(false)
  }

  const handleSupport = () => {
    // Navigate to support or open chat
    console.log("Opening Support...")
    setOpen(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Expanded Buttons */}
        {open && (
          <div className="flex flex-col gap-3 mb-2">
            {/* Quick Note Button */}
            <button
              onClick={() => {
                console.log("Quick Note")
                setOpen(false)
              }}
              className="group flex items-center gap-3 px-5 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-full shadow-lg border border-gray-200 transition-all transform hover:scale-105 active:scale-95"
            >
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center group-hover:bg-yellow-200 transition">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <span className="text-sm font-medium pr-2">Quick Note</span>
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={handleAIAssistant}
              className="group flex items-center gap-3 px-5 py-3 bg-linear-to-r from-gray-900 to-gray-600 hover:from-gray-700 hover:to-gray-300 text-white rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95"
            >
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="text-sm font-medium pr-2">AI Assistant</span>
            </button>

            {/* New Task Button */}
            <button
              onClick={() => {
                console.log("New Task")
                setOpen(false)
              }}
              className="group flex items-center gap-3 px-5 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-full shadow-lg border border-gray-200 transition-all transform hover:scale-105 active:scale-95"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-sm font-medium pr-2">New Task</span>
            </button>

            {/* Support Button */}
            <button
              onClick={handleSupport}
              className="group flex items-center gap-3 px-5 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-full shadow-lg border border-gray-200 transition-all transform hover:scale-105 active:scale-95"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium pr-2">Help & Support</span>
            </button>
          </div>
        )}

        {/* Main Toggle Button */}
        <button
          onClick={() => setOpen(!open)}
          className={`w-15 h-15 rounded-full shadow-2xl flex items-center justify-center text-white transition-all transform hover:scale-110 active:scale-95 relative ${
            open 
              ? "bg-gray-600 hover:bg-gray-700 rotate-45" 
              : "bg-linear-to-br from-gray-900 to-gray-600 hover:from-gray-700 hover:to-gray-300"
          }`}
        >
          {open ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}

          {/* Notification Badge When Closed */}
          {/* {!open && (
            <>
              <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 rounded-full bg-red-500 items-center justify-center text-xs font-bold">
                2
              </span>
              <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 rounded-full bg-red-400 opacity-75 animate-ping"></span>
            </>
          )} */}
        </button>

        {/* Tooltip when closed */}
        {!open && (
          <div className="absolute bottom-20 right-0 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Quick Actions
            <div className="absolute -bottom-1 right-6 w-2 h-2 bg-gray-900 transform rotate-45"></div>
          </div>
        )}
    </div>
  )
}