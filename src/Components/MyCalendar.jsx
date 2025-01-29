import React, { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import Sidebar from '../Navigation/Sidebar';
import backgroundImage from '../Images/BG.png';
import { FaBars, FaSearch, FaCog, FaQuestionCircle, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

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

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MyCalendar = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(dayjs().month());
  const [currentYear, setCurrentYear] = useState(dayjs().year());
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const dates = generateDate(currentMonth, currentYear);
  const [tasks, setTasks] = useState([]);
  const [showTaskListPopup, setShowTaskListPopup] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [taskNote, setTaskNote] = useState("");
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const [editingTaskIndex, setEditingTaskIndex] = useState(null);
  const [editingTaskText, setEditingTaskText] = useState("");
  const listDropdownRef = useRef(null);
  const priorityDropdownRef = useRef(null);
  const [showTaskSelectionPopup, setShowTaskSelectionPopup] = useState(false);
  const [selectedDateTasks, setSelectedDateTasks] = useState([]);

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
      if (data.success) {
        // Filter tasks with reminder_date
        const tasksWithDates = (data.tasks || []).filter(task => task.reminder_date);
        setTasks(tasksWithDates);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add useEffect to fetch subtasks when a task is selected
  useEffect(() => {
    if (selectedTaskId) {
      const fetchSubtasks = async () => {
        try {
          const token = sessionStorage.getItem('session_token');
          if (!token) {
            console.error('No authentication token found');
            return;
          }

          const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?subtasks&task_id=${selectedTaskId}`, {
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

      fetchSubtasks();
    } else {
      setSubtasks([]);
    }
  }, [selectedTaskId]);

  const goToPreviousMonth = () => {
    const newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const goToNextMonth = () => {
    const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const goToToday = () => {
    const today = dayjs();
    setCurrentMonth(today.month());
    setCurrentYear(today.year());
    setSelectedDate(today);
  };

  const handleDateClick = (dateObj) => {
    const clickedDate = dateObj.date;
    setSelectedDate(clickedDate);
    const tasksForDate = getTasksForDate(clickedDate.toDate());
    
    if (tasksForDate.length > 1) {
      // If multiple tasks, show selection popup
      setSelectedDateTasks(tasksForDate);
      setShowTaskSelectionPopup(true);
    } else if (tasksForDate.length === 1) {
      // If single task, open it directly
      handleEditTask(tasksForDate[0].id, tasksForDate[0].title);
    }
  };

  // Task management functions
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

  const handleUpdateTaskList = async (taskId, newListType) => {
    try {
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

  // Get tasks for selected date
  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      const taskDate = dayjs(task.reminder_date);
      return taskDate.format('YYYY-MM-DD') === dayjs(date).format('YYYY-MM-DD');
    });
  };

  // Add this CSS class to handle background image responsiveness
  const responsiveBackgroundStyle = {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
    width: '100%'
  };

  return (
    <div className="flex h-screen flex-col">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <div className={`flex-1 transition-all duration-300 ${
        isSidebarCollapsed ? "ml-[60px]" : "ml-[240px]"
      }`}>
        {/* Main Container with gradient background */}
        <div className="flex-1 bg-gradient-to-br from-rose-50 via-sky-50 to-emerald-50">
          {/* Header with gradient */}
          <div className="flex-none w-full bg-gradient-to-r from-rose-50/90 to-purple-50/90 backdrop-blur-sm px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Left Section */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl font-medium text-gray-800">My Calendar</h1>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={goToToday}
                    className="px-4 py-1.5 text-sm bg-white rounded-lg border border-gray-200"
                  >
                    Today
                  </button>
                  <div className="flex items-center space-x-2">
                    <button onClick={goToPreviousMonth} className="p-1.5">
                      <FaChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-lg">January 2025</span>
                    <button onClick={goToNextMonth} className="p-1.5">
                      <FaChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Section - Month/Year Selectors */}
              <div className="flex items-center space-x-2">
                <select 
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                  className="px-3 py-1.5 text-sm bg-white rounded-lg border border-gray-200"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
                <select 
                  value={currentYear}
                  onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                  className="px-3 py-1.5 text-sm bg-white rounded-lg border border-gray-200"
                >
                  {Array.from({ length: 50 }, (_, i) => currentYear - 20 + i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 text-sm text-gray-500 text-center">
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {dates.map((dateObj, index) => {
                const tasksForDate = getTasksForDate(dateObj.date.toDate());
                const isSelected = selectedDate.format('YYYY-MM-DD') === dateObj.date.format('YYYY-MM-DD');
                
                return (
                  <div
                    key={index}
                    onClick={() => handleDateClick(dateObj)}
                    className={`
                      relative min-h-[120px] p-3 
                      bg-white rounded-lg
                      border border-gray-100
                      transition-all duration-200
                      ${!dateObj.currentMonth ? 'opacity-60' : ''}
                      ${isSelected ? 'border-2 border-sky-200' : ''}
                      ${dateObj.today ? 'bg-rose-50' : ''}
                    `}
                  >
                    <span className={`
                      text-sm font-medium block mb-1
                      ${!dateObj.currentMonth ? 'text-gray-400' : 'text-gray-700'}
                      ${dateObj.today ? 'text-rose-600' : ''}
                      ${isSelected ? 'text-sky-600' : ''}
                    `}>
                      {dateObj.date.date()}
                    </span>
                    
                    {/* Task Indicators */}
                    {tasksForDate.length > 0 && (
                      <div className="absolute bottom-2 left-2 right-2">
                        {tasksForDate.map((task, i) => (
                          <div
                            key={i}
                            className={`
                              h-1 w-full mb-1 rounded-full
                              ${task.priority === 'high' ? 'bg-red-400' :
                                task.priority === 'medium' ? 'bg-yellow-400' :
                                'bg-green-400'}
                            `}
                            title={task.title}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Task Selection Popup */}
      {showTaskSelectionPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg w-[30rem] shadow-lg">
            <div className="flex justify-between items-center bg-[#F0EFF9] px-4 py-2 rounded-t-lg">
              <span className="text-sm text-gray-600">
                Tasks for {selectedDate.format('MMMM D, YYYY')}
              </span>
              <button 
                onClick={() => setShowTaskSelectionPopup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {selectedDateTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setShowTaskSelectionPopup(false);
                      handleEditTask(task.id, task.title);
                    }}
                    className="flex items-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">
                        {task.list_type.charAt(0).toUpperCase() + task.list_type.slice(1)}
                      </p>
                      <h3 className="font-medium">{task.title}</h3>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
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
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Edit Modal */}
      {showTaskListPopup && selectedTaskId && (
        <div className="font-poppins fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg w-[650px] max-h-[90vh] overflow-y-auto">
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

            {/* Task Content */}
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
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">SUBTASKS</h3>
                <div className="space-y-2">
                  {/* Existing Subtasks */}
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
        </div>
      )}
    </div>
  );
};

export default MyCalendar;
