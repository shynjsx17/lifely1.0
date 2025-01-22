import React, { useState, useEffect } from 'react';
import Sidebar from '../Navigation/Sidebar';
import { useAuth } from '../context/AuthContext';

const ArchiveComponent = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [archivedDiaries, setArchivedDiaries] = useState([]);

  // Fetch archived tasks
  const fetchArchivedTasks = async () => {
    try {
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
        const archivedOnly = (data.tasks || []).filter(task => task.is_archived === true);
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
        // Remove the task from the archived list immediately
        setArchivedTasks(prev => prev.filter(task => task.id !== taskId));
      }
    } catch (error) {
      console.error('Error unarchiving task:', error);
    }
  };

  // Handle delete task
  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?id=${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
        }
      });

      if (response.ok) {
        fetchArchivedTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Handle unarchive diary
  const handleUnarchiveDiary = async (entryId) => {
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
        // Remove the diary entry from the archived list immediately
        setArchivedDiaries(prev => prev.filter(entry => entry.id !== entryId));
      }
    } catch (error) {
      console.error('Error unarchiving diary:', error);
    }
  };

  // Handle delete diary
  const handleDeleteDiary = async (entryId) => {
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
        fetchArchivedDiaries();
      }
    } catch (error) {
      console.error('Error deleting diary:', error);
    }
  };

  // Handle restore all
  const handleRestoreAll = async () => {
    try {
      if (activeTab === 'tasks') {
        // Restore all archived tasks
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
        // Clear the archived tasks list
        setArchivedTasks([]);
      } else {
        // Restore all archived diaries
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
        // Clear the archived diaries list
        setArchivedDiaries([]);
      }
    } catch (error) {
      console.error('Error restoring all items:', error);
    }
  };

  // Handle delete all
  const handleDeleteAll = async () => {
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
        fetchArchivedTasks();
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
        fetchArchivedDiaries();
      }
    } catch (error) {
      console.error('Error deleting all items:', error);
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
      } p-8 bg-system-background bg-no-repeat bg-fixed`}>
        <div className="text-left mb-10">
          <h1 className="font-bold text-3xl">My Archive</h1>
        </div>

        {/* Tab Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-2 rounded-lg ${
              activeTab === 'tasks' 
                ? 'bg-white text-gray-800 shadow-md' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            My Day
          </button>
          <button
            onClick={() => setActiveTab('diaries')}
            className={`px-6 py-2 rounded-lg ${
              activeTab === 'diaries' 
                ? 'bg-white text-gray-800 shadow-md' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            My Diary
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mb-6">
          <button
            onClick={handleRestoreAll}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            disabled={activeTab === 'tasks' ? archivedTasks.length === 0 : archivedDiaries.length === 0}
          >
            Restore All
          </button>
          <button
            onClick={handleDeleteAll}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            disabled={activeTab === 'tasks' ? archivedTasks.length === 0 : archivedDiaries.length === 0}
          >
            Delete All
          </button>
      </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'tasks' ? (
            <div className="space-y-4">
              {archivedTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                      className="w-5 h-5 rounded border-gray-300"
                      checked={task.is_completed}
                      readOnly
                    />
                    <div>
                      <p className="text-sm text-gray-500">
                        My lists &gt; {task.list_type.charAt(0).toUpperCase() + task.list_type.slice(1)}
                      </p>
                      <h3 className="font-semibold">{task.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
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
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {archivedDiaries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <h3 className="font-semibold">{entry.title}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
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
              ))}
            </div>
          )}
        </div>
    </div>
    </div>
  );
};

export default ArchiveComponent;