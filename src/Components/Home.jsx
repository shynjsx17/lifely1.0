import React, { useState } from "react";
import Sidebar from "../Navigation/Sidebar";
import { useAuth } from '../context/AuthContext';


const Home = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);



  const [tasks] = useState([
    { id: 1, text: "Fundamentals of Research", status: "upcoming" },
    { id: 2, text: "Web Development", status: "upcoming" },
    { id: 3, text: "Jogging", status: "upcoming" },
    { id: 4, text: "Editing Graphics", status: "upcoming" },
    { id: 5, text: "UI/UX Design", status: "upcoming" },
    { id: 6, text: "Documentation", status: "upcoming" },
  ]);

  const [note, setNote] = useState("");
  const [filter, setFilter] = useState("upcoming");

  const fontStyle = (style) => {
    const selection = window.getSelection();
    const selectedText = selection.toString();

    if (selectedText) {
      const currentStyle = selection.focusNode.parentElement.style[style];
      const clickStyle = currentStyle === "bold" || currentStyle === "italic" || currentStyle === "underline";
      
      // Toggle the style (if already applied, remove it, else apply it)
      if (clickStyle) {
        document.execCommand(style, false, null); // Remove the style
      } else {
        document.execCommand(style, false, null); // Apply the style
      }
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
        className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? "ml-[60px]" : "ml-[200px]"} p-8 bg-system-background bg-no-repeat bg-fixed`}
      >
        {/* Title Section */}
        <div className="text-left mb-10 font-poppins">
          <h1 className="font-bold text-3xl">Good Day, {user?.userName || 'User'}</h1>
          <p className="font-bold text-xl text-[#FFB78B]">
            What's your plan for today?
          </p>
        </div>

        {/* Main Sections */}
        <div className="flex flex-col md:flex-row items-start justify-center gap-6 font-poppins">
          {/* Task Section */}
          <div className="w-full md:w-1/2 bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Your Task for Today:</h3>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <div className="flex space-x-4 text-[#808080] text-sm font-medium">
                <span
                  className={`cursor-pointer hover:border-b-4 hover:border-[#808080] ${filter === "upcoming" ? "border-b-4 border-[#808080]" : ""}`}
                  onClick={() => setFilter("upcoming")}
                >
                  Upcoming
                </span>
                <span
                  className={`cursor-pointer hover:border-b-4 hover:border-[#808080] ${filter === "overdue" ? "border-b-4 border-[#808080]" : ""}`}
                  onClick={() => setFilter("overdue")}
                >
                  Overdue
                </span>
                <span
                  className={`cursor-pointer hover:border-b-4 hover:border-[#808080] ${filter === "completed" ? "border-b-4 border-[#808080]" : ""}`}
                  onClick={() => setFilter("completed")}
                >
                  Completed
                </span>
              </div>
              <button className="text-[#808080] font-medium text-sm">
                + Create Task
              </button>
            </div>

            <ul className="space-y-3 text-sm">
              {tasks
                .filter((task) => task.status === filter)
                .map((task) => (
                  <li key={task.id} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id={`task-${task.id}`}
                      name="task"
                      className="w-5 h-5 text-blue-500"
                    />
                    <label
                      htmlFor={`task-${task.id}`}
                      className="text-gray-700 cursor-pointer"
                    >
                      {task.text}
                    </label>
                  </li>
                ))}
            </ul>
          </div>

          {/* Notepad Section */}
          <div className="w-full md:w-1/2 bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Your Notepad:</h3>
            <div
              contentEditable
              className="w-full h-48 border rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onInput={(e) => setNote(e.target.innerHTML)} // Update note with HTML content
              style={{ whiteSpace: "pre-wrap" }} // To preserve line breaks in content
              placeholder="Write your notes here..."
            />
            <div className="flex space-x-4 mt-3 text-gray-500">
              <button
                className="hover:text-blue-500"
                onClick={() => fontStyle("bold")}
              >
                <b>B</b>
              </button>
              <button
                className="hover:text-blue-500"
                onClick={() => fontStyle("italic")}
              >
                <i>I</i>
              </button>
              <button
                className="hover:text-blue-500"
                onClick={() => fontStyle("underline")}
              >
                <u>U</u>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
