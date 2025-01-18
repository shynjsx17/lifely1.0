import React, { useState, useEffect } from "react";
import Sidebar from "../Navigation/Sidebar";
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("upcoming");

  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      const token = sessionStorage.getItem('session_token');
      const response = await fetch('http://localhost/lifely1.0/backend/api/tasks.php?archived=false', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleTask = async (taskId, completed) => {
    try {
      const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?id=${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
        },
        body: JSON.stringify({
          is_completed: !completed
        })
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-[60px]" : "ml-[240px]"
        } p-8 bg-system-background bg-no-repeat bg-fixed`}
      >
        {/* Title Section */}
        <div className="text-left mb-10 font-poppins">
          <h1 className="font-bold text-3xl">Good Day, {user?.username || 'User'}!</h1>
          <p className="font-bold text-xl text-[#FFB78B]">
            What's your plan for today?
          </p>
        </div>

        {/* Task Section */}
        <div className="w-full bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Your Task for Today:</h3>
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <div className="flex space-x-8 text-[#808080] text-sm font-medium">
              <span
                className={`cursor-pointer pb-2 hover:border-b-4 hover:border-[#808080] ${filter === "upcoming" ? "border-b-4 border-[#808080]" : ""}`}
                onClick={() => setFilter("upcoming")}
              >
                Upcoming
              </span>
              <span
                className={`cursor-pointer pb-2 hover:border-b-4 hover:border-[#808080] ${filter === "overdue" ? "border-b-4 border-[#808080]" : ""}`}
                onClick={() => setFilter("overdue")}
              >
                Overdue
              </span>
              <span
                className={`cursor-pointer pb-2 hover:border-b-4 hover:border-[#808080] ${filter === "completed" ? "border-b-4 border-[#808080]" : ""}`}
                onClick={() => setFilter("completed")}
              >
                Completed
              </span>
            </div>
          </div>

          {/* Task List Header */}
          <div className="grid grid-cols-12 gap-4 px-4 mb-2 text-sm font-medium text-gray-500">
            <div className="col-span-4">Task</div>
            <div className="col-span-2 text-center">Reminder Date</div>
            <div className="col-span-3 text-center">Priority Tags</div>
            <div className="col-span-3 text-center">List</div>
          </div>

          <div className="space-y-2">
            {tasks
              .filter((task) => {
                if (filter === "completed") return task.is_completed;
                if (filter === "overdue") {
                  const reminderDate = task.reminder_date ? new Date(task.reminder_date) : null;
                  return reminderDate && reminderDate < new Date() && !task.is_completed;
                }
                return !task.is_completed;
              })
              .map((task) => (
                <div key={task.id} className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-gray-50 rounded-lg">
                  <div className="col-span-4 flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={task.is_completed}
                      onChange={() => handleToggleTask(task.id, task.is_completed)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
                    />
                    <label
                      className={`text-gray-700 cursor-pointer ${task.is_completed ? "line-through text-gray-400" : ""}`}
                    >
                      {task.title}
                    </label>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-gray-600">
                      {task.reminder_date ? 
                        new Date(task.reminder_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 
                        "No reminder date"
                      }
                    </span>
                  </div>
                  <div className="col-span-3 text-center">
                    <span className={`px-4 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                    </span>
                  </div>
                  <div className="col-span-3 text-center text-gray-600">
                    {task.list_type.charAt(0).toUpperCase() + task.list_type.slice(1)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
