import React, { useState, useEffect } from 'react';
import Sidebar from '../Navigation/Sidebar';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const ArchiveComponent = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [archivedDiaries, setArchivedDiaries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");

  // Fetch archived tasks
  const fetchArchivedTasks = async () => {
    try {
      console.log('Fetching archived tasks...'); // Debug log
      const response = await fetch('http://localhost/lifely1.0/backend/api/tasks.php?archived=true', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Archived tasks response:', data); // Debug log
      if (data.success) {
        // Make sure we only get archived tasks
        const archivedOnly = data.tasks || [];
        setArchivedTasks(archivedOnly);
      } else {
        console.error('Failed to fetch archived tasks:', data.message);
        setArchivedTasks([]);
      }
    } catch (error) {
      console.error('Error fetching archived tasks:', error);
      setArchivedTasks([]);
    }
  };

  // Fetch archived diaries
  const fetchArchivedDiaries = async () => {
    try {
      const response = await fetch('http://localhost/lifely1.0/backend/api/diary.php?archived=true', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Archived diaries response:', data); // Debug log
      if (data.status === 'success') {
        setArchivedDiaries(data.data.entries || []);
      } else {
        console.error('Failed to fetch archived diaries:', data.message);
        setArchivedDiaries([]);
      }
    } catch (error) {
      console.error('Error fetching archived diaries:', error);
      setArchivedDiaries([]);
    }
  };

  useEffect(() => {
    fetchArchivedTasks();
    fetchArchivedDiaries();
  }, []);

  // Handle unarchive task
  const handleUnarchiveTask = async (taskId) => {
    const result = await Swal.fire({
      title: 'Restore Task',
      text: 'Are you sure you want to restore this task?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#FB923C',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?id=${taskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
          },
          body: JSON.stringify({
            is_archived: false
          })
        });

        if (response.ok) {
          setArchivedTasks(prev => prev.filter(task => task.id !== taskId));
          Swal.fire(
            'Restored!',
            'Your task has been restored successfully.',
            'success'
          );
        }
      } catch (error) {
        console.error('Error unarchiving task:', error);
        Swal.fire(
          'Error!',
          'Failed to restore the task. Please try again.',
          'error'
        );
      }
    }
  };

  // Handle delete task
  const handleDeleteTask = async (taskId) => {
    const result = await Swal.fire({
      title: 'Delete Task',
      text: 'Are you sure you want to delete this task? This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FB923C',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?id=${taskId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
          }
        });

        if (response.ok) {
          setArchivedTasks(prev => prev.filter(task => task.id !== taskId));
          Swal.fire(
            'Deleted!',
            'Your task has been deleted successfully.',
            'success'
          );
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        Swal.fire(
          'Error!',
          'Failed to delete the task. Please try again.',
          'error'
        );
      }
    }
  };

  // Handle unarchive diary
  const handleUnarchiveDiary = async (entryId) => {
    const result = await Swal.fire({
      title: 'Restore Diary Entry',
      text: 'Are you sure you want to restore this diary entry?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#FB923C',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch('http://localhost/lifely1.0/backend/api/diary.php', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
          },
          body: JSON.stringify({
            id: entryId,
            is_archived: false
          })
        });

        if (response.ok) {
          setArchivedDiaries(prev => prev.filter(entry => entry.id !== entryId));
          Swal.fire(
            'Restored!',
            'Your diary entry has been restored successfully.',
            'success'
          );
        }
      } catch (error) {
        console.error('Error unarchiving diary:', error);
        Swal.fire(
          'Error!',
          'Failed to restore the diary entry. Please try again.',
          'error'
        );
      }
    }
  };

  // Handle delete diary
  const handleDeleteDiary = async (entryId) => {
    const result = await Swal.fire({
      title: 'Delete Diary Entry',
      text: 'Are you sure you want to delete this diary entry? This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FB923C',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch('http://localhost/lifely1.0/backend/api/diary.php', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
          },
          body: JSON.stringify({
            id: entryId
          })
        });

        if (response.ok) {
          setArchivedDiaries(prev => prev.filter(entry => entry.id !== entryId));
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Your diary entry has been deleted successfully.',
            confirmButtonColor: '#FB923C'
          });
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete diary entry');
        }
      } catch (error) {
        console.error('Error deleting diary:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to delete the diary entry. Please try again.',
          confirmButtonColor: '#FB923C'
        });
      }
    }
  };

  // Handle restore all
  const handleRestoreAll = async () => {
    const itemType = activeTab === 'tasks' ? 'tasks' : 'diary entries';
    
    const result = await Swal.fire({
      title: 'Restore All',
      text: `Are you sure you want to restore all archived ${itemType}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#FB923C',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore all!'
    });
  
    if (result.isConfirmed) {
      try {
        if (activeTab === 'tasks') {
          await Promise.all(archivedTasks.map(task => 
            fetch(`http://localhost/lifely1.0/backend/api/tasks.php?id=${task.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
              },
              body: JSON.stringify({
                is_archived: false
              })
            })
          ));
          setArchivedTasks([]);
          
          Swal.fire(
            'Restored!',
            'All tasks have been restored successfully.',
            'success'
          );
        } else {
          await Promise.all(archivedDiaries.map(entry =>
            fetch('http://localhost/lifely1.0/backend/api/diary.php', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
              },
              body: JSON.stringify({
                id: entry.id,
                is_archived: false
              })
            })
          ));
          setArchivedDiaries([]);
          
          Swal.fire(
            'Restored!',
            'All diary entries have been restored successfully.',
            'success'
          );
        }
      } catch (error) {
        console.error('Error restoring all items:', error);
        Swal.fire(
          'Error!',
          `Failed to restore all ${itemType}. Please try again.`,
          'error'
        );
      }
    }
  };
  

  // Handle delete all
  const handleDeleteAll = async () => {
    const itemType = activeTab === 'tasks' ? 'tasks' : 'diary entries';
    
    const result = await Swal.fire({
      title: 'Delete All',
      text: `Are you sure you want to delete all archived ${itemType}? This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FB923C',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete all!'
    });

    if (result.isConfirmed) {
      try {
        if (activeTab === 'tasks') {
          // Delete all archived tasks
          const promises = archivedTasks.map(task =>
            fetch(`http://localhost/lifely1.0/backend/api/tasks.php?id=${task.id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
              }
            })
          );
          await Promise.all(promises);
          setArchivedTasks([]);
          Swal.fire(
            'Deleted!',
            'All archived tasks have been deleted successfully.',
            'success'
          );
        } else {
          // Delete all archived diaries
          const promises = archivedDiaries.map(entry =>
            fetch('http://localhost/lifely1.0/backend/api/diary.php', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
              },
              body: JSON.stringify({
                id: entry.id
              })
            })
          );
          await Promise.all(promises);
          setArchivedDiaries([]);
          Swal.fire(
            'Deleted!',
            'All archived diary entries have been deleted successfully.',
            'success'
          );
        }
      } catch (error) {
        console.error('Error deleting all items:', error);
        Swal.fire(
          'Error!',
          `Failed to delete all ${itemType}. Please try again.`,
          'error'
        );
      }
    }
  };

  // Add the search handler function
  const handleSearchChange = (e) => {
    const value = e.target.value;
    
    if (value === "") {
      setSearchQuery("");
      setSearchError("");
      return;
    }
    
    if (value.length < 2) {
      setSearchError("Search must be at least 2 characters");
    } else if (value.length > 50) {
      setSearchError("Search cannot exceed 50 characters");
      return;
    } else {
      setSearchError("");
    }
    
    setSearchQuery(value);
  };

  // Add the filtering function
  const getFilteredItems = () => {
    if (searchQuery.trim().length < 2) {
      return activeTab === 'tasks' ? archivedTasks : archivedDiaries;
    }

    const query = searchQuery.toLowerCase();
    
    if (activeTab === 'tasks') {
      return archivedTasks.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.list_type.toLowerCase().includes(query) ||
        task.priority.toLowerCase().includes(query)
      );
    } else {
      return archivedDiaries.filter(diary => 
        diary.title.toLowerCase().includes(query)
      );
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
      />
      <div className={`flex-1 transition-all duration-300 ${
        isSidebarCollapsed ? "ml-[60px]" : "ml-[240px]"
      } p-4 md:p-8 bg-system-background bg-no-repeat bg-fixed font-poppins overflow-y-auto`}>
        <div className="text-left mb-6 md:mb-10">
          <h1 className="font-bold text-2xl md:text-3xl">My Archive</h1>
        </div>

        {/* Tab Buttons and Search Section - Made responsive */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          {/* Tab Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 md:px-6 py-2 rounded-lg text-sm md:text-base ${
                activeTab === 'tasks' 
                  ? 'bg-white text-gray-800 shadow-md' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              My Day
            </button>
            <button
              onClick={() => setActiveTab('diaries')}
              className={`px-4 md:px-6 py-2 rounded-lg text-sm md:text-base ${
                activeTab === 'diaries' 
                  ? 'bg-white text-gray-800 shadow-md' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              My Diary
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              maxLength={50}
              className={`w-full pl-10 pr-4 py-2 rounded-full border text-sm ${
                searchError ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:border-gray-400 focus:ring-0`}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg
                className={`w-5 h-5 ${searchError ? 'text-red-500' : 'text-gray-400'}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchError && (
              <div className="absolute -bottom-6 left-0 text-red-500 text-xs">
                {searchError}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 md:space-x-4 mb-6">
          <button
            onClick={handleRestoreAll}
            className="px-3 md:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm md:text-base"
            disabled={activeTab === 'tasks' ? archivedTasks.length === 0 : archivedDiaries.length === 0}
          >
            Restore All
          </button>
          <button
            onClick={handleDeleteAll}
            className="px-3 md:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-sm md:text-base"
            disabled={activeTab === 'tasks' ? archivedTasks.length === 0 : archivedDiaries.length === 0}
          >
            Delete All
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          {activeTab === 'tasks' ? (
            <div className="space-y-3 md:space-y-4">
              {getFilteredItems().length > 0 ? (
                getFilteredItems().map((task) => (
                  <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg gap-3 sm:gap-0">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-xs md:text-sm text-gray-500">
                          My lists &gt; {task.list_type.charAt(0).toUpperCase() + task.list_type.slice(1)}
                        </p>
                        <h3 className="font-semibold text-sm md:text-base">{task.title}</h3>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:justify-end">
                      <button
                        onClick={() => handleUnarchiveTask(task.id)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex justify-center items-center py-8">
                  <p className="text-gray-500 text-lg">No Archived Tasks yet.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {getFilteredItems().length > 0 ? (
                getFilteredItems().map((entry) => (
                  <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg gap-3 sm:gap-0">
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <h3 className="font-semibold text-sm md:text-base">{entry.title}</h3>
                    </div>
                    <div className="flex items-center space-x-2 sm:justify-end">
                      <button
                        onClick={() => handleUnarchiveDiary(entry.id)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteDiary(entry.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex justify-center items-center py-8">
                  <p className="text-gray-500 text-lg">No Archived Diary Entries yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArchiveComponent;