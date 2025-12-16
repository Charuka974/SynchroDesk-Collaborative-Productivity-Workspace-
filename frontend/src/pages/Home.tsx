import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { AIAssistant } from "../components/AiAssistant";
import { AIProvider } from "../context/aiContext";
import { TaskPanel } from "../components/Tasks";
import { TaskProvider, useTasks, type ICreateTaskPayload } from "../context/taskContext";
import { NotesProvider } from "../context/noteContext";
import { NotesPanel } from "../components/Notes";
import { EventProvider } from "../context/eventContext";
import { CalendarPanel } from "../components/Calender";
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
    const { tasks, loadPersonalTasks, changeStatus, updateTask, createTask, deleteTask } = useTasks();
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
        deleteTask={deleteTask}
      />
    );
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
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-3">

          {/* Left Column */}
          <div className="space-y-6 h-[1200px] overflow-y-auto p-1">
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

            <div className="h-150 overflow-y-auto space-y-6 border shadow-xl border-gray-200 rounded-xl">
              <TaskProvider>
                <DashboardTasks />
              </TaskProvider>
            </div>

            {/* Quick Notes */}
            <div className="flex-1 overflow-y-auto space-y-6 border shadow-xl border-gray-200 rounded-xl">
              <NotesProvider>
                <NotesPanel workspace={null}/>
              </NotesProvider>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 rounded-xl overflow-hidden shadow-xl mt-1 lg:mt-1 lg:col-start-2 w-full max-w-full lg:self-start">
            <EventProvider>
              <CalendarPanel workspace={null} />
            </EventProvider>
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
