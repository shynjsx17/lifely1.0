import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, token, updateUser, logout } = useAuth();
  console.log('Auth Context:', { user, token }); // Debug log
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const [showProfileopen, setShowProfileopen] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(require("../icons/profile.svg").default);
  const [showEditUsername, setShowEditUsername] = useState(false);
  const [editUsername, setEditUsername] = useState(false);
  const [username, setUsername] = useState(user?.username || 'User');
  const [tempUsername, setTempUsername] = useState("");
  const navigate = useNavigate();
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Fetch profile image on component mount and when token changes
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!token) return;

      try {
        const response = await fetch('http://localhost/lifely1.0/backend/api/ProfileController.php?action=get_image', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (data.status === 'success' && data.profile_image) {
          // If the image path is relative, prepend the base URL
          const imageUrl = data.profile_image.startsWith('http') 
            ? data.profile_image 
            : `http://localhost/lifely1.0/backend/${data.profile_image}`;
          setProfileImage(imageUrl);
        }
      } catch (error) {
        console.error('Failed to fetch profile image:', error);
      }
    };

    fetchProfileImage();
  }, [token]);

  const getAccessToken = () => {
    // Get token from auth context
    if (token) {
        return token;
    }
    return null;
  };

  const toggleProfile = async (e) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const accessToken = token;
        
        if (!accessToken) {
            Swal.fire({
                title: 'Error!',
                text: 'You must be logged in to update your profile',
                icon: 'error',
                confirmButtonColor: '#FB923C'
            });
            return;
        }

        // Create FormData object
        const formData = new FormData();
        formData.append('profile_image', file);

        try {
            const response = await fetch('http://localhost/lifely1.0/backend/api/ProfileController.php?action=update_image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();

            if (data.status === 'success') {
                // If the image path is relative, prepend the base URL
                const imageUrl = data.profile_image.startsWith('http') 
                  ? data.profile_image 
                  : `http://localhost/lifely1.0/backend/${data.profile_image}`;
                setProfileImage(imageUrl);
                
                Swal.fire({
                    title: 'Success!',
                    text: 'Profile image updated successfully',
                    icon: 'success',
                    confirmButtonColor: '#FB923C'
                });
            } else {
                throw new Error(data.message || 'Failed to update profile image');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            Swal.fire({
                title: 'Error!',
                text: error.message || 'Failed to update profile image',
                icon: 'error',
                confirmButtonColor: '#FB923C'
            });
        }
    }
  };

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const isActive = (path) => location.pathname === path;

  const EditSave = async () => {
    try {
        const accessToken = token;
        
        if (!accessToken) {
            Swal.fire({
                title: 'Error!',
                text: 'You must be logged in to update your username',
                icon: 'error',
                confirmButtonColor: '#FB923C'
            });
            return;
        }

        const response = await fetch('http://localhost/lifely1.0/backend/api/ProfileController.php?action=update_username', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ username: tempUsername }),
            credentials: 'include'
        });

        const data = await response.json();

        if (data.status === 'success') {
            // Update both local state and auth context
            setUsername(tempUsername);
            updateUser({ ...user, username: tempUsername });
            setShowEditUsername(false);
            
            Swal.fire({
                title: 'Success!',
                text: 'Username updated successfully',
                icon: 'success',
                confirmButtonColor: '#FB923C'
            });
        } else {
            throw new Error(data.message || 'Failed to update username');
        }
    } catch (error) {
        console.error('Username update error:', error);
        Swal.fire({
            title: 'Error!',
            text: error.message || 'Failed to update username',
            icon: 'error',
            confirmButtonColor: '#FB923C'
        });
    }
  };

  // Update username state when user prop changes
  useEffect(() => {
    setUsername(user?.username || 'User');
  }, [user?.username]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure you want to logout?",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#FB923C",
      cancelButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      try {
        // Call the AuthContext logout function
        await logout();
        
        // Double check storage is cleared
        sessionStorage.clear();
        localStorage.clear();

        await Swal.fire({
          title: "Logged Out!",
          text: "You have been successfully logged out.",
          icon: "success",
          confirmButtonColor: '#FB923C',
          timer: 1500,
          showConfirmButton: false
        });

        // Force navigation and reload
        window.location.replace('/login');
      } catch (error) {
        console.error('Logout error:', error);
        // Even if there's an error, ensure we clear everything
        sessionStorage.clear();
        localStorage.clear();
        window.location.replace('/login');
      }
    }
  };

  const handleResetPassword = async () => {
    try {
      // Show loading state
      Swal.fire({
        title: 'Sending...',
        text: 'Sending reset password email',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch('http://localhost/lifely1.0/backend/api/reset_password.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: user?.email
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        setShowResetPassword(false);
        Swal.fire({
          icon: 'success',
          title: 'Email Sent',
          text: 'Please check your email for password reset instructions.',
          confirmButtonColor: '#FB923C'
        });
      } else {
        throw new Error(data.message || 'Failed to send reset password email');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to send reset password email. Please try again.',
        confirmButtonColor: '#FB923C'
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // First confirm with the user
      const confirmResult = await Swal.fire({
        title: 'Are you sure?',
        text: "This action cannot be undone. All your data will be permanently deleted.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete my account',
        cancelButtonText: 'Cancel'
      });

      if (!confirmResult.isConfirmed) {
        return;
      }

      // Show loading state
      Swal.fire({
        title: 'Processing...',
        text: 'Deleting your account',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch('http://localhost/lifely1.0/backend/api/delete_account.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: user?.id,
          password: deletePassword
        })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        // Clear all user data from local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        await Swal.fire({
          icon: 'success',
          title: 'Account Deleted',
          text: 'Your account has been successfully deleted. We\'re sorry to see you go.',
          confirmButtonColor: '#FB923C'
        });
        
        navigate('/');
      } else {
        throw new Error(data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to delete account. Please try again.',
        confirmButtonColor: '#FB923C'
      });
    } finally {
      setDeletePassword('');
      setShowDeleteAccount(false);
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
              src={profileImage}
              alt="Profile"
              className="w-10 h-10 rounded-full cursor-pointer object-cover"
              onClick={() => setShowProfileopen(true)}
            />
            <div className="ml-3">
              <h3 className="text-sm font-semibold">Welcome,</h3>
              <h2 className="text-sm font-normal">{username}</h2>
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
            isActive("/Home") ? "bg-white" : "hover:bg-white"
          } transition-all duration-300`}
        >
          <Link to="/Home" className="flex items-center space-x-2">
            <img
              src={require("../icons/icons8-home.svg").default}
              alt="Home Icon"
              className="w-6 h-6"
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
             <div className="font-poppins fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                 <div className="bg-white rounded-lg w-[30rem] shadow-lg">
                 <div className="bg-[#F0EFF9] text-black py-2 rounded-t-lg shadow-md">
                  <div className="flex items-center justify-between px-4">
                    {/* Left Aligned Arrow Icon */}
                    <div className="flex items-center">
                      <FaArrowLeft size={20} className="mr-2 cursor-pointer" onClick={() => setShowProfileopen(false)}/>
                    </div>

                    {/* Centered Text */}
                    <h2 className="text-lg font-bold text-center flex-1">Profile</h2>
                  </div>
                </div>
                <div className="p-6">
                  {/* Profile Image */}
                  <div className="justify-center items-center flex">
                    <div
                      onClick={() => document.getElementById("fileInput").click()}
                      className="cursor-pointer w-20 h-20 rounded-full overflow-hidden relative group"
                    >
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm">Change Photo</span>
                      </div>
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
                            <div className="flex justify-center mt-4">
                            <div
                              className="text-center text-base font-semibold hover:underline cursor-pointer"
                              onClick={() => setShowEditUsername(true)}
                              
                            >
                              {username}
                            </div>
                            </div>
                            <div className="flex justify-center mb-10">
                            <div className="text-center text-sm text-gray-500">
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
                      className="flex justify-between items-center cursor-pointer border-t border-gray-200 p-3 hover:bg-gray-50 transition-colors"
                      onClick={item.onClick}
                    >
                      <div className="text-sm">{item.label}</div>
                      <div className="text-lg font-bold text-gray-400">&gt;</div>
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
          <Link to="/MyDay" className="flex items-center space-x-2">
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
          <Link to="/MyDiary" className="flex items-center space-x-2">
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
          <Link to="/ArchiveComponent" className="flex items-center space-x-2">
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
