import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../Navigation/Sidebar";
import { FaSun, FaEllipsisV, FaTimes } from 'react-icons/fa';
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/taskService';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';

const MyDay = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [showTaskListPopup, setShowTaskListPopup] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [newTask, setNewTask] = useState("");
  const [editingTaskIndex, setEditingTaskIndex] = useState(null);
  const [editingTaskText, setEditingTaskText] = useState("");
  const [selectedList, setSelectedList] = useState("Personal");
  const [selectedTag, setSelectedTag] = useState("Low Priority");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [time, setTime] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [taskNotes, setTaskNotes] = useState("");
  const popupRef = useRef(null);
  const dropdownRef = useRef([]);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await taskService.getTasks();
      // Sort tasks: pinned first, then by creation date
      const sortedTasks = (response?.data || []).sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return 0;
      });
      setTasks(sortedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch tasks'
      });
    }
  };

  const handleAddTask = async () => {
    if (newTask.trim()) {
      try {
        const taskData = {
          title: newTask,
          list_type: selectedList,
          priority_tag: selectedTag,
          notes: '',
          reminder_date: null,
          reminder_time: null
        };

        await taskService.createTask(taskData);
        setNewTask("");
        fetchTasks(); // Refresh tasks list
        setShowPopup(false);
      } catch (error) {
        console.error('Error adding task:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to add task'
        });
      }
    }
  };

  const handleEditTask = async (taskId, text) => {
    setEditingTaskIndex(taskId);
    setEditingTaskText(text);
  };

  const handleSaveTask = async (taskId) => {
    try {
      await taskService.updateTask({
        id: taskId,
        title: editingTaskText
      });
      fetchTasks();
      setEditingTaskIndex(null);
    } catch (error) {
      console.error('Error updating task:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update task'
      });
    }
  };

  const handleKeyPress = (e, taskId) => {
    if (e.key === "Enter") {
      handleSaveTask(taskId);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      await taskService.toggleTaskComplete(taskId);
      fetchTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update task'
      });
    }
  };

  const handleAddSubtask = async () => {
    if (newSubtask.trim() !== "" && selectedTaskId) {
      try {
        await taskService.createSubtask(selectedTaskId, newSubtask);
        const response = await taskService.getSubtasks(selectedTaskId);
        setSubtasks(response?.data || []);
        setNewSubtask("");
      } catch (error) {
        console.error('Error adding subtask:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to add subtask'
        });
      }
    }
  };

  const handleToggleSubtask = async (subtaskId) => {
    try {
      // Optimistically update the UI
      setSubtasks(prevSubtasks => 
        prevSubtasks.map(subtask => 
          subtask.id === subtaskId 
            ? { ...subtask, completed: !subtask.completed }
            : subtask
        )
      );

      // Make the API call
      await taskService.toggleSubtaskComplete(subtaskId);
      
      // Refresh the subtasks to ensure sync with server
      if (selectedTaskId) {
        const response = await taskService.getSubtasks(selectedTaskId);
        setSubtasks(response?.data || []);
      }
    } catch (error) {
      console.error('Error toggling subtask:', error);
      // Revert the optimistic update on error
      if (selectedTaskId) {
        const response = await taskService.getSubtasks(selectedTaskId);
        setSubtasks(response?.data || []);
      }
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update subtask'
      });
    }
  };

  const handleTaskListChange = async (taskId) => {
    setSelectedTaskId(taskId);
    setShowTaskListPopup(true);
    try {
      const response = await taskService.getSubtasks(taskId);
      setSubtasks(response?.data || []);
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setTaskNotes(task.notes || '');
      }
    } catch (error) {
      console.error('Error fetching subtasks:', error);
      setSubtasks([]);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch subtasks'
      });
    }
  };

  const handleSetReminder = async (taskId, date) => {
    try {
      // Format the date and time
      const reminderDate = new Date(date);
      const formattedDate = reminderDate.toISOString().split('T')[0];
      const formattedTime = reminderDate.toTimeString().split(' ')[0];

      await taskService.updateTask(taskId, {
        reminder_date: formattedDate,
        reminder_time: formattedTime
      });

      // Refresh the tasks list
      fetchTasks();
      
      toast.success('Reminder set successfully');
    } catch (error) {
      console.error('Error setting reminder:', error);
      toast.error('Failed to set reminder');
    }
  };

  const handleSaveNotes = async () => {
    if (selectedTaskId) {
      try {
        await taskService.updateTask({
          id: selectedTaskId,
          notes: taskNotes
        });
        fetchTasks();
      } catch (error) {
        console.error('Error saving notes:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to save notes'
        });
      }
    }
  };

  const handleArchiveTask = async (taskId) => {
    try {
      const result = await Swal.fire({
        title: 'Archive Task?',
        text: "You can view archived tasks in the Archive section",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#FFB78B',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, archive it!',
        cancelButtonText: 'No, keep it'
      });

      if (result.isConfirmed) {
        await taskService.archiveTask(taskId);
        await fetchTasks();
        Swal.fire({
          title: 'Archived!',
          text: 'Your task has been archived.',
          icon: 'success',
          confirmButtonColor: '#FFB78B'
        });
      }
    } catch (error) {
      console.error('Error archiving task:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to archive task'
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }

      if (dropdownRef.current && dropdownRef.current.length > 0) {
        const outsideDropdown = dropdownRef.current.every(
          (dropdown) => dropdown && dropdown.contains && !dropdown.contains(event.target)
        );

        if (outsideDropdown) {
          setDropdownIndex(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Format the date in the desired format (e.g., 'Wednesday, December 11, 2024')
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDropdownToggle = (index) => {
    setDropdownIndex(dropdownIndex === index ? null : index);
  };

  const formatDate = (date) => {
    const options = { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Manila" };
    return new Intl.DateTimeFormat("en-PH", options).format(date);
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-[60px]" : "ml-[250px]"
        }`}
      >
        <div className="p-8 h-full overflow-y-auto">
          <div className="text-left mb-10 font-poppins">
            <h1 className="font-bold text-3xl">Good Day, {user?.userName || 'User'}!</h1>
            <p className="font-bold text-xl text-[#FFB78B]">
              What's your plan for today?
            </p>
          </div>

          <div className="flex items-center justify-center bg-white shadow-md rounded-lg p-6 mb-6">
            <FaSun className="text-3xl mr-4" />
            <span className="text-3xl font-semibold text-gray-800">
              {formattedDate}
            </span>
          </div>

          {/* Task List */}
          <div className="space-y-4 mb-6">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between bg-white shadow-md rounded-lg p-3 mx-40 cursor-pointer"
              >
                {/* Checkbox */}
                <div className="flex items-center justify-center mr-4">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    className="w-6 h-6 border-[3px] border-black rounded-md appearance-none focus:outline-none"
                    onChange={() => handleToggleTask(task.id)}
                  />
                </div>

                {showTaskListPopup && selectedTaskId === task.id && (
                  <div className="font-poppins fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg w-[30rem] shadow-lg p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h2 className="text-xs text-[#4B4F52] font-normal">My lists &gt; {task.list_type}</h2>
                          {editingTaskIndex === task.id ? (
                            <input
                              type="text"
                              value={editingTaskText}
                              onChange={(e) => setEditingTaskText(e.target.value)}
                              onBlur={() => handleSaveTask(task.id)}
                              onKeyDown={(e) => handleKeyPress(e, task.id)}
                              className="w-full border-none focus:ring-0 text-black bg-gray-100 px-2 py-1 rounded-md"
                              autoFocus
                            />
                          ) : (
                            <h3
                              className={`text-gray-800 font-semibold text-xl cursor-pointer ${
                                task.completed ? "line-through text-gray-400" : ""
                              }`}
                              onClick={() => handleEditTask(task.id, task.title)}
                            >
                              {task.title}
                            </h3>
                          )}
                        </div>
                        <button
                          className="text-black hover:text-gray-700"
                          onClick={() => setShowTaskListPopup(false)}
                        >
                          <FaTimes/>
                        </button>
                      </div>
                      <div className="flex items-center space-x-2 mb-4">
                        <button 
                          className="px-3 py-1 text-sm text-black bg-[#F0EFF9] shadow-lg hover:bg-gray-100 flex items-center space-x-2 rounded"
                          onClick={() => setShowReminder(true)}
                        >
                          <img src={require("../icons/bell.svg").default} className="w-4 h-4 mr-2"/>
                          Remind Me
                        </button>

                        {/* List Type Dropdown */}
                        <div className="relative">
                          <button 
                            className="px-3 py-1 text-sm text-black bg-[#F0EFF9] shadow-lg hover:bg-gray-100 flex items-center space-x-2 rounded"
                            onClick={() => setDropdownIndex(dropdownIndex === 'list' ? null : 'list')}
                          >
                            <img src={require("../icons/edit.svg").default} className="w-4 h-4 mr-2"/>
                            {task.list_type}
                          </button>
                          {dropdownIndex === 'list' && (
                            <div className="absolute z-50 mt-1 bg-white rounded-lg shadow-lg w-40 py-2">
                              {["Personal", "Work", "School"].map((list) => (
                                <button
                                  key={list}
                                  onClick={async () => {
                                    await taskService.updateTask({
                                      id: task.id,
                                      list_type: list
                                    });
                                    setDropdownIndex(null);
                                    fetchTasks();
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100"
                                >
                                  {list}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Priority Tag Dropdown */}
                        <div className="relative">
                          <button 
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              task.priority_tag === "High Priority"
                                ? "bg-red-500 text-white"
                                : task.priority_tag === "Medium Priority"
                                ? "bg-yellow-500 text-white"
                                : "bg-green-500 text-white"
                            }`}
                            onClick={() => setDropdownIndex(dropdownIndex === 'priority' ? null : 'priority')}
                          >
                            {task.priority_tag}
                          </button>
                          {dropdownIndex === 'priority' && (
                            <div className="absolute z-50 mt-1 bg-white rounded-lg shadow-lg w-40 py-2">
                              {[
                                { label: "High Priority", color: "bg-red-500" },
                                { label: "Medium Priority", color: "bg-yellow-500" },
                                { label: "Low Priority", color: "bg-green-500" }
                              ].map((priority) => (
                                <button
                                  key={priority.label}
                                  onClick={async () => {
                                    await taskService.updateTask({
                                      id: task.id,
                                      priority_tag: priority.label
                                    });
                                    setDropdownIndex(null);
                                    fetchTasks();
                                  }}
                                  className={`block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100`}
                                >
                                  <span className={`inline-block w-3 h-3 rounded-full ${priority.color} mr-2`}></span>
                                  {priority.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <label className="text-lg font-semibold text-[#4B4F52]">Notes</label>
                      <textarea
                        value={taskNotes}
                        onChange={(e) => setTaskNotes(e.target.value)}
                        onBlur={handleSaveNotes}
                        placeholder="Insert your notes here"
                        className="w-full h-32 border border-gray-300 rounded-lg p-3 mb-4 placeholder:text-[#808080]"
                      />
                      <div className="mb-4">
                        <h4 className="font-bold mb-2 text-[#4B4F52]">SUBTASK</h4>
                        <div className="flex items-center mb-2">
                          <input
                            type="text"
                            value={newSubtask}
                            onChange={(e) => setNewSubtask(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newSubtask.trim()) {
                                handleAddSubtask();
                              }
                            }}
                            placeholder="Add a new subtask"
                            className="border rounded-md p-2 flex-grow mr-2"
                          />
                          <button
                            onClick={handleAddSubtask}
                            disabled={!newSubtask.trim()}
                            className={`px-4 py-2 rounded-lg ${
                              newSubtask.trim() 
                                ? 'bg-[#FFB78B] text-white hover:bg-[#ffa770]' 
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            Add
                          </button>
                        </div>
                        {/* Display Subtasks */}
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {subtasks.map((subtask) => (
                            <div
                              key={subtask.id}
                              className="flex items-center p-3 bg-white rounded-lg hover:shadow-md border border-gray-200"
                            >
                              <div className="flex items-center w-full">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 mr-4 rounded border-2 border-gray-300 cursor-pointer"
                                  checked={subtask.completed}
                                  onChange={() => handleToggleSubtask(subtask.id)}
                                />
                                <span
                                  style={{
                                    textDecoration: subtask.completed ? 'line-through' : 'none',
                                    color: subtask.completed ? '#9CA3AF' : '#1F2937',
                                    transition: 'all 0.2s ease-in-out'
                                  }}
                                  className="text-sm font-medium"
                                >
                                  {subtask.title}
                                </span>
                              </div>
                            </div>
                          ))}
                          {subtasks.length === 0 && (
                            <div className="text-center text-gray-500 py-2">
                              No subtasks yet
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Task content */}
                <div 
                  className="flex flex-col flex-grow"
                  onClick={() => handleTaskListChange(task.id)}
                >
                  <p className="text-xs text-gray-500">My lists &gt; {task.list_type}</p>
                  <p
                    className={`text-gray-800 font-semibold text-xl cursor-pointer ${task.completed ? 'line-through text-gray-400' : ''}`}
                  >
                    {task.title}
                  </p>

                  {/* Tag */}
                  <div className="mt-2 flex">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        task.priority_tag === "High Priority"
                          ? "bg-red-500 text-white"
                          : task.priority_tag === "Medium Priority"
                          ? "bg-yellow-500 text-white"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      {task.priority_tag}
                    </span>
                  </div>
                </div>

                {/* Three dots and pin icon */}
                <div className="relative flex items-center space-x-2">
                  <img
                    src={require("../icons/pin-svgrepo-com.svg").default}
                    alt="Pin Icon"
                    className={`w-4 h-4 cursor-pointer transition-all duration-200 ${
                      task.pinned ? 'opacity-100' : 'opacity-50 hover:opacity-75'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      taskService.togglePin(task.id, task.pinned).then(fetchTasks);
                    }}
                  />
                  <FaEllipsisV
                    className="text-gray-500 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDropdownToggle(task.id);
                    }}
                  />

                  {/* Dropdown menu */}
                  {dropdownIndex === task.id && (
                    <div ref={(el) => dropdownRef.current[task.id] = el} className="font-poppins absolute right-0 left-[20%] mt-56 bg-[#F0EFF9] shadow-lg rounded-lg w-40 py-2">
                      <button
                        onClick={() => setShowReminder(true)}
                        className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100 items-center space-x-2"
                      >
                        <img src={require("../icons/bell.svg").default} className="w-4 h-4"/>
                        <span>Remind me</span>
                      </button>
                      <button
                        onClick={() => handleTaskListChange(task.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100 items-center space-x-2"
                      >
                        <img src={require("../icons/edit.svg").default} className="w-4 h-4"/>
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleArchiveTask(task.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100 items-center space-x-2"
                      >
                        <img src={require("../icons/archive.svg").default} className="w-4 h-4"/>
                        <span>Archive</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Task Section - Keep at bottom */}
          <div className="sticky bottom-4 bg-white shadow-md rounded-lg p-3 mt-auto">
            <div className="flex items-center gap-4">
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
          </div>
        </div>
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
              {["Personal", "Work", "School"].map((list) => (
                <label
                  key={list}
                  className="flex items-center justify-between py-3 border-t border-black first:border-t-0"
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
              {[
                { label: "High Priority", color: "bg-[#FF8585]" },
                { label: "Medium Priority", color: "bg-[#FFDC7B]" },
                { label: "Low Priority", color: "bg-[#73EA92]" }
              ].map((tag) => (
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

      {/* Reminder Modal */}
      {showReminder && (
        <div className="font-poppins fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg w-[30rem] shadow-lg">
            <div className="bg-[#F0EFF9] text-black text-center py-2 rounded-t-lg shadow-md">
              <h2 className="text-lg font-bold">Remind Me</h2>
            </div>

            <div className="p-6">
              <div className="flex justify-between mb-6">
                <div className="w-[45%]">
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium mb-1 text-gray-600"
                  >
                    DATE
                  </label>
                  <input
                    type="text"
                    id="date"
                    value={formatDate(selectedDate)}
                    readOnly
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-center focus:outline-none"
                  />
                </div>
                <div className="w-[45%]">
                  <label
                    htmlFor="time"
                    className="block text-sm font-medium mb-1 text-gray-600"
                  >
                    TIME
                  </label>
                  <input
                    type="time"
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                  />
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  className="rounded-lg border border-gray-300 shadow-sm"
                  tileClassName={({ date, view }) =>
                    view === "month" &&
                    date.toDateString() === selectedDate.toDateString()
                      ? "bg-blue-500 text-white rounded-lg"
                      : "hover:bg-blue-100 rounded-lg"
                  }
                />
              </div>

              <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                <button
                  onClick={() => setShowReminder(false)}
                  className="w-1/2 py-2 text-sm text-gray-700 bg-[#F0EFF9] rounded-bl-lg hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSetReminder(selectedTaskId, selectedDate)}
                  className="w-1/2 py-2 text-sm text-[#1E76E8] bg-[#F0EFF9] rounded-br-lg hover:bg-gray-300 transition-all"
                >
                  Set
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDay;