import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const [showProfileopen, setShowProfileopen] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [setProfile, setProfilepic] = useState(require("../icons/profile.svg").default);
  const [showEditUsername, setShowEditUsername] = useState(false);
  const [editUsername, setEditUsername] = useState(false);
  const [username, setUsername] = useState(user?.userName || 'User');
  const [tempUsername, setTempUsername] = useState("");
  const navigate = useNavigate();
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
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
  }

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
        localStorage.removeItem('token');
        Swal.fire({
          title: "Logged Out!",
          text: "You have been successfully logged out.",
          icon: "success",
          confirmButtonColor: '#FB923C'
        }).then(() => {
          navigate('/login');
        });
      }
    });
  };

  const handleResetPassword = async () => {
    try {
      const response = await fetch('http://localhost/lifely1.0/backend/api/reset_password.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.email
        })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        Swal.fire({
          title: 'Success!',
          text: data.message,
          icon: 'success',
          confirmButtonColor: '#FB923C'
        });
        setShowResetPassword(false);
      } else {
        Swal.fire({
          title: 'Error!',
          text: data.message,
          icon: 'error',
          confirmButtonColor: '#FB923C'
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Something went wrong. Please try again.',
        icon: 'error',
        confirmButtonColor: '#FB923C'
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('http://localhost/lifely1.0/backend/api/delete_account.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id,
          password: deletePassword
        })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        localStorage.removeItem('token');
        Swal.fire({
          title: 'Account Deleted',
          text: 'Your account has been successfully deleted.',
          icon: 'success',
          confirmButtonColor: '#FB923C'
        }).then(() => {
          navigate('/');
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: data.message,
          icon: 'error',
          confirmButtonColor: '#FB923C'
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Something went wrong. Please try again.',
        icon: 'error',
        confirmButtonColor: '#FB923C'
      });
    }
  };

  return (
    <div
      className={`h-screen bg-gradient-to-b from-[#add1c8] via-[#b4d2c8] to-[#e0cbb8] pt-5 fixed left-0 top-0 shadow-lg transition-all duration-500 z-50 ${
        isCollapsed ? "w-[60px]" : "w-[240px]"
      }`}
    >
      {/* Sidebar Header */}
      <div className="px-4 mb-10 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center">
            <img
              src={setProfile}
              alt="Profile"
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={() => setShowProfileopen(true)}
            />
            <div className="ml-3">
              <h3 className="text-sm font-semibold">Welcome,</h3>
              <h2 className="text-sm font-normal">{user?.username || 'User'}</h2>
            </div>
          </div>
        )}
        <button
          className={`bg-gray-300 text-black p-1 rounded-full hover:bg-gray-400 transition-colors ${isCollapsed ? 'ml-2' : 'ml-auto'}`}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            {isCollapsed ? (
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H16a1 1 0 110 2H4.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            )}
          </svg>
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
        <li
          className={`flex items-center px-5 py-4 ${
            isActive("/MyCalendar") ? "bg-white" : "hover:bg-white"
          } transition-all duration-300`}
        >
          <Link to="/MyCalendar" className="flex items-center space-x-2">
            <FaCalendarAlt className="w-6 h-6" />
            {!isCollapsed && <span>My Calendar</span>}
          </Link>
        </li>
        {/*Profile pop up */}
        {
          showProfileopen && (
             <div  className="font-poppins fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                 <div className="bg-system-background rounded-lg w-[30rem] shadow-lg rounded-full">
                 <div className="bg-[#F0EFF9] text-black py-2 rounded-t-lg shadow-md">
                  <div className="flex items-center justify-between px-4">
                    {/* Left Aligned Arrow Icon */}
                    <div className="flex items-center">
                      <FaArrowLeft size={20} className="mr-2" onClick={() => setShowProfileopen(false)}/> {/* Left Arrow Icon */}
                    </div>

                    {/* Centered Text */}
                    <h2 className="text-lg font-bold text-center flex-1">Profile</h2>
                  </div>
                </div>
                <div className="p-6">
                  {/* Profile Image */}
                  <div className="justify-center items-center flex">
                    <div
                      onClick={() => document.getElementById("fileInput").click()} // Trigger file input when clicked
                      className="cursor-pointer w-20 h-20 rounded-full overflow-hidden"
                    >
                      <img
                        src={setProfile} // Replace with the actual path to your profile image
                        alt="Profile"
                        className="w-20 h-20 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Hidden File Input */}
                            <input
                            type="file"
                            id="fileInput"
                            className="hidden"
                            accept="image/*"
                            onChange={toggleProfile}
                            />

                            {/* Username Section */}
                            <div className="flex justify-center">
                            <div
                              className="text-center text-base font-semibold hover:underline cursor-pointer"
                              onClick={() => setShowEditUsername(true)}
                              
                            >
                              {user?.username || 'User'}
                            </div>
                            </div>
                            <div className="flex justify-center mb-10">
                            <div className="text-center text-sm hover:underline">
                              ({user?.email || 'email@example.com'})
                            </div>
                            </div>

                            {/* Options */}
                  {[
                    { label: "Reset Password", onClick: () => setShowResetPassword(true) },
                    { label: "Delete Account", onClick: () => setShowDeleteAccount(true) },
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
          {/*Edit Username pop up*/}
          {showEditUsername && (
            <div  className="font-poppins fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 z-50">
              <div className="bg-white rounded-lg w-[30rem] shadow-lg rounded-full">
                <div className="text-base text-center font-semibold p-3 border-b border-gray-300 mb-6">Edit Username</div>
                <div className="flex justify-center">
                <div className="flex justify-center">
              <input
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)} // Update temp username
                className="w-80 h-10 border border-gray-300 rounded px-2"
              />
            </div>
                </div>
                {/*buttons*/}
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
          {showResetPassword && (
            <div className="font-poppins fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
              <div className="bg-white rounded-lg w-[30rem] shadow-lg">
                <div className="bg-[#F0EFF9] text-black py-2 rounded-t-lg shadow-md">
                  <div className="flex items-center justify-between px-4">
                    <div className="flex items-center">
                      <FaArrowLeft size={20} className="mr-2 cursor-pointer" onClick={() => setShowResetPassword(false)}/>
                    </div>
                    <h2 className="text-lg font-bold text-center flex-1">Reset Password</h2>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-center mb-4">We will send instructions to this email address:</p>
                  <p className="text-center font-semibold mb-6">{user?.email}</p>
                  <button
                    onClick={handleResetPassword}
                    className="w-full py-3 bg-[#FB923C] text-white rounded-lg hover:bg-[#FB923C]/90 transition-all"
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            </div>
          )}
          {showDeleteAccount && (
            <div className="font-poppins fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
              <div className="bg-white rounded-lg w-[30rem] shadow-lg">
                <div className="bg-[#F0EFF9] text-black py-2 rounded-t-lg shadow-md">
                  <div className="flex items-center justify-between px-4">
                    <div className="flex items-center">
                      <FaArrowLeft size={20} className="mr-2 cursor-pointer" onClick={() => setShowDeleteAccount(false)}/>
                    </div>
                    <h2 className="text-lg font-bold text-center flex-1">Delete Account</h2>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-center text-red-500 mb-6">
                    This will permanently delete all of your tasks & history. You can't Undo this
                  </p>
                  <div className="relative mb-4">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FB923C]"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  <div className="text-center mb-4">
                    <span className="text-sm text-gray-600">In case you haven't set a password yet or forgot yours</span>
                    <br />
                    <button
                      onClick={() => {
                        setShowDeleteAccount(false);
                        setShowResetPassword(true);
                      }}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Set Password
                    </button>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                  >
                    Delete Account
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

        {/* My List Dropdown */}
        <li className={`relative ${activeDropdown === 0 ? "bg-gray-200" : ""}`}>
          <button
            className="flex items-center px-5 py-4 w-full text-left hover:bg-white transition-all duration-300"
            onClick={() => toggleDropdown(0)}
          >
            {isCollapsed ? (
              <img
                src={require("../icons/edit.svg").default}
                alt="My List"
                className="w-6 h-6"
              />
            ) : (
              <>
                <span className="mr-auto">My List</span>
                <span>{activeDropdown === 0 ? "v" : ">"}</span>
              </>
            )}
          </button>
          {activeDropdown === 0 && (
            <ul className={`${
              isCollapsed 
                ? "absolute left-full top-0 ml-1" 
                : "absolute left-0 w-full"
              } bg-white shadow-md rounded-md overflow-hidden`}
          >
              <li className="px-5 py-2 text-center hover:bg-gray-100">
                <Link to="/lists/personal" className="block w-full">Personal</Link>
              </li>
              <li className="px-5 py-2 text-center hover:bg-gray-100">
                <Link to="/lists/work" className="block w-full">Work</Link>
              </li>
              <li className="px-5 py-2 text-center hover:bg-gray-100">
                <Link to="/lists/school" className="block w-full">School</Link>
              </li>
            </ul>
          )}
        </li>
      </ul>
        {/* Logout Button - Add this at the bottom of your sidebar */}
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
