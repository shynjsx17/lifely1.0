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
  const [showReminder, setShowReminder] = useState (false);
  const [showTaskListPopup, setShowTaskListPopup] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [newTask, setNewTask] = useState(""); 
  const [editingTaskIndex, setEditingTaskIndex] = useState(null); // Track the task being edited
  const [editingTaskText, setEditingTaskText] = useState("");
  const [selectedList, setSelectedList] = useState("Personal"); 
  const [selectedTag, setSelectedTag] = useState("Low Priority"); 
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dropdownIndex, setDropdownIndex] = useState(null); // Track the index of the task with open dropdown
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [time, setTime] = useState("");
  const popupRef = useRef(null);
  const dropdownRef = useRef([]); // To track all dropdowns

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([
        { text: newTask, list: selectedList, tag: selectedTag, completed: false },
        ...tasks,
      ]);
      setNewTask(""); // Clear input field
    }
  };
  const handleEditTask = (index, text) => {
    setEditingTaskIndex(index);
    setEditingTaskText(text); // Initialize with the current task text
  };

  const handleSaveTask = (index) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, text: editingTaskText } : task
    );
    setTasks(updatedTasks);
    setEditingTaskIndex(null); // Exit edit mode
  };

  const handleKeyPress = (e, index) => {
    if (e.key === "Enter") {
      handleSaveTask(index);
    }
  };

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
          (dropdown) => dropdown && dropdown.contains && !dropdown.contains(event.target) // Ensure dropdown is not null
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
  const handleSetReminder = () => {
    console.log("Reminder set for:", selectedDate.toDateString(), time);
    setShowReminder(false);
  };

    // Format the selected date correctly
    const formatDate = (date) => {
      const options = { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Manila" };
      return new Intl.DateTimeFormat("en-PH", options).format(date);
    };
  
    const handleTaskListChange = (index) => {
      setShowTaskListPopup(true);
    };
    
    const handleAddSubtask = () => {
      if (newSubtask.trim() !== "") {
        setSubtasks([...subtasks, { text: newSubtask, completed: false }]);
        setNewSubtask(""); // Clear the input
      }
    };

    const handleToggleTask = (index) => {
      const updatedTasks = tasks.map((task, i) =>
        i === index ? { ...task, completed: !task.completed } : task
      );
      setTasks(updatedTasks);
    };
    // Toggle subtask completion
    const handleToggleSubtask = (index) => {
      const updatedSubtasks = subtasks.map((subtask, i) =>
        i === index ? { ...subtask, completed: !subtask.completed } : subtask
      );
      setSubtasks(updatedSubtasks);
    };


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
              className="flex items-center justify-between bg-white shadow-md rounded-lg p-3 mx-40 cursor-pointer"
            >
              {/* Checkbox, centered vertically */}
              <div className="flex items-center justify-center mr-4">
                <input
                  type="checkbox"
                  checked={task.completed}
                  className="w-6 h-6 border-[3px] border-black rounded-md appearance-none focus:outline-none"
                  onChange={() => handleToggleTask(index)} // toggle task completion
                />
              </div>
              {showTaskListPopup && (
                <div className="font-poppins fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-lg w-[30rem] shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-xs text-[#4B4F52] font-normal"> My lists &gt; {task.list}</h2>
                      {editingTaskIndex === index ? (
                  <input
                    type="text"
                    value={editingTaskText}
                    onChange={(e) => setEditingTaskText(e.target.value)}
                    onBlur={() => handleSaveTask(index)} // Save on losing focus
                    onKeyDown={(e) => handleKeyPress(e, index)} // Save on Enter
                    className="w-full border-none focus:ring-0 text-black bg-gray-100 px-2 py-1 rounded-md"
                    autoFocus
                  />
                ) : (
                  <h3
                    className={`text-gray-800 font-semibold text-xl cursor-pointer ${
                      task.completed ? "line-through text-gray-400" : ""
                    }`}
                    onClick={() => handleEditTask(index, task.text)} // Enable edit mode
                  >
                    {task.text}
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
                    <button className="px-3 py-1 text-sm text-black bg-[#F0EFF9] shadow-lg hover:bg-gray-100 flex items-center space-x-2 rounded"
                     onClick={() => setShowReminder(true)}
                    >
                      <img src={require("../icons/bell.svg").default} className="w-4 h-4 mr-2"/> 
                      Remind Me
                    </button>
                    <span className="px-3 py-1 text-sm text-black bg-[#F0EFF9] shadow-lg hover:bg-gray-100 flex items-center space-x-2 rounded">
                    <img src={require("../icons/edit.svg").default} className="w-4 h-4 mr-2"/> 
                      {task.list}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      task.tag === "High Priority"
                        ? "bg-red-500 text-white"
                        : task.tag === "Medium Priority"
                        ? "bg-yellow-500 text-white"
                        : "bg-green-500 text-white"
                    }`}>
                    {task.tag}
                    </span>
                  </div>
                  <label className="text-lg font-semibold text-[#4B4F52]">Notes</label>
                  <textarea
                    placeholder="Insert your notes here"
                    className="w-full h-32 border border-gray-300 rounded-lg p-3 mb-4 placeholder:text-[#808080]"
                  ></textarea>
                  <div className="mb-4">
                    <h4 className="font-bold mb-2 text-[#4B4F52]">SUBTASK</h4>
                    <div className="flex items-center mb-2">
                        <input
                          type="text"
                          value={newSubtask}
                          onChange={(e) => setNewSubtask(e.target.value)}
                          placeholder="Add a new subtask"
                          className="border rounded-md p-2 flex-grow mr-2"
                        />
                        <button
                          onClick={handleAddSubtask}
                          className="text-[#808080] hover:text-blue-500 px-4 py-2 rounded-lg"
                        >
                          Add
                        </button>
                      </div>
                          {/* Display Subtasks with Checkboxes */}
                              <div className="space-y-2">
                                {subtasks.map((subtask, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center p-3"
                                  >
                                  <input
                                    type="checkbox"
                                    className="w-3 h-3 mr-4 rounded-full accent-blue-500"
                                    checked={subtask.completed}
                                    onChange={() => handleToggleSubtask(index)}
                                  />
                                    <span
                                      className={`text-sm font-semibold ${
                                        subtask.completed ? "line-through text-gray-500" : ""
                                      }`}
                                    >
                                      {subtask.text}
                                    </span>
                                  </div>
                                ))}
                            </div>
                  </div>
                </div>
              </div>
              )}
              

              {/* Task content */}
              <div className="flex flex-col flex-grow"
               onClick={() => handleTaskListChange(index)}
              >
                {/* My list > task */}
                <p className="text-xs text-gray-500">My lists &gt; {task.list}</p>
                <p
                  className={`text-gray-800 font-semibold text-xl cursor-pointer ${task.completed ? 'line-through text-gray-400' : ''}`}
                >
                  {task.text}
                </p>

                {/* Tag */}
                <div className="mt-2 flex">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      task.tag === "High Priority"
                        ? "bg-red-500 text-white"
                        : task.tag === "Medium Priority"
                        ? "bg-yellow-500 text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {task.tag}
                  </span>
                </div>
              </div>

              {/* Three dots and pin icon */}
              <div className="relative flex items-center space-x-2">
                {/* Pin icon */}
                <img  
                  src={require("../icons/pin-svgrepo-com.svg").default}
                  alt="Home Icon"
                  className="w-4 h-4 cursor-pointer opacity-50"
                />
                {/* Three dots (more options) */}
                <FaEllipsisV
                  className="text-gray-500 cursor-pointer"
                  onClick={() => handleDropdownToggle(index)} // Toggle dropdown visibility
                />

                {/* Dropdown menu */}
                {dropdownIndex === index && (
                  <div ref={(el) => dropdownRef.current[index] = el} className="font-poppins absolute right-0 left-[20%] mt-56  bg-[#F0EFF9] shadow-lg rounded-lg w-40 py-2">
                    <button
                    onClick={() => setShowReminder(true)}
                      className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100 items-center space-x-2"
                    >
                      <img src={require("../icons/bell.svg").default} className="w-4 h-4"/>
                      <span>Remind me</span>
                    </button>
                    <button
                    onClick={() => handleTaskListChange(index)}
                      className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100 items-center space-x-2"
                    >
                      <img src={require("../icons/edit.svg").default} className="w-4 h-4"/>
                     <span>Edit</span>
                    </button>
                    <button
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
        {showReminder && (
        <div className="font-poppins fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg w-[30rem] shadow-lg">
          {/* Title Section */}
          <div className="bg-[#F0EFF9] text-black text-center py-2 rounded-t-lg shadow-md">
            <h2 className="text-lg font-bold ">Remind Me</h2>
          </div>

          <div className="p-6">
            {/* Date and Time Inputs */}
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
                  value={formatDate(selectedDate)} // Format the date correctly
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

            {/* Calendar */}
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

            {/* Action Buttons */}
            <div className="flex justify-between items-center border-t border-gray-200 pt-4">
              <button
                onClick={() => setShowReminder(false)}
                className="w-1/2 py-2 text-sm text-gray-700 bg-[#F0EFF9] rounded-bl-lg hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSetReminder}
                className="w-1/2 py-2 text-sm text-[#1E76E8] bg-[#F0EFF9] rounded-br-lg hover:bg-gray-300 transition-all"
              >
                Set
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

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
      </div>
    </div>
  );
};

export default MyDay;