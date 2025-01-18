import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../Navigation/Sidebar";
import { FaSun, FaEllipsisV, FaTimes } from 'react-icons/fa';
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useAuth } from '../context/AuthContext';

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

  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      console.log('Fetching tasks...'); // Debug log
      const token = sessionStorage.getItem('session_token');
      console.log('Token:', token); // Debug log

      const response = await fetch('http://localhost/lifely1.0/backend/api/tasks.php?archived=false', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Response data:', data); // Debug log

      if (data.success) {
        const tasksArray = Array.isArray(data.tasks) ? data.tasks : [];
        console.log('Setting tasks:', tasksArray); // Debug log
        setTasks(tasksArray);
      } else {
        console.error('Failed to fetch tasks:', data.message);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add this useEffect to log tasks state changes
  useEffect(() => {
    console.log('Current tasks state:', tasks);
  }, [tasks]);

  const handleAddTask = async () => {
    if (newTask.trim()) {
      try {
        const response = await fetch('http://localhost/lifely1.0/backend/api/tasks.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
          },
          body: JSON.stringify({
            title: newTask,
            list_type: selectedList,
            priority: selectedTag.toLowerCase().replace(' priority', ''),
            description: ''
          })
        });

        const data = await response.json();
        if (data.success) {
          fetchTasks();
          setNewTask("");
          setShowPopup(false);
        }
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };

  const handleEditTask = async (taskId, text) => {
    setSelectedTaskId(taskId);
    setEditingTaskText(text);
    setShowTaskListPopup(true);
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
        fetchTasks();
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
      const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?id=${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
        },
        body: JSON.stringify({
          reminder_date: date
        })
      });

      if (response.ok) {
        fetchTasks();
        setShowDatePicker(false);
      }
    } catch (error) {
      console.error('Error updating due date:', error);
    }
  };

  const handleArchiveTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?id=${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
        },
        body: JSON.stringify({
          is_archived: true
        })
      });

      if (response.ok) {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        setDropdownIndex(null);
      }
    } catch (error) {
      console.error('Error archiving task:', error);
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
    if (newSubtask.trim() !== "") {
      try {
        const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?subtask=true&task_id=${selectedTaskId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
          },
          body: JSON.stringify({
            title: newSubtask
          })
        });

        const data = await response.json();
        if (data.success) {
          fetchTasks();
          setNewSubtask("");
        } else {
          console.error('Failed to add subtask:', data.message);
        }
      } catch (error) {
        console.error('Error adding subtask:', error);
      }
    }
  };

  const handleToggleSubtask = async (subtaskId) => {
    try {
      console.log('Toggling subtask:', subtaskId); // Debug log
      const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?subtask=true&id=${subtaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
        },
        body: JSON.stringify({})
      });

      const data = await response.json();
      console.log('Toggle response:', data); // Debug log

      if (data.success) {
        fetchTasks();
      } else {
        console.error('Failed to toggle subtask:', data.message);
      }
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

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

  return (
    <div className="flex h-screen flex-col">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <div
        className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? "ml-[60px]" : "ml-[200px]"} p-8 bg-system-background bg-no-repeat bg-fixed flex flex-col`}
      >
        <div className="text-left mb-10 font-poppins">
          <h1 className="font-bold text-3xl">Good Day, {user?.userName || 'User'}!</h1>
          <p className="font-bold text-xl text-[#FFB78B]">
            What's your plan for today?
          </p>
        </div>

        <div className="flex items-center justify-center bg-white shadow-md rounded-lg p-6 mb-6 mx-40">
            <FaSun className="text-3xl mr-4" />
            <span className="text-3xl font-semibold text-gray-800">
                {formattedDate}
            </span>
        </div>

        {/* Task List */}
        <div className="space-y-4 mb-6 flex-grow">
          {tasks.map((task, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white shadow-md rounded-lg p-4 mx-40 cursor-pointer hover:shadow-lg transition-shadow"
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

        {/* Add Task Section at the bottom */}
        <div className="flex items-center bg-white shadow-md rounded-lg p-3 gap-4 mx-40 mt-auto">
          <button
            className="ml-4 bg-none text-[#808080] font-semibold rounded-lg"
            onClick={() => setShowPopup(true)}
          >
            +
          </button>
          <input
            type="text"
            placeholder="Add Task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-grow border-none focus:ring-0 text-black placeholder-gray-400"
          />
          <button
            className="ml-4 bg-[#FFB78B] p-2 text-black font-semibold rounded-lg"
            onClick={handleAddTask}
          >
            Add
          </button>
        </div>

        {/* Popup for List and Tags */}
        {showPopup && (
          <div className="font-poppins fixed inset-0 bg-none flex items-center justify-center">
            <div
              ref={popupRef}
              className="bg-[#F0EFF9] rounded-lg p-6 w-[20%] shadow-lg mt-5 mr-[28%]"
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
                    <img
                      src={require("../icons/edit.svg").default}
                      alt="Edit icon"
                      className="w-4 h-4 opacity-50"
                    />
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
          <div className="font-poppins fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg w-[30rem] shadow-lg">
              {/* Header with close button */}
              <div className="flex justify-between items-center bg-[#F0EFF9] px-4 py-2 rounded-t-lg">
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">
                    My lists &gt; {tasks.find(t => t.id === selectedTaskId)?.list_type.charAt(0).toUpperCase() + tasks.find(t => t.id === selectedTaskId)?.list_type.slice(1)}
                  </span>
                </div>
                <button 
                  onClick={() => setShowTaskListPopup(false)}
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
                      <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-lg p-4">
                        <Calendar
                          onChange={(date) => {
                            handleUpdateDueDate(selectedTaskId, date.toISOString().split('T')[0]);
                          }}
                          value={tasks.find(t => t.id === selectedTaskId)?.reminder_date ? 
                            new Date(tasks.find(t => t.id === selectedTaskId)?.reminder_date) : 
                            new Date()}
                          minDate={new Date()}
                          className="rounded-lg border border-gray-200"
                        />
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
                            <img src={require("../icons/edit.svg").default} className="w-4 h-4 mr-2" alt={list}/>
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
                  <div className="space-y-2">
                    <div className="max-h-48 overflow-y-auto">
                      {tasks.find(t => t.id === selectedTaskId)?.subtasks?.map((subtask) => (
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
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDay;