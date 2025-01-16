import { calendarService } from './calendarService';

// Ensure we have the correct API URL format
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost/lifely1.0/backend';
const API_URL = `${BASE_URL}/api`;

const getDefaultOptions = () => {
    const token = localStorage.getItem('session_token');
    console.log('Current session token:', token); // Debug token

    const options = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        }
    };
    console.log('Request options:', options); // Debug options
    return options;
};

const createCalendarEvent = async (task, reminderDate, reminderTime) => {
    try {
        // Combine date and time into a single ISO string
        const dateTime = new Date(`${reminderDate}T${reminderTime}`);
        
        const eventData = {
            title: `Reminder: ${task.title}`,
            start: dateTime.toISOString(),
            end: new Date(dateTime.getTime() + 30 * 60000).toISOString(), // 30 minutes duration
            description: task.notes || '',
            allDay: false
        };
        
        const result = await calendarService.createEvent(eventData);
        return result.data.id;
    } catch (error) {
        console.error('Failed to create calendar event:', error);
        throw error;
    }
};

const updateCalendarEvent = async (eventId, task, reminderDate, reminderTime) => {
    try {
        // Combine date and time into a single ISO string
        const dateTime = new Date(`${reminderDate}T${reminderTime}`);
        
        const eventData = {
            title: `Reminder: ${task.title}`,
            start: dateTime.toISOString(),
            end: new Date(dateTime.getTime() + 30 * 60000).toISOString(),
            description: task.notes || ''
        };
        
        await calendarService.updateEvent(eventId, eventData);
    } catch (error) {
        console.error('Failed to update calendar event:', error);
        throw error;
    }
};

const deleteCalendarEvent = async (eventId) => {
    try {
        if (eventId) {
            await calendarService.deleteEvent(eventId);
        }
    } catch (error) {
        console.error('Failed to delete calendar event:', error);
        // Don't throw the error as this is cleanup
    }
};

export const taskService = {
    // Get all tasks
    getTasks: async (listType = null, archived = false) => {
        const params = new URLSearchParams();
        if (listType) params.append('list_type', listType);
        if (archived) params.append('archived', archived);

        try {
            const url = `${API_URL}/tasks.php${params.toString() ? `?${params.toString()}` : ''}`;
            console.log('Fetching tasks from:', url);
            
            const options = getDefaultOptions();
            console.log('Request headers:', options.headers); // Debug headers
            
            const response = await fetch(url, {
                ...options,
                method: 'GET'
            });
            
            // Log the raw response for debugging
            const responseText = await response.text();
            console.log('Raw response:', responseText);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
            }
            
            try {
                return JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse JSON:', e);
                throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
            }
        } catch (error) {
            console.error('Full error details:', error);
            throw error;
        }
    },

    // Create a new task
    createTask: async (taskData) => {
        const response = await fetch(`${API_URL}/tasks.php`, {
            ...getDefaultOptions(),
            method: 'POST',
            body: JSON.stringify(taskData)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create task');
        }

        // If reminder is set, create a calendar event
        if (taskData.reminder_date) {
            try {
                const eventId = await createCalendarEvent(taskData, taskData.reminder_date);
                // Update task with calendar event ID
                await fetch(`${API_URL}/tasks.php`, {
                    ...getDefaultOptions(),
                    method: 'PUT',
                    body: JSON.stringify({
                        id: data.data.id,
                        calendar_event_id: eventId
                    })
                });
            } catch (error) {
                console.error('Failed to create calendar event for task:', error);
                // Continue without calendar event
            }
        }

        return data;
    },

    // Update a task
    updateTask: async (taskId, taskData) => {
        const response = await fetch(`${API_URL}/tasks.php`, {
            ...getDefaultOptions(),
            method: 'PUT',
            body: JSON.stringify({ id: taskId, ...taskData })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update task');
        }

        // Handle calendar event
        try {
            if (taskData.reminder_date) {
                if (taskData.calendar_event_id) {
                    // Update existing calendar event
                    await updateCalendarEvent(taskData.calendar_event_id, taskData, taskData.reminder_date);
                } else {
                    // Create new calendar event
                    const eventId = await createCalendarEvent(taskData, taskData.reminder_date);
                    // Update task with calendar event ID
                    await fetch(`${API_URL}/tasks.php`, {
                        ...getDefaultOptions(),
                        method: 'PUT',
                        body: JSON.stringify({
                            id: taskId,
                            calendar_event_id: eventId
                        })
                    });
                }
            } else if (taskData.calendar_event_id) {
                // Remove calendar event if reminder is removed
                await deleteCalendarEvent(taskData.calendar_event_id);
                // Update task to remove calendar event ID
                await fetch(`${API_URL}/tasks.php`, {
                    ...getDefaultOptions(),
                    method: 'PUT',
                    body: JSON.stringify({
                        id: taskId,
                        calendar_event_id: null
                    })
                });
            }
        } catch (error) {
            console.error('Failed to update calendar event for task:', error);
            // Continue without calendar event
        }

        return data;
    },

    // Delete a task
    deleteTask: async (taskId) => {
        // Get task details first to check for calendar event
        const task = await taskService.getTask(taskId);
        
        const response = await fetch(`${API_URL}/tasks.php`, {
            ...getDefaultOptions(),
            method: 'DELETE',
            body: JSON.stringify({ id: taskId })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete task');
        }

        // Delete associated calendar event if exists
        if (task.data.calendar_event_id) {
            await deleteCalendarEvent(task.data.calendar_event_id);
        }

        return data;
    },

    // Get subtasks for a task
    getSubtasks: async (taskId) => {
        const response = await fetch(`${API_URL}/subtasks.php?task_id=${taskId}`, getDefaultOptions());
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to fetch subtasks' }));
            throw new Error(error.message);
        }
        return response.json();
    },

    // Create a new subtask
    createSubtask: async (taskId, title) => {
        const response = await fetch(`${API_URL}/subtasks.php`, {
            ...getDefaultOptions(),
            method: 'POST',
            body: JSON.stringify({ task_id: taskId, title })
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to create subtask' }));
            throw new Error(error.message);
        }
        return response.json();
    },

    // Update a subtask
    updateSubtask: async (subtaskId, data) => {
        const response = await fetch(`${API_URL}/subtasks.php`, {
            ...getDefaultOptions(),
            method: 'PUT',
            body: JSON.stringify({ id: subtaskId, ...data })
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to update subtask' }));
            throw new Error(error.message);
        }
        return response.json();
    },

    // Delete a subtask
    deleteSubtask: async (subtaskId) => {
        const response = await fetch(`${API_URL}/subtasks.php`, {
            ...getDefaultOptions(),
            method: 'DELETE',
            body: JSON.stringify({ id: subtaskId })
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to delete subtask' }));
            throw new Error(error.message);
        }
        return response.json();
    },

    // Toggle task completion
    toggleTaskComplete: async (taskId) => {
        const response = await fetch(`${API_URL}/tasks.php`, {
            ...getDefaultOptions(),
            method: 'PUT',
            body: JSON.stringify({
                id: taskId,
                completed: true // The backend will toggle this
            })
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to toggle task completion' }));
            throw new Error(error.message);
        }
        return response.json();
    },

    // Toggle subtask completion
    toggleSubtaskComplete: async (subtaskId) => {
        const response = await fetch(`${API_URL}/subtasks.php`, {
            ...getDefaultOptions(),
            method: 'PUT',
            body: JSON.stringify({
                id: subtaskId,
                action: 'toggle'
            })
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to toggle subtask completion' }));
            throw new Error(error.message);
        }
        return response.json();
    },

    // Archive a task
    archiveTask: async (taskId) => {
        const response = await fetch(`${API_URL}/tasks.php`, {
            ...getDefaultOptions(),
            method: 'PUT',
            body: JSON.stringify({
                id: taskId,
                archived: true
            })
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to archive task' }));
            throw new Error(error.message);
        }
        return response.json();
    },

    // Toggle pin status of a task
    togglePin: async (taskId, currentPinned) => {
        const response = await fetch(`${API_URL}/tasks.php`, {
            ...getDefaultOptions(),
            method: 'PUT',
            body: JSON.stringify({
                id: taskId,
                pinned: !currentPinned  // Toggle the current pin state
            })
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to toggle pin status' }));
            throw new Error(error.message);
        }
        return response.json();
    }
}; 