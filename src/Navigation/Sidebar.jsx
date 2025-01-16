import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const [showProfileopen, setShowProfileopen] = useState(false);
  const [setProfile, setProfilepic] = useState(require("../icons/profile.svg").default);
  const [showEditUsername, setShowEditUsername] = useState(false);
  const [editUsername, setEditUsername] = useState(false);
  const [username, setUsername] = useState(user?.userName || 'User');
  const [tempUsername, setTempUsername] = useState("");
  const navigate = useNavigate();
  
  const toggleProfile = (e) => {
    if (e.target.files && e.target.files[0]) {
      const filereader = new FileReader();
      filereader.onload = (event) => {
        setProfilepic(event.target.result);
      };
      filereader.readAsDataURL(e.target.files[0]);
    }
  };

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const isActive = (path) => location.pathname === path;

  const EditSave = () => {
    setUsername(tempUsername);
    setShowEditUsername(false);
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure you want to logout?",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#FB923C",
      cancelButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        // Call the logout function from AuthContext
        logout();
        
        // Show success message
        Swal.fire({
          title: "Logged Out!",
          text: "You have been successfully logged out.",
          icon: "success",
          confirmButtonColor: '#FB923C'
        }).then(() => {
          // Navigate to login page
          navigate('/login');
        });
      }
    });
  };

  return (
    <div
      className={`h-full bg-gradient-to-b from-[#add1c8] via-[#b4d2c8] to-[#e0cbb8] pt-5 fixed shadow-lg transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-[60px]" : "w-[250px]"
      }`}
    >
      {/* Sidebar Header */}
      <div className={`px-4 mb-10 flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
        <img
          src={setProfile}
          alt="Profile"
          className="w-10 h-10 rounded-full cursor-pointer"
          onClick={() => setShowProfileopen(true)}
        />
        {!isCollapsed && (
          <div className="flex-grow">
            <h3 className="text-sm font-semibold">Welcome,</h3>
            <h2 className="text-sm font-normal">{username}</h2>
          </div>
        )}
        <button
          className={`bg-gray-300 text-black p-2 rounded-full hover:bg-gray-400 transition-all ${
            isCollapsed ? 'ml-0' : 'ml-auto'
          }`}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <span className="text-sm font-bold">{isCollapsed ? ">" : "<"}</span>
        </button>
      </div>

      {/* Sidebar Links */}
      <ul className="list-none mt-5">
        <li
          className={`flex items-center px-5 py-4 ${
            isActive("/landing") ? "bg-white" : "hover:bg-white"
          } transition-all duration-300`}
        >
          <Link to={"/Home"} className="flex items-center space-x-2">
            <img
              src={require("../icons/icons8-home.svg").default}
              alt="Home Icon"
              className="w-6 h-6 "
            />
            {!isCollapsed && <span>Home</span>}
          </Link>
        </li>

        {/* Profile pop up */}
        {showProfileopen && (
          <div className="font-poppins fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-system-background rounded-lg w-[30rem] shadow-lg rounded-full">
              <div className="bg-[#F0EFF9] text-black py-2 rounded-t-lg shadow-md">
                <div className="flex items-center justify-between px-4">
                  <div className="flex items-center">
                    <FaArrowLeft size={20} className="mr-2" onClick={() => setShowProfileopen(false)}/>
                  </div>
                  <h2 className="text-lg font-bold text-center flex-1">Profile</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="justify-center items-center flex">
                  <div
                    onClick={() => document.getElementById("fileInput").click()}
                    className="cursor-pointer w-20 h-20 rounded-full overflow-hidden"
                  >
                    <img
                      src={setProfile}
                      alt="Profile"
                      className="w-20 h-20 rounded-full"
                    />
                  </div>
                </div>

                <input
                  type="file"
                  id="fileInput"
                  className="hidden"
                  accept="image/*"
                  onChange={toggleProfile}
                />

                <div className="flex justify-center">
                  <div
                    className="text-center text-base font-semibold hover:underline cursor-pointer"
                    onClick={() => setShowEditUsername(true)}
                  >
                    {username}
                  </div>
                </div>
                <div className="flex justify-center mb-10">
                  <div className="text-center text-sm hover:underline">
                    ({user?.email || 'email@example.com'})
                  </div>
                </div>

                {[
                  { label: "Reset Password", onClick: () => {} },
                  { label: "Delete Account", onClick: () => {} },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center cursor-pointer border-t border-black p-3"
                    onClick={item.onClick}
                  >
                    <div className="text-sm">{item.label}</div>
                    <div className="text-lg font-bold">&gt;</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Edit Username pop up */}
        {showEditUsername && (
          <div className="font-poppins fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 z-50">
            <div className="bg-white rounded-lg w-[30rem] shadow-lg rounded-full">
              <div className="text-base text-center font-semibold p-3 border-b border-gray-300 mb-6">Edit Username</div>
              <div className="flex justify-center">
                <div className="flex justify-center">
                  <input
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    className="w-80 h-10 border border-gray-300 rounded px-2"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center border-gray-200 pt-4">
                <button
                  onClick={() => setShowEditUsername(false)}
                  className="w-1/2 py-2 text-sm text-gray-700 bg-[#F0EFF9] rounded-bl-lg hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={EditSave}
                  className="w-1/2 py-2 text-sm text-[#1E76E8] bg-[#F0EFF9] rounded-br-lg hover:bg-gray-300 transition-all"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        <li
          className={`flex items-center px-5 py-4 ${
            isActive("/MyDay") ? "bg-white" : "hover:bg-white"
          } transition-all duration-300`}
        >
          <Link to={"/MyDay"} className="flex items-center space-x-2">
            <img
              src={require("../icons/list.svg").default}
              alt="My Day Icon"
              className="w-6 h-6"
            />
            {!isCollapsed && <span>My Day</span>}
          </Link>
        </li>

        <li
          className={`flex items-center px-5 py-4 ${
            isActive("/MyCalendar") ? "bg-white" : "hover:bg-white"
          } transition-all duration-300`}
        >
          <Link to={"/MyCalendar"} className="flex items-center space-x-2">
            <img
              src={require("../icons/calendar.svg").default}
              alt="My Calendar Icon"
              className="w-6 h-6"
            />
            {!isCollapsed && <span>My Calendar</span>}
          </Link>
        </li>

        <li
          className={`flex items-center px-5 py-4 ${
            isActive("/MyDiary") ? "bg-white" : "hover:bg-white"
          } transition-all duration-300`}
        >
          <Link to={"/MyDiary"} className="flex items-center space-x-2">
            <img
              src={require("../icons/diary.svg").default}
              alt="My Diary Icon"
              className="w-6 h-6"
            />
            {!isCollapsed && <span>My Diary</span>}
          </Link>
        </li>

        <li
          className={`flex items-center px-5 py-4 ${
            isActive("/ArchiveComponent") ? "bg-white" : "hover:bg-white"
          } transition-all duration-300`}
        >
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
                className={`px-5 py-2 text-center ${
                  isActive("/Personal") ? "bg-white" : "hover:bg-gray-300"
                }`}
              >
                <Link to={"/Personal"}>Personal</Link>
              </li>
              <li
                className={`px-5 py-2 text-center ${
                  isActive("/Work") ? "bg-white" : "hover:bg-gray-300"
                }`}
              >
                <Link to={"/Work"}>Work</Link>
              </li>
              <li
                className={`px-5 py-2 text-center ${
                  isActive("/School") ? "bg-white" : "hover:bg-gray-300"
                }`}
              >
                <Link to={"/School"}>School</Link>
              </li>
            </ul>
          )}
        </li>
      </ul>

      {/* Logout Button */}
      <div className="absolute bottom-5 w-full px-3">
        <button
          onClick={handleLogout}
          className={`w-full py-2 px-3 text-black hover:bg-white/30 rounded-lg transition-all duration-300 flex items-center ${
            isCollapsed ? "justify-center" : "justify-start"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className={`ml-2 ${isCollapsed ? "hidden" : "block"}`}>
            Logout
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;