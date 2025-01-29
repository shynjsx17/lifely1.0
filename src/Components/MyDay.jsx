import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../Navigation/Sidebar";
import { FaSun, FaEllipsisV, FaTimes } from 'react-icons/fa';
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

// Add generateDate function
const generateDate = (month = dayjs().month(), year = dayjs().year()) => {
  const firstDateOfMonth = dayjs().year(year).month(month).startOf('month');
  const lastDateOfMonth = dayjs().year(year).month(month).endOf('month');

  const arrayOfDate = [];

  // Create prefix dates
  for (let i = 0; i < firstDateOfMonth.day(); i++) {
    const date = firstDateOfMonth.subtract(firstDateOfMonth.day() - i, 'day');
    arrayOfDate.push({
      currentMonth: false,
      date,
    });
  }

  // Generate current dates
  for (let i = 1; i <= lastDateOfMonth.date(); i++) {
    arrayOfDate.push({
      currentMonth: true,
      date: dayjs().year(year).month(month).date(i),
      today: dayjs().year(year).month(month).date(i).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD'),
    });
  }

  // Fill remaining dates
  const remaining = 42 - arrayOfDate.length;
  for (let i = 1; i <= remaining; i++) {
    const date = lastDateOfMonth.add(i, 'day');
    arrayOfDate.push({
      currentMonth: false,
      date,
    });
  }

  return arrayOfDate;
};

