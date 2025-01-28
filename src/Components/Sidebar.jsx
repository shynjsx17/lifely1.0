import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(user?.profile_image || null);

  const handleLogout = async () => {
    try {
      // Clear storage first
      sessionStorage.clear();
      localStorage.clear();
      
      // Call logout from auth context
      await logout();
      
      // Double check storage is cleared
      sessionStorage.removeItem('session_token');
      sessionStorage.clear();
      localStorage.clear();
      
      // Force navigation and prevent back
      window.history.pushState(null, '', '/login');
      navigate('/login', { replace: true });
      
      // Force a complete reload after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, ensure we clear everything
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      Swal.fire('Error', 'Please upload a valid image file (JPEG, PNG, or GIF)', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      Swal.fire('Error', 'Image size should be less than 5MB', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('profile_image', file);
      formData.append('user_id', user.id);

      const response = await fetch('http://localhost/lifely1.0/backend/api/update_profile.php', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setProfileImage(data.profile_image_url);
        Swal.fire('Success', 'Profile image updated successfully', 'success');
      } else {
        throw new Error('Failed to update profile image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Swal.fire('Error', 'Failed to update profile image', 'error');
    }
  };

  const handleNameUpdate = async () => {
    if (!newName.trim()) {
      Swal.fire('Error', 'Name cannot be empty', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost/lifely1.0/backend/api/update_profile.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
        },
        body: JSON.stringify({
          user_id: user.id,
          name: newName
        })
      });

      if (response.ok) {
        setIsEditingName(false);
        Swal.fire('Success', 'Name updated successfully', 'success');
      } else {
        throw new Error('Failed to update name');
      }
    } catch (error) {
      console.error('Error updating name:', error);
      Swal.fire('Error', 'Failed to update name', 'error');
    }
  };

  return (
    <div className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 ${
      isCollapsed ? "w-[60px]" : "w-[240px]"
    }`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className={`font-bold text-2xl ${isCollapsed ? "hidden" : "block"}`}>
            Lifely
          </h1>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            {isCollapsed ? "→" : "←"}
          </button>
        </div>

        {/* Profile Section */}
        <div className="mb-6">
          <div className="flex flex-col items-center space-y-2">
            {/* Profile Image */}
            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="relative group"
              >
                <img
                  src={profileImage || require("../icons/default-profile.png")}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Username */}
            {!isCollapsed && (
              <div className="text-center">
                {isEditingName ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="px-2 py-1 border rounded text-sm"
                      placeholder="Enter name"
                    />
                    <button
                      onClick={handleNameUpdate}
                      className="text-green-500 hover:text-green-600"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        setNewName(user?.name || '');
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-1">
                    <span className="font-medium">{user?.name || 'User'}</span>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <nav className="space-y-4">
          <Link
            to="/"
            className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
          >
            <img
              src={require("../icons/home.svg").default}
              alt="Home"
              className="w-6 h-6"
            />
            {!isCollapsed && <span>Home</span>}
          </Link>

          <Link
            to="/diary"
            className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
          >
            <img
              src={require("../icons/diary.svg").default}
              alt="Diary"
              className="w-6 h-6"
            />
            {!isCollapsed && <span>My Diary</span>}
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg text-red-500 w-full"
          >
            <img
              src={require("../icons/logout.svg").default}
              alt="Logout"
              className="w-6 h-6"
            />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar; 