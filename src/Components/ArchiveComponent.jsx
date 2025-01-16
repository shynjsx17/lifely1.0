import React, { useState, useEffect } from "react";
import Sidebar from "../Navigation/Sidebar";
import { FaUndo, FaTrash, FaCheck } from 'react-icons/fa';
import { taskService } from '../services/taskService';
import Swal from 'sweetalert2';

const ArchiveComponent = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSelectAll, setIsSelectAll] = useState(false);

  // Fetch archived tasks on component mount
  useEffect(() => {
    fetchArchivedTasks();
  }, []);

  const fetchArchivedTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTasks(null, true); // Get archived tasks
      const tasks = response?.data || [];
      setArchivedTasks(tasks.map(task => ({ ...task, isChecked: false })));
    } catch (error) {
      console.error('Error fetching archived tasks:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch archived tasks'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (taskId) => {
    setArchivedTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, isChecked: !task.isChecked } : task
      )
    );
  };

  const handleSelectAll = () => {
    setIsSelectAll(!isSelectAll);
    setArchivedTasks(prevTasks => 
      prevTasks.map(task => ({ ...task, isChecked: !isSelectAll }))
    );
  };

  const handleRestore = async (taskId) => {
    try {
      const result = await Swal.fire({
        title: 'Restore Task?',
        text: "This task will be moved back to your active tasks",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#FFB78B',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, restore it!',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        await taskService.updateTask({
          id: taskId,
          archived: false
        });
        
        await fetchArchivedTasks(); // Refresh the list
        
        Swal.fire({
          title: 'Restored!',
          text: 'Your task has been restored.',
          icon: 'success',
          confirmButtonColor: '#FFB78B'
        });
      }
    } catch (error) {
      console.error('Error restoring task:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to restore task'
      });
    }
  };

  const handleRestoreSelected = async () => {
    const selectedTasks = archivedTasks.filter(task => task.isChecked);
    if (selectedTasks.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Tasks Selected',
        text: 'Please select tasks to restore'
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: 'Restore Selected Tasks?',
        text: `${selectedTasks.length} task(s) will be moved back to active tasks`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#FFB78B',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, restore them!',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        await Promise.all(
          selectedTasks.map(task => 
            taskService.updateTask({
              id: task.id,
              archived: false
            })
          )
        );
        
        await fetchArchivedTasks();
        setIsSelectAll(false);
        
        Swal.fire({
          title: 'Restored!',
          text: 'Selected tasks have been restored.',
          icon: 'success',
          confirmButtonColor: '#FFB78B'
        });
      }
    } catch (error) {
      console.error('Error restoring tasks:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to restore selected tasks'
      });
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const result = await Swal.fire({
        title: 'Delete Task?',
        text: "This action cannot be undone",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await taskService.deleteTask(taskId);
        await fetchArchivedTasks();
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Your task has been deleted.',
          icon: 'success',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete task'
      });
    }
  };

  const handleDeleteSelected = async () => {
    const selectedTasks = archivedTasks.filter(task => task.isChecked);
    if (selectedTasks.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Tasks Selected',
        text: 'Please select tasks to delete'
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: 'Delete Selected Tasks?',
        text: `${selectedTasks.length} task(s) will be permanently deleted. This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete them!'
      });

      if (result.isConfirmed) {
        await Promise.all(
          selectedTasks.map(task => taskService.deleteTask(task.id))
        );
        
        await fetchArchivedTasks();
        setIsSelectAll(false);
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Selected tasks have been deleted.',
          icon: 'success',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      console.error('Error deleting tasks:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete selected tasks'
      });
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-[60px]" : "ml-[250px]"
        }`}
      >
        <div className="p-8 h-full overflow-y-auto">
          <div className="text-left mb-10 font-poppins">
            <h1 className="font-bold text-3xl">Archive</h1>
            <p className="font-bold text-xl text-[#FFB78B]">
              Your archived tasks are stored here
            </p>
          </div>

          {/* Bulk Actions */}
          {!loading && archivedTasks.length > 0 && (
            <div className="mb-6 flex justify-between items-center mx-40">
              <button
                onClick={handleSelectAll}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <FaCheck className="mr-2" />
                {isSelectAll ? 'Deselect All' : 'Select All'}
              </button>
              <div className="space-x-4">
                <button
                  onClick={handleRestoreSelected}
                  className="px-4 py-2 bg-[#FFB78B] text-white rounded-lg hover:bg-[#ffa770] transition-colors flex items-center inline-flex"
                >
                  <FaUndo className="mr-2" />
                  Restore Selected
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center inline-flex"
                >
                  <FaTrash className="mr-2" />
                  Delete Selected
                </button>
              </div>
            </div>
          )}

          {/* Task List */}
          <div className="space-y-4 mb-6">
            {loading ? (
              <div className="text-center text-gray-500 py-8">
                Loading archived tasks...
              </div>
            ) : archivedTasks.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No archived tasks
              </div>
            ) : (
              archivedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between bg-white shadow-md rounded-lg p-3 mx-40"
                >
                  {/* Checkbox */}
                  <div className="flex items-center justify-center mr-4">
                    <input
                      type="checkbox"
                      checked={task.isChecked}
                      onChange={() => handleCheckboxChange(task.id)}
                      className="w-5 h-5 rounded border-gray-300 text-[#FFB78B] focus:ring-[#FFB78B]"
                    />
                  </div>

                  {/* Task content */}
                  <div className="flex flex-col flex-grow">
                    <p className="text-xs text-gray-500">My lists &gt; {task.list_type}</p>
                    <p className={`text-gray-800 font-semibold text-xl ${
                      task.completed ? 'line-through text-gray-400' : ''
                    }`}>
                      {task.title}
                    </p>

                    {/* Tag */}
                    <div className="mt-2 flex">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          task.priority_tag === "High Priority"
                            ? "bg-red-500 text-white"
                            : task.priority_tag === "Medium Priority"
                            ? "bg-yellow-500 text-white"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        {task.priority_tag}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRestore(task.id)}
                      className="px-4 py-2 bg-[#FFB78B] text-white rounded-lg hover:bg-[#ffa770] transition-colors flex items-center"
                    >
                      <FaUndo className="mr-2" />
                      Restore
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                    >
                      <FaTrash className="mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchiveComponent;