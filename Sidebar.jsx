import React, { useState } from 'react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  return (
    <div
      className={`h-full bg-gradient-to-b from-[#add1c8] via-[#b4d2c8] to-[#e0cbb8] pt-5 fixed shadow-lg transition-all duration-500 ${
        isCollapsed ? 'w-[80px]' : 'w-[250px]'
      }`}
    >
      <div className="px-5 mb-10 flex items-center justify-between">
        <h1
          className={`text-xl font-bold ${
            isCollapsed ? 'hidden' : ''
          } transition-all duration-300`}
        >
          Lifely
        </h1>
        <button
          className="bg-gray-300 text-black p-2 rounded-full"
          onClick={toggleSidebar}
        >
          {isCollapsed ? '<' : '>'}
        </button>
      </div>
      <ul className="list-none mt-5">
        <li className="flex items-center px-5 py-4 hover:bg-white transition-all duration-300">
          <img
            src="assets/icons8-home.svg"
            alt="Home Icon"
            className="w-6 h-6 mr-2"
          />
          {!isCollapsed && <span>Home</span>}
        </li>
        <li className="flex items-center px-5 py-4 hover:bg-white transition-all duration-300">
          <img
            src="assets/myday.svg"
            alt="My Day Icon"
            className="w-6 h-6 mr-2"
          />
          {!isCollapsed && <span>My Day</span>}
        </li>
        <li className="flex items-center px-5 py-4 hover:bg-white transition-all duration-300">
          <img
            src="assets/calendar.svg"
            alt="My Calendar Icon"
            className="w-6 h-6 mr-2"
          />
          {!isCollapsed && <span>My Calendar</span>}
        </li>
        <li className="flex items-center px-5 py-4 hover:bg-white transition-all duration-300">
          <img
            src="assets/diary-svgrepo-com.svg"
            alt="My Diary Icon"
            className="w-6 h-6 mr-2"
          />
          {!isCollapsed && <span>My Diary</span>}
        </li>
        <li className="flex items-center px-5 py-4 hover:bg-white transition-all duration-300">
          <img
            src="assets/archive.svg"
            alt="My Archive Icon"
            className="w-6 h-6 mr-2"
          />
          {!isCollapsed && <span>My Archive</span>}
        </li>
        <li
          className={`relative ${
            activeDropdown === 0 ? 'bg-gray-200' : ''
          }`}
        >
          <button
            className="flex items-center px-5 py-4 w-full text-left hover:bg-white transition-all duration-300"
            onClick={() => toggleDropdown(0)}
          >
            <span className="mr-auto">My List</span>
            <span>{activeDropdown === 0 ? 'v' : '>'}</span>
          </button>
          {activeDropdown === 0 && (
            <ul className="absolute left-0 w-full bg-white shadow-md">
              <li className="px-5 py-2 hover:bg-gray-300">Personal</li>
              <li className="px-5 py-2 hover:bg-gray-300">Work</li>
              <li className="px-5 py-2 hover:bg-gray-300">School</li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
