import React, { useState, useEffect } from "react";
import Sidebar from "../Navigation/Sidebar";
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");

  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      const token = sessionStorage.getItem('session_token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Changed the URL to fetch non-archived tasks
      const response = await fetch('http://localhost/lifely1.0/backend/api/tasks.php', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        // Filter out archived tasks and sort the remaining ones
        const nonArchivedTasks = (data.tasks || [])
          .filter(task => !task.is_archived)
          .sort((a, b) => {
            // Sort by priority first
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;
            
            // Then by reminder date if exists
            const dateA = a.reminder_date ? new Date(a.reminder_date) : new Date(9999, 11, 31);
            const dateB = b.reminder_date ? new Date(b.reminder_date) : new Date(9999, 11, 31);
            return dateA - dateB;
          });

        setTasks(nonArchivedTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  };

  // Function to filter and organize tasks
  const getFilteredTasks = () => {
    const now = new Date();
    let filtered = tasks;
    
    // Only apply search filter if query is valid (2 or more characters)
    if (searchQuery.trim().length >= 2) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.list_type.toLowerCase().includes(query) ||
        task.priority.toLowerCase().includes(query)
      );
    }
    
    // Then apply status filter
    switch (filter) {
      case "upcoming":
        return filtered.filter(task => {
          if (task.is_completed) return false;
          if (!task.reminder_date) return true;
          const reminderDate = new Date(task.reminder_date);
          return reminderDate >= now;
        });
        
      case "overdue":
        return filtered.filter(task => {
          if (task.is_completed || !task.reminder_date) return false;
          const reminderDate = new Date(task.reminder_date);
          return reminderDate < now;
        });
        
      case "completed":
        return filtered.filter(task => task.is_completed);
        
      default:
        return filtered;
    }
  };

  // Get task count for each category
  const getTaskCounts = () => {
    const now = new Date();
    
    return {
      upcoming: tasks.filter(task => {
        if (task.is_completed) return false;
        if (!task.reminder_date) return true;
        return new Date(task.reminder_date) >= now;
      }).length,
      overdue: tasks.filter(task => {
        if (task.is_completed || !task.reminder_date) return false;
        return new Date(task.reminder_date) < now;
      }).length,
      completed: tasks.filter(task => task.is_completed).length
    };
  };

  useEffect(() => {
    fetchTasks();
    // Set up auto-refresh every minute to update overdue status
    const interval = setInterval(fetchTasks, 60000);
    return () => clearInterval(interval);
  }, []);

  // Get filtered tasks and counts
  const filteredTasks = getFilteredTasks();
  const taskCounts = getTaskCounts();

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

  // Add search validation function
  const handleSearchChange = (e) => {
    const value = e.target.value;
    
    // Clear error when input is empty
    if (value === "") {
      setSearchQuery("");
      setSearchError("");
      return;
    }
    
    // Validate input length
    if (value.length < 2) {
      setSearchError("Search must be at least 2 characters");
    } else if (value.length > 50) { // Maximum 50 characters
      setSearchError("Search cannot exceed 50 characters");
      return;
    } else {
      setSearchError("");
    }
    
    setSearchQuery(value);
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
        {/* Title and Search Section */}
        <div className="flex justify-between items-center mb-10">
          {/* Title Section */}
          <div className="text-left font-poppins">
            <h1 className="font-bold text-3xl">Good Day, {user?.username || 'User'}!</h1>
            <p className="font-bold text-xl text-[#FFB78B]">
              What's your plan for today?
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              maxLength={50} // Hard limit on input length
              className={`w-full pl-10 pr-4 py-2 rounded-full border ${
                searchError ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:border-gray-400 focus:ring-0`}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg
                className={`w-5 h-5 ${searchError ? 'text-red-500' : 'text-gray-400'}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchError && (
              <div className="absolute -bottom-6 left-0 text-red-500 text-xs">
                {searchError}
              </div>
            )}
          </div>
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
                Upcoming ({taskCounts.upcoming})
              </span>
              <span
                className={`cursor-pointer pb-2 hover:border-b-4 hover:border-[#808080] ${filter === "overdue" ? "border-b-4 border-[#808080]" : ""}`}
                onClick={() => setFilter("overdue")}
              >
                Overdue ({taskCounts.overdue})
              </span>
              <span
                className={`cursor-pointer pb-2 hover:border-b-4 hover:border-[#808080] ${filter === "completed" ? "border-b-4 border-[#808080]" : ""}`}
                onClick={() => setFilter("completed")}
              >
                Completed ({taskCounts.completed})
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

          {/* Task List */}
          <div className="space-y-2">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {filter === "upcoming" && "No upcoming tasks"}
                {filter === "overdue" && "No overdue tasks"}
                {filter === "completed" && "No completed tasks"}
              </div>
            ) : (
              filteredTasks.map((task) => (
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
                    <span className={`text-sm ${
                      filter === "overdue" ? "text-red-500 font-medium" : "text-gray-600"
                    }`}>
                      {task.reminder_date ? 
                        new Date(task.reminder_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 
                        "No reminder"
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
