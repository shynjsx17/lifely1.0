import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaRegBell } from 'react-icons/fa';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import Sidebar from '../Navigation/Sidebar';
import { useAuth } from '../context/AuthContext';
import Calendar from 'react-calendar';

const ListComponent = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { listType } = useParams();
    const [selectedTask, setSelectedTask] = useState(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [newTask, setNewTask] = useState("");
    const { user } = useAuth();
    const [newSubtaskText, setNewSubtaskText] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentNote, setCurrentNote] = useState("");
    const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
    const [showListDropdown, setShowListDropdown] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, [listType]);

    useEffect(() => {
        if (selectedTask) {
            setCurrentNote(selectedTask.note || "");
        }
    }, [selectedTask]);

    const fetchTasks = async () => {
        try {
            const token = sessionStorage.getItem('session_token');
            console.log('Using token:', token);

            const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?list_type=${listType}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Full API response:', data);

            if (data.success && Array.isArray(data.tasks)) {
                const nonArchivedTasks = data.tasks.filter(task => !task.is_archived);
                setTasks(nonArchivedTasks);
            } else {
                console.error('Invalid response format or empty tasks:', data);
                setTasks([]);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async () => {
        if (newTask.trim()) {
            try {
                const response = await fetch('http://localhost/lifely1.0/backend/api/tasks.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
                    },
                    body: JSON.stringify({
                        title: newTask,
                        list_type: listType,
                        priority: 'low',
                        description: '',
                        is_archived: false
                    })
                });

                const data = await response.json();
                if (data.success) {
                    fetchTasks();
                    setNewTask("");
                }
            } catch (error) {
                console.error('Error adding task:', error);
            }
        }
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
    };

    const handleAddSubtask = async (taskId) => {
        if (newSubtaskText.trim()) {
            try {
                const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?subtask=true&task_id=${taskId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
                    },
                    body: JSON.stringify({
                        title: newSubtaskText,
                        task_id: taskId
                    })
                });

                const data = await response.json();
                console.log('Add subtask response:', data); // Debug log
                if (data.success) {
                    setNewSubtaskText("");
                    // Update the selected task with the new subtask
                    const updatedTask = {
                        ...selectedTask,
                        subtasks: [
                            ...(selectedTask.subtasks || []),
                            {
                                id: data.subtask_id,
                                title: newSubtaskText,
                                is_completed: false
                            }
                        ]
                    };
                    setSelectedTask(updatedTask);
                    
                    // Update the task in the tasks list
                    setTasks(prevTasks =>
                        prevTasks.map(task =>
                            task.id === taskId ? updatedTask : task
                        )
                    );
                }
            } catch (error) {
                console.error('Error adding subtask:', error);
            }
        }
    };

    const handleToggleTask = async (taskId) => {
        try {
            const taskToUpdate = tasks.find(task => task.id === taskId);
            
            const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?id=${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
                },
                body: JSON.stringify({
                    is_completed: !taskToUpdate.is_completed
                })
            });

            const data = await response.json();
            if (data.success) {
                fetchTasks();
            }
        } catch (error) {
            console.error('Error toggling task:', error);
        }
    };

    const handleToggleSubtask = async (taskId, subtaskId) => {
        try {
            console.log('Toggling subtask:', subtaskId, 'for task:', taskId); // Debug log
            const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?subtask=true&id=${subtaskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
                }
            });

            const data = await response.json();
            console.log('Toggle subtask response:', data); // Debug log

            if (data.success) {
                // Update the selected task's subtasks immediately
                const updatedSubtasks = selectedTask.subtasks.map(subtask =>
                    subtask.id === subtaskId
                        ? { ...subtask, is_completed: !subtask.is_completed }
                        : subtask
                );

                // Update selected task
                const updatedSelectedTask = {
                    ...selectedTask,
                    subtasks: updatedSubtasks
                };
                setSelectedTask(updatedSelectedTask);

                // Update the task in the tasks list
                setTasks(prevTasks =>
                    prevTasks.map(task =>
                        task.id === taskId
                            ? { ...task, subtasks: updatedSubtasks }
                            : task
                    )
                );
            }
        } catch (error) {
            console.error('Error toggling subtask:', error);
        }
    };

    const handleUpdateNote = async (taskId, note) => {
        try {
            const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?id=${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
                },
                body: JSON.stringify({ 
                    note: note 
                })
            });

            const data = await response.json();
            if (data.success) {
                fetchTasks();
            }
        } catch (error) {
            console.error('Error updating note:', error);
        }
    };

    const handleUpdateReminder = async (taskId, date) => {
        try {
            console.log('Updating reminder with date:', date); // Debug log
            const formattedDate = new Date(date).toISOString().slice(0, 19).replace('T', ' ');
            
            const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?id=${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
                },
                body: JSON.stringify({
                    reminder_date: formattedDate
                })
            });

            const data = await response.json();
            console.log('Reminder update response:', data); // Debug log
            
            if (data.success) {
                // Update the task in the local state immediately
                setTasks(prevTasks => 
                    prevTasks.map(task => 
                        task.id === taskId 
                            ? { ...task, reminder_date: formattedDate }
                            : task
                    )
                );
                if (selectedTask?.id === taskId) {
                    setSelectedTask(prev => ({ ...prev, reminder_date: formattedDate }));
                }
                setShowDatePicker(false);
            }
        } catch (error) {
            console.error('Error updating reminder:', error);
        }
    };

    const handleUpdatePriority = async (taskId, newPriority) => {
        try {
            const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?id=${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
                },
                body: JSON.stringify({
                    priority: newPriority.toLowerCase()
                })
            });

            const data = await response.json();
            console.log('Priority update response:', data); // Debug log
            if (data.success) {
                // Update the task in the local state immediately
                setTasks(prevTasks => 
                    prevTasks.map(task => 
                        task.id === taskId 
                            ? { ...task, priority: newPriority.toLowerCase() }
                            : task
                    )
                );
                if (selectedTask?.id === taskId) {
                    setSelectedTask(prev => ({ ...prev, priority: newPriority.toLowerCase() }));
                }
                setShowPriorityDropdown(false);
            }
        } catch (error) {
            console.error('Error updating priority:', error);
        }
    };

    const handleArchiveTask = async (taskId) => {
        try {
            console.log('Archiving task:', taskId); // Debug log
            const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?id=${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
                },
                body: JSON.stringify({
                    is_archived: true
                })
            });

            const data = await response.json();
            console.log('Archive response:', data); // Debug log

            if (data.success) {
                // Remove task from the current list
                setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
                if (selectedTask?.id === taskId) {
                    setSelectedTask(null);
                }
            }
        } catch (error) {
            console.error('Error archiving task:', error);
        }
    };

    const handleUpdateListType = async (taskId, newListType) => {
        try {
            const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?id=${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
                },
                body: JSON.stringify({
                    list_type: newListType
                })
            });

            const data = await response.json();
            if (data.success) {
                // Remove task from current list if list type changed
                if (newListType !== listType) {
                    setTasks(tasks.filter(task => task.id !== taskId));
                    setSelectedTask(null);
                } else {
                    fetchTasks();
                }
                setShowListDropdown(false);
            }
        } catch (error) {
            console.error('Error updating list type:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex h-screen">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
            />
            <div className={`flex-1 transition-all duration-300 ${
                isSidebarCollapsed ? "ml-[60px]" : "ml-[240px]"
            } p-8 bg-system-background bg-no-repeat bg-fixed`}>
                <div className="text-left mb-10 font-poppins">
                    <h1 className="font-bold text-3xl">My Lists</h1>
                    <p className="font-bold text-xl text-[#FFB78B]">
                        {listType.charAt(0).toUpperCase() + listType.slice(1)} Tasks
                    </p>
                </div>

                <div className="flex space-x-6">
                    {/* Left side - Task List */}
                    <div className="w-1/2 bg-white rounded-lg p-6 shadow-md">
                        <div className="flex items-center mb-4">
                            <h2 className="text-xl font-semibold">My lists &gt; {listType}</h2>
                        </div>
                        <div className="space-y-2">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={`p-3 rounded-lg cursor-pointer ${
                                        selectedTask?.id === task.id ? 'bg-purple-100' : 'bg-gray-100'
                                    }`}
                                    onClick={() => handleTaskClick(task)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={task.is_completed}
                                                onChange={() => handleToggleTask(task.id)}
                                                className="mr-3"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <span className={task.is_completed ? 'line-through' : ''}>
                                                {task.title}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleArchiveTask(task.id);
                                            }}
                                            className="p-2 text-gray-500 hover:bg-gray-200 rounded-full"
                                            title="Archive Task"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                                                <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add Task Section */}
                        <div className="flex items-center mt-4 pt-4 border-t">
                            <input
                                type="text"
                                placeholder="Add a new task"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && newTask.trim()) {
                                        handleAddTask();
                                    }
                                }}
                                className="flex-1 p-2 border rounded-lg mr-2"
                            />
                            <button
                                onClick={handleAddTask}
                                className="px-4 py-2 bg-[#FFB78B] text-white rounded-lg"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Right side - Task Details */}
                    {selectedTask && (
                        <div className="w-1/2 bg-white rounded-lg p-6 shadow-md">
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold">{selectedTask.title}</h2>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    {/* Reminder Button */}
                                    <div className="relative">
                                        <button 
                                            onClick={() => setShowDatePicker(!showDatePicker)}
                                            className="flex items-center space-x-1 px-3 py-1 rounded-full border hover:bg-gray-50"
                                        >
                                            <FaRegBell className="text-gray-600" />
                                            <span className="text-sm">
                                                {selectedTask.reminder_date 
                                                    ? new Date(selectedTask.reminder_date).toLocaleDateString() 
                                                    : "Remind Me"}
                                            </span>
                                        </button>
                                        {showDatePicker && (
                                            <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-lg p-4">
                                                <Calendar
                                                    onChange={(date) => handleUpdateReminder(selectedTask.id, date.toISOString().split('T')[0])}
                                                    value={selectedTask.reminder_date ? new Date(selectedTask.reminder_date) : new Date()}
                                                    minDate={new Date()}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* List Type Dropdown */}
                                    <div className="relative">
                                        <button 
                                            onClick={() => setShowListDropdown(!showListDropdown)}
                                            className="flex items-center space-x-1 px-3 py-1 rounded-full border hover:bg-gray-50"
                                        >
                                            <IoMdCheckmarkCircleOutline className="text-gray-600" />
                                            <span className="text-sm">{selectedTask.list_type}</span>
                                        </button>
                                        {showListDropdown && (
                                            <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-lg py-2 min-w-[80px]">
                                                {['Personal', 'Work', 'School'].map((type) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => {
                                                            handleUpdateListType(selectedTask.id, type);
                                                            handleArchiveTask(selectedTask.id);
                                                        }}
                                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                                                            selectedTask.list_type === type ? 'bg-gray-50' : ''
                                                        }`}
                                                    >
                                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Priority Dropdown */}
                                    <div className="relative">
                                        <button 
                                            onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                                            className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
                                                selectedTask.priority === 'high' 
                                                    ? 'bg-red-100 text-red-800'
                                                    : selectedTask.priority === 'medium'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}
                                        >
                                            <span className="text-sm">
                                                {selectedTask.priority.charAt(0).toUpperCase() + 
                                                 selectedTask.priority.slice(1)} Priority
                                            </span>
                                        </button>
                                        {showPriorityDropdown && (
                                            <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-lg py-2 min-w-[150px]">
                                                <button
                                                    onClick={() => handleUpdatePriority(selectedTask.id, 'high')}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center space-x-2"
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                    <span>High Priority</span>
                                                </button>
                                                <button
                                                    onClick={() => handleUpdatePriority(selectedTask.id, 'medium')}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-yellow-50 flex items-center space-x-2"
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                                    <span>Medium Priority</span>
                                                </button>
                                                <button
                                                    onClick={() => handleUpdatePriority(selectedTask.id, 'low')}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 flex items-center space-x-2"
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                    <span>Low Priority</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="font-semibold mb-2 text-gray-700">NOTES</h3>
                                <textarea
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    placeholder="Insert your notes here"
                                    rows="4"
                                    value={currentNote}
                                    onChange={(e) => {
                                        setCurrentNote(e.target.value);
                                        handleUpdateNote(selectedTask.id, e.target.value);
                                    }}
                                />
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2 text-gray-700">SUBTASKS</h3>
                                <div className="space-y-2">
                                    {selectedTask.subtasks && selectedTask.subtasks.map((subtask) => (
                                        <div key={subtask.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                                            <input
                                                type="checkbox"
                                                checked={subtask.is_completed}
                                                onChange={() => handleToggleSubtask(selectedTask.id, subtask.id)}
                                                className="w-4 h-4 mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className={`flex-1 text-sm ${subtask.is_completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                                {subtask.title}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="flex items-center mt-2">
                                        <input
                                            type="text"
                                            value={newSubtaskText}
                                            onChange={(e) => setNewSubtaskText(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && newSubtaskText.trim()) {
                                                    handleAddSubtask(selectedTask.id);
                                                }
                                            }}
                                            placeholder="Add a new subtask"
                                            className="flex-1 p-2 border rounded-lg mr-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <button
                                            onClick={() => handleAddSubtask(selectedTask.id)}
                                            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListComponent; 