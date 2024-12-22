import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();  //use to make sure the sidebar background color is active when a particular page is active 

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  // use to check if the current route matches
  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={`h-full bg-gradient-to-b from-[#add1c8] via-[#b4d2c8] to-[#e0cbb8] pt-5 fixed shadow-lg transition-all duration-500 ${
        isCollapsed ? "w-[70px]" : "w-[200px]"
      }`}
    >
      {/* Sidebar Header */}
      <div className="px-5 mb-10 flex items-center justify-between">
        <h1
          className={`text-xl font-bold ${isCollapsed ? "hidden" : ""} transition-all duration-300`}
        >
          Lifely
        </h1>
        <button
          className="bg-gray-300 text-black p-2 rounded-full"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? "<" : ">"}
        </button>
      </div>

      {/* Sidebar Links */}
      <ul className="list-none mt-5">
        <li className={`flex items-center px-5 py-4 ${isActive("/") ? "bg-white" : "hover:bg-white"} transition-all duration-300`}>
          <Link to={"/"} className="flex items-center space-x-2">
            <img
              src={require("../icons/icons8-home.svg").default}
              alt="Home Icon"
              className="w-6 h-6"
            />
            {!isCollapsed && <span>Home</span>}
          </Link>
        </li>
        <li className={`flex items-center px-5 py-4 ${isActive("/MyDay") ? "bg-white" : "hover:bg-white"} transition-all duration-300`}>
          <Link to={"/MyDay"} className="flex items-center space-x-2">
            <img
              src={require("../icons/myday.svg").default}
              alt="My Day Icon"
              className="w-6 h-6"
            />
            {!isCollapsed && <span>My Day</span>}
          </Link>
        </li>
        <li className={`flex items-center px-5 py-4 ${isActive("/MyCalendar") ? "bg-white" : "hover:bg-white"} transition-all duration-300`}>
          <Link to={"/MyCalendar"} className="flex items-center space-x-2">
            <img
              src={require("../icons/calendar.svg").default}
              alt="My Calendar Icon"
              className="w-6 h-6"
            />
            {!isCollapsed && <span>My Calendar</span>}
          </Link>
        </li>
        <li className={`flex items-center px-5 py-4 ${isActive("/MyDiary") ? "bg-white" : "hover:bg-white"} transition-all duration-300`}>
          <Link to={"/MyDiary"} className="flex items-center space-x-2">
            <img
              src={require("../icons/diary-svgrepo-com.svg").default}
              alt="My Diary Icon"
              className="w-6 h-6"
            />
            {!isCollapsed && <span>My Diary</span>}
          </Link>
        </li>
        <li className={`flex items-center px-5 py-4 ${isActive("/ArchiveComponent") ? "bg-white" : "hover:bg-white"} transition-all duration-300`}>
          <Link to={"/ArchiveComponent"} className="flex items-center space-x-2">
            <img
              src={require("../icons/archive.svg").default}
              alt="My Archive Icon"
              className="w-6 h-6"
            />
            {!isCollapsed && <span>My Archive</span>}
          </Link>
        </li>

        {/* Dropdown Menu for "My List" */}
        <li className={`relative ${activeDropdown === 0 ? "bg-gray-200" : ""}`}>
          <button
            className="flex items-center px-5 py-4 w-full text-left hover:bg-white transition-all duration-300"
            onClick={() => toggleDropdown(0)}
          >
            <span className="mr-auto">My List</span>
            <span>{activeDropdown === 0 ? "v" : ">"}</span>
          </button>
          {activeDropdown === 0 && (
            <ul className="absolute left-0 w-full bg-white shadow-md">
              <li
                className={`px-5 py-2 text-center ${isActive("/Personal") ? "bg-white" : "hover:bg-gray-300"}`}
              >
                <Link to={"/Personal"}>Personal</Link>
              </li>
              <li
                className={`px-5 py-2 text-center ${isActive("/Work") ? "bg-white" : "hover:bg-gray-300"}`}
              >
                <Link to={"/Work"}>Work</Link>
              </li>
              <li
                className={`px-5 py-2 text-center ${isActive("/School") ? "bg-white" : "hover:bg-gray-300"}`}
              >
                <Link to={"/School"}>School</Link>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;