const MyDay = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showTaskListPopup, setShowTaskListPopup] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [newTask, setNewTask] = useState("");
  const [editingTaskIndex, setEditingTaskIndex] = useState(null);
  const [editingTaskText, setEditingTaskText] = useState("");
  const [selectedList, setSelectedList] = useState("personal");
  const [selectedTag, setSelectedTag] = useState("low");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [taskNote, setTaskNote] = useState("");
  const popupRef = useRef(null);
  const dropdownRef = useRef([]);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const listDropdownRef = useRef(null);
  const priorityDropdownRef = useRef(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  // Add missing state variables for calendar
  const [currentMonth, setCurrentMonth] = useState(dayjs().month());
  const [currentYear, setCurrentYear] = useState(dayjs().year());
  const [taskError, setTaskError] = useState("");

  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      const token = sessionStorage.getItem('session_token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

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
      console.log('Response data:', data); // Debug log
      
      if (data.success) {
        // Filter and sort tasks
        const nonArchivedTasks = (data.tasks || [])
          .filter(task => !task.is_archived)
          .sort((a, b) => {
            // Sort by priority first
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;
            
            // Then by completion status
            if (a.is_completed !== b.is_completed) {
              return a.is_completed ? 1 : -1;
            }
            
            // Finally by creation date
            return new Date(b.created_at) - new Date(a.created_at);
          });

        setTasks(nonArchivedTasks);
        console.log('Setting tasks:', nonArchivedTasks); // Debug log
      } else {
        console.error('Failed to fetch tasks:', data.message);
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add this useEffect to log tasks state changes
  useEffect(() => {
    console.log('Current tasks state:', tasks);
  }, [tasks]);

  // Add task with better error handling
  const handleAddTask = async () => {
    // Validate task length
    if (!newTask.trim()) {
      setTaskError("Task cannot be empty");
      return;
    }
    
    if (newTask.length > 50) {
      setTaskError("Task cannot exceed 50 characters");
      return;
    }

    try {
      const token = sessionStorage.getItem('session_token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const taskData = {
        title: newTask.trim(),
        list_type: selectedList,
        priority: selectedTag.toLowerCase().replace(' priority', ''),
        description: '',
        is_archived: false,
        reminder_date: null
      };

      const response = await fetch('http://localhost/lifely1.0/backend/api/tasks.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchTasks();
        setNewTask("");
        setTaskError("");
        setShowPopup(false);
      } else {
        console.error('Failed to add task:', data.message);
        setTaskError("Failed to add task. Please try again.");
      }
    } catch (error) {
      console.error('Error adding task:', error);
      setTaskError("An error occurred. Please try again.");
    }
  };

  const handleEditTask = async (taskId, text) => {
    try {
      setSelectedTaskId(taskId);
      setEditingTaskText(text);
      // Set the note for the selected task
      const selectedTask = tasks.find(t => t.id === taskId);
      setTaskNote(selectedTask?.note || '');

      // Fetch subtasks for the selected task
      const token = sessionStorage.getItem('session_token');
      const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?subtasks&task_id=${taskId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSubtasks(data.subtasks || []);
        }
      }

      setShowTaskListPopup(true);
    } catch (error) {
      console.error('Error fetching subtasks:', error);
      setSubtasks([]);
    }
  };

  const handleSaveTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?id=${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
        },
        body: JSON.stringify({
          title: editingTaskText
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchTasks();
        setSelectedTaskId(null);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleToggleTask = async (taskId, completed) => {
    try {
      const token = sessionStorage.getItem('session_token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?id=${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          is_completed: !completed,
          completed_at: !completed ? new Date().toISOString() : null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        await fetchTasks();
      } else {
        console.error('Failed to toggle task completion:', data.message);
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const token = sessionStorage.getItem('session_token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?id=${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        await fetchTasks();
      } else {
        console.error('Failed to delete task:', data.message);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleArchiveTask = async (taskId) => {
    try {
      const token = sessionStorage.getItem('session_token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?id=${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          is_archived: true,
          archived_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        await fetchTasks();
      } else {
        console.error('Failed to archive task:', data.message);
      }
    } catch (error) {
      console.error('Error archiving task:', error);
    }
  };

  const handlePinTask = async (taskId, isPinned) => {
    try {
      console.log('Pinning task:', taskId, 'Current pin status:', isPinned); // Debug log
      const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?id=${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
        },
        body: JSON.stringify({
          is_pinned: !isPinned
        })
      });

      const data = await response.json();
      console.log('Pin response:', data); // Debug log

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error toggling pin status:', error);
    }
  };

  const handleUpdateTaskList = async (taskId, newListType) => {
    try {
      // First close the task view popup and reset all states
      handleCloseTaskPopup();
      setShowListDropdown(false);
      setDropdownIndex(null);
      
      const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?id=${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
        },
        body: JSON.stringify({
          list_type: newListType.toLowerCase()
        })
      });

      if (response.ok) {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task list:', error);
    }
  };

  const handleUpdatePriority = async (taskId, newPriority) => {
    try {
      const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?id=${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
        },
        body: JSON.stringify({
          priority: newPriority.toLowerCase()
        })
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const handleSaveNote = async (taskId) => {
    try {
      const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?id=${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
        },
        body: JSON.stringify({
          note: taskNote
        })
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleUpdateDueDate = async (taskId, date) => {
    try {
      const formattedDate = dayjs(date).format('YYYY-MM-DD');
      const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?id=${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
        },
        body: JSON.stringify({
          reminder_date: formattedDate
        })
      });

      if (response.ok) {
        await fetchTasks();
        setShowDatePicker(false);
      }
    } catch (error) {
      console.error('Error updating due date:', error);
    }
  };

  // Format the date in the desired format (e.g., 'Wednesday, December 11, 2024')
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDropdownToggle = (index) => {
    // Toggle the dropdown for the clicked task
    setDropdownIndex(dropdownIndex === index ? null : index);
  };

  const handleTaskListChange = (index) => {
    setShowTaskListPopup(true);
  };
  
  const handleAddSubtask = async () => {
    if (!newSubtask.trim() || !selectedTaskId) {
      return;
    }

    try {
      const token = sessionStorage.getItem('session_token');
      const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?subtask=true&task_id=${selectedTaskId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newSubtask.trim(),
          task_id: selectedTaskId
        })
      });

      const data = await response.json();
      console.log('Add subtask response:', data); // Debug log
      if (data.success) {
        // Update the local subtasks state with the new subtask
        setSubtasks(prevSubtasks => [...prevSubtasks, {
          id: data.subtask_id,
          title: newSubtask.trim(),
          is_completed: false
        }]);
        setNewSubtask('');
      }
    } catch (error) {
      console.error('Error adding subtask:', error);
    }
  };

  const handleToggleSubtask = async (subtaskId) => {
    try {
      const token = sessionStorage.getItem('session_token');
      const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?subtask&id=${subtaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Update the local state immediately for better UX
        setSubtasks(prevSubtasks => 
          prevSubtasks.map(subtask => 
            subtask.id === subtaskId 
              ? { ...subtask, is_completed: !subtask.is_completed }
              : subtask
          )
        );
      }
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  const fetchSubtasks = async (taskId) => {
    try {
      const token = sessionStorage.getItem('session_token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?subtasks&task_id=${taskId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setSubtasks(data.subtasks);
      } else {
        console.error('Failed to fetch subtasks:', data.message);
        setSubtasks([]);
      }
    } catch (error) {
      console.error('Error fetching subtasks:', error);
      setSubtasks([]);
    }
  };

  // Add useEffect to fetch subtasks when a task is selected
  useEffect(() => {
    if (selectedTaskId) {
      fetchSubtasks(selectedTaskId);
    } else {
      setSubtasks([]);
    }
  }, [selectedTaskId]);

  const handleKeyPress = (e, index) => {
    if (e.key === "Enter") {
      handleSaveTask(index);
    }
  };

  const formatDate = (date) => {
    const options = { 
      year: "numeric", 
      month: "long", 
      day: "numeric", 
      timeZone: "Asia/Manila" 
    };
    return new Intl.DateTimeFormat("en-PH", options).format(date);
  };

  // Add click outside handler
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000); // Update every second

    // Close popup when clicking outside of it
    const handleClickOutside = (event) => {
      // Close the list and tag popup if clicked outside
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }

      // Close the task dropdown if clicked outside
      if (dropdownRef.current && dropdownRef.current.length > 0) {
        const outsideDropdown = dropdownRef.current.every(
          (dropdown) => dropdown && dropdown.contains && !dropdown.contains(event.target)
        );

        if (outsideDropdown) {
          setDropdownIndex(null); // Close all dropdowns
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the interval and event listener on component unmount
    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (listDropdownRef.current && !listDropdownRef.current.contains(event.target)) {
        setShowListDropdown(false);
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target)) {
        setShowPriorityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    
    if (value === "") {
      setSearchQuery("");
      setSearchError("");
      return;
    }
    
    if (value.length < 2) {
      setSearchError("Search must be at least 2 characters");
    } else if (value.length > 50) {
      setSearchError("Search cannot exceed 50 characters");
      return;
    } else {
      setSearchError("");
    }
    
    setSearchQuery(value);
  };

  const getFilteredTasks = () => {
    let filtered = tasks;
    
    if (searchQuery.trim().length >= 2) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.list_type.toLowerCase().includes(query) ||
        task.priority.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  // Reset all states related to task view
  const handleCloseTaskPopup = () => {
    setShowTaskListPopup(false);
    setSelectedTaskId(null);
    setTaskNote('');
    setSubtasks([]);
    setNewSubtask('');
    setShowDatePicker(false);
    setShowListDropdown(false);
    setShowPriorityDropdown(false);
    setDropdownIndex(null);
    setEditingTaskIndex(null);
    setEditingTaskText('');
  };

  // Update the input change handler
  const handleTaskInputChange = (e) => {
    const value = e.target.value;
    
    if (value.length > 50) {
      setTaskError("Task cannot exceed 50 characters");
    } else {
      setTaskError("");
    }
    
    setNewTask(value);
  };

  return (
    <div className="flex h-screen flex-col">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-[60px]" : "ml-[240px]"
        } p-4 md:p-8 bg-system-background bg-no-repeat bg-fixed flex flex-col`}
      >
        {/* Title and Search Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 space-y-4 md:space-y-0">
          {/* Title Section */}
          <div className="text-left font-poppins w-full md:w-auto">
            <h1 className="font-bold text-2xl md:text-3xl">Good Day, {user?.username || 'User'}!</h1>
            <p className="font-bold text-lg md:text-xl text-[#FFB78B]">
              What's your plan for today?
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              maxLength={50}
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

        {/* Date Display */}
        <div className="flex items-center justify-center bg-white shadow-md rounded-lg p-4 md:p-6 mb-4 md:mb-6 mx-2 md:mx-40">
          <FaSun className="text-2xl md:text-3xl mr-3 md:mr-4" />
          <span className="text-xl md:text-3xl font-semibold text-gray-800">
            {formattedDate}
          </span>
        </div>

        {/* Task List */}
        <div className="space-y-3 md:space-y-4 mb-4 md:mb-6 flex-grow overflow-y-auto">
          {getFilteredTasks().map((task, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white shadow-md rounded-lg p-3 md:p-4 mx-2 md:mx-40 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start flex-1">
                {/* Checkbox */}
                <div className="flex items-center justify-center mr-4">
                  <input
                    type="checkbox"
                    checked={task.is_completed}
                    className="w-5 h-5 border-2 border-gray-300 rounded-md focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    onChange={() => handleToggleTask(task.id, task.is_completed)}
                  />
                </div>

                {/* Task Content */}
                <div className="flex-1">
                  {/* List Type Path */}
                  <p className="text-xs text-gray-500 mb-1">
                    My lists &gt; {task.list_type.charAt(0).toUpperCase() + task.list_type.slice(1)}
                  </p>
                  
                  {/* Task Title */}
                  {editingTaskIndex === index ? (
                    <input
                      type="text"
                      value={editingTaskText}
                      onChange={(e) => setEditingTaskText(e.target.value)}
                      onBlur={() => handleSaveTask(task.id)}
                      onKeyDown={(e) => handleKeyPress(e, task.id)}
                      className="w-full text-lg font-semibold bg-transparent border-none focus:ring-0 p-0"
                      autoFocus
                    />
                  ) : (
                    <h3
                      className={`text-lg font-semibold ${
                        task.is_completed ? "line-through text-gray-400" : "text-gray-800"
                      }`}
                      onClick={() => handleEditTask(task.id, task.title)}
                    >
                      {task.title}
                    </h3>
                  )}

                  {/* Priority Tag */}
                  <div className="mt-2">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        task.priority === 'high'
                          ? "bg-red-500 text-white"
                          : task.priority === 'medium'
                          ? "bg-yellow-500 text-white"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                    </span>
                  </div>

                  {/* Date Information */}
                  <div className="text-sm text-gray-500">
                    {task.reminder_date && (
                      <span className="mr-2">
                        Due: {dayjs(task.reminder_date).format('MMM D, YYYY')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePinTask(task.id, task.is_pinned)}
                  className={`p-2 hover:bg-gray-100 rounded-full ${task.is_pinned ? 'text-blue-500' : 'text-gray-500'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0-16l-4 4m4-4l4 4" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDropdownToggle(index)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <FaEllipsisV className="text-gray-500 w-4 h-4" />
                </button>
              </div>

              {/* Dropdown Menu */}
              {dropdownIndex === index && (
                <div
                  ref={(el) => (dropdownRef.current[index] = el)}
                  className="absolute right-44 mt-32 bg-white shadow-lg rounded-lg w-48 py-2 z-10"
                >
                  <button
                    onClick={() => handlePinTask(task.id, task.is_pinned)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 mr-2 ${task.is_pinned ? 'text-blue-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0-16l-4 4m4-4l4 4" />
                    </svg>
                    {task.is_pinned ? 'Unpin task' : 'Pin task'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTaskId(task.id);
                      setShowTaskListPopup(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                  >
                    <img src={require("../icons/edit.svg").default} className="w-4 h-4 mr-2" alt="Edit"/>
                    Edit
                  </button>
                  <button
                    onClick={() => handleArchiveTask(task.id)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                  >
                    <img src={require("../icons/archive.svg").default} className="w-4 h-4 mr-2" alt="Archive"/>
                    Archive
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Task Section */}
        <div className="flex flex-col mx-2 md:mx-40 mt-auto">
          <div className="flex items-center bg-white shadow-md rounded-lg p-2 md:p-3 gap-2 md:gap-4">
            <button
              className="ml-2 md:ml-4 bg-none text-[#808080] font-semibold rounded-lg"
              onClick={() => setShowPopup(true)}
            >
              +
            </button>
            <input
              type="text"
              placeholder="Add Task"
              value={newTask}
              onChange={handleTaskInputChange}
              className={`flex-grow border-none focus:ring-0 text-black placeholder-gray-400 text-sm md:text-base ${
                taskError ? 'border-red-500' : ''
              }`}
              maxLength={50}
            />
            <div className="text-xs md:text-sm text-gray-500">
              {newTask.length}/50
            </div>
            <button
              className={`ml-2 md:ml-4 p-2 text-black font-semibold rounded-lg text-sm md:text-base ${
                newTask.trim() && !taskError
                  ? 'bg-[#FFB78B] hover:bg-[#FFA570]'
                  : 'bg-gray-200 cursor-not-allowed'
              }`}
              onClick={handleAddTask}
              disabled={!newTask.trim() || Boolean(taskError)}
            >
              Add
            </button>
          </div>
          {taskError && (
            <div className="text-red-500 text-xs md:text-sm mt-1 ml-4">
              {taskError}
            </div>
          )}
        </div>

        {/* Popups - adjust for mobile */}
        {showPopup && (
          <div className="font-poppins fixed inset-0 bg-none flex items-center justify-center p-4">
            <div
              ref={popupRef}
              className="bg-[#F0EFF9] rounded-lg p-4 md:p-6 w-full md:w-[20%] shadow-lg md:mt-5 md:mr-[28%]"
            >
              {/* Lists Section */}
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Lists</h2>
              <div className="border-b border-black mb-6">
                {["Personal", "Work", "School"].map((list, index) => (
                  <label
                    key={list}
                    className={`flex items-center justify-between py-3 ${index !== 0 ? "border-t border-black" : ""}`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="list"
                        value={list}
                        checked={selectedList === list}
                        onChange={() => setSelectedList(list)}
                        className="form-radio text-green-500 text-xl"
                      />
                      <span className="text-gray-700 text-sm">{list}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Tags Section */}
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Tags</h2>
              <div className="divide-y divide-gray-300">
                {[{ label: "High Priority", color: "bg-[#FF8585]" },
                  { label: "Medium Priority", color: "bg-[#FFDC7B]" },
                  { label: "Low Priority", color: "bg-[#73EA92]" }].map((tag) => (
                    <label
                      key={tag.label}
                      className={`flex items-center justify-between px-4 py-2 shadow-sm hover:shadow-md cursor-pointer ${tag.color}`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="tag"
                          value={tag.label}
                          checked={selectedTag === tag.label}
                          onChange={() => setSelectedTag(tag.label)}
                          className="form-radio"
                        />
                        <span className="text-white text-sm font-medium">{tag.label}</span>
                      </div>
                    </label>
                  ))}
              </div>
            </div>
          </div>
        )}

        {showTaskListPopup && selectedTaskId && (
          <div className="font-poppins fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-lg w-full md:w-[650px] max-h-[90vh] overflow-y-auto">
              {/* Header with close button */}
              <div className="flex justify-between items-center bg-[#F0EFF9] px-4 py-2 rounded-t-lg">
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">
                    My lists &gt; {tasks.find(t => t.id === selectedTaskId)?.list_type.charAt(0).toUpperCase() + tasks.find(t => t.id === selectedTaskId)?.list_type.slice(1)}
                  </span>
                </div>
                <button 
                  onClick={handleCloseTaskPopup}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Task Title */}
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {tasks.find(t => t.id === selectedTaskId)?.title}
                </h2>

                {/* Buttons Row */}
                <div className="flex space-x-2 mb-6">
                  {/* Remind Me Button */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className="flex items-center px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Remind Me
                      {tasks.find(t => t.id === selectedTaskId)?.reminder_date && 
                        `: ${new Date(tasks.find(t => t.id === selectedTaskId)?.reminder_date).toLocaleDateString()}`}
                    </button>
                    
                    {showDatePicker && (
                      <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-lg p-4 w-64">
                        {/* Month Navigation */}
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                if (currentMonth === 0) {
                                  setCurrentMonth(11);
                                  setCurrentYear(currentYear - 1);
                                } else {
                                  setCurrentMonth(currentMonth - 1);
                                }
                              }}
                              className="hover:bg-gray-100 p-1 rounded"
                            >
                              «
                            </button>
                            <button 
                              onClick={() => {
                                if (currentMonth === 0) {
                                  setCurrentMonth(11);
                                  setCurrentYear(currentYear - 1);
                                } else {
                                  setCurrentMonth(currentMonth - 1);
                                }
                              }}
                              className="hover:bg-gray-100 p-1 rounded"
                            >
                              ‹
                            </button>
                          </div>

                          <span className="font-semibold">
                            {dayjs().month(currentMonth).format('MMMM')} {currentYear}
                          </span>

                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                if (currentMonth === 11) {
                                  setCurrentMonth(0);
                                  setCurrentYear(currentYear + 1);
                                } else {
                                  setCurrentMonth(currentMonth + 1);
                                }
                              }}
                              className="hover:bg-gray-100 p-1 rounded"
                            >
                              ›
                            </button>
                            <button 
                              onClick={() => {
                                if (currentMonth === 11) {
                                  setCurrentMonth(0);
                                  setCurrentYear(currentYear + 1);
                                } else {
                                  setCurrentMonth(currentMonth + 1);
                                }
                              }}
                              className="hover:bg-gray-100 p-1 rounded"
                            >
                              »
                            </button>
                          </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                          {/* Day Headers */}
                          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                            <div key={day} className="text-center text-xs font-semibold p-1">
                              {day}
                            </div>
                          ))}

                          {/* Calendar Days */}
                          {generateDate(currentMonth, currentYear).map((dateObj, index) => (
                            <button
                              key={index}
                              onClick={() => handleUpdateDueDate(selectedTaskId, dateObj.date)}
                              className={`
                                p-2 text-center text-sm rounded hover:bg-gray-100
                                ${!dateObj.currentMonth ? 'text-gray-400' : 'text-gray-700'}
                                ${dateObj.today ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                              `}
                            >
                              {dateObj.date.date()}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* List Type Dropdown */}
                  <div className="relative" ref={listDropdownRef}>
                    <button 
                      onClick={() => setShowListDropdown(!showListDropdown)}
                      className="flex items-center px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200"
                    >
                      <img src={require("../icons/edit.svg").default} className="w-4 h-4 mr-2" alt="Personal"/>
                      {tasks.find(t => t.id === selectedTaskId)?.list_type.charAt(0).toUpperCase() + 
                       tasks.find(t => t.id === selectedTaskId)?.list_type.slice(1)}
                    </button>
                    
                    {showListDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg w-48 py-2 z-50">
                        {["Personal", "Work", "School"].map((list) => (
                          <button
                            key={list}
                            onClick={() => {
                              handleUpdateTaskList(selectedTaskId, list);
                              setShowListDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
                          >
                     
                            {list}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Priority Dropdown */}
                  <div className="relative" ref={priorityDropdownRef}>
                    <button 
                      onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                      className={`flex items-center px-4 py-2 rounded-full text-white ${
                        tasks.find(t => t.id === selectedTaskId)?.priority === 'high'
                          ? "bg-red-500"
                          : tasks.find(t => t.id === selectedTaskId)?.priority === 'medium'
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    >
                      {tasks.find(t => t.id === selectedTaskId)?.priority.charAt(0).toUpperCase() + 
                       tasks.find(t => t.id === selectedTaskId)?.priority.slice(1)} Priority
                    </button>
                    
                    {showPriorityDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg w-48 py-2 z-50">
                        <button
                          onClick={() => {
                            handleUpdatePriority(selectedTaskId, 'high');
                            setShowPriorityDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                          High Priority
                        </button>
                        <button
                          onClick={() => {
                            handleUpdatePriority(selectedTaskId, 'medium');
                            setShowPriorityDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                          Medium Priority
                        </button>
                        <button
                          onClick={() => {
                            handleUpdatePriority(selectedTaskId, 'low');
                            setShowPriorityDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          Low Priority
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes Section */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">NOTES</h3>
                  <textarea
                    value={taskNote}
                    onChange={(e) => setTaskNote(e.target.value)}
                    onBlur={() => handleSaveNote(selectedTaskId)}
                    placeholder="Insert your notes here"
                    className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Subtasks Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">SUBTASKS</h3>
                  <div className="max-h-48 overflow-y-auto">
                    {subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg group">
                        <input
                          type="checkbox"
                          checked={subtask.is_completed}
                          onChange={() => handleToggleSubtask(subtask.id)}
                          className="w-4 h-4 mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className={`flex-1 transition-all duration-200 ${
                          subtask.is_completed 
                            ? "line-through text-gray-400" 
                            : "text-gray-700"
                        }`}>
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add New Subtask */}
                  <div className="flex items-center mt-4 border-t pt-4">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newSubtask.trim()) {
                            handleAddSubtask();
                          }
                        }}
                        placeholder="Add a new subtask"
                        className="w-full p-2 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => {
                          if (newSubtask.trim()) {
                            handleAddSubtask();
                          }
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDay;