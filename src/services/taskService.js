// Ensure we have the correct API URL format
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost/lifely1.0/backend';
const API_URL = `${BASE_URL}/api`;

const getDefaultOptions = () => {
    const token = localStorage.getItem('session_token');
    console.log('Getting token for request:', token ? token.substring(0, 10) + '...' : 'no token');
    
    if (!token) {
        throw new Error('No session token found');
    }
    
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
};

export const taskService = {
    // Get all tasks
    getTasks: async (listType = null, archived = false) => {
        try {
            const params = new URLSearchParams();
            if (listType) params.append('list_type', listType);
            if (archived) params.append('archived', archived);

            const url = `${API_URL}/tasks.php${params.toString() ? `?${params.toString()}` : ''}`;
            console.log('Fetching tasks from:', url);
            
            const options = getDefaultOptions();
            console.log('Request options:', { 
                method: 'GET',
                headers: {
                    ...options.headers,
                    Authorization: options.headers.Authorization.substring(0, 20) + '...'
                }
            });
            
            const response = await fetch(url, {
                ...options,
                method: 'GET'
            });

            console.log('Tasks response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to fetch tasks' }));
                
                if (response.status === 401) {
                    console.log('Unauthorized response from tasks API');
                    // Don't clear the token here, let the auth context handle it
                    throw new Error('Session expired. Please log in again.');
                }
                
                throw new Error(errorData.message);
            }

            const data = await response.json();
            console.log('Tasks fetched successfully:', data.data?.length || 0, 'tasks');
            return data;
        } catch (error) {
            console.error('Error fetching tasks:', error);
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
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to create task' }));
            throw new Error(error.message);
        }
        return response.json();
    },

    // Update a task
    updateTask: async (taskData) => {
        const response = await fetch(`${API_URL}/tasks.php`, {
            ...getDefaultOptions(),
            method: 'PUT',
            body: JSON.stringify(taskData)
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to update task' }));
            throw new Error(error.message);
        }
        return response.json();
    },

    // Delete a task
    deleteTask: async (taskId) => {
        const response = await fetch(`${API_URL}/tasks.php?id=${taskId}`, {
            ...getDefaultOptions(),
            method: 'DELETE'
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to delete task' }));
            throw new Error(error.message);
        }
        return response.json();
    },

    // Get subtasks for a task
    getSubtasks: async (taskId) => {
        const response = await fetch(`${API_URL}/subtasks.php?task_id=${taskId}`, {
            ...getDefaultOptions(),
            method: 'GET'
        });
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
                pinned: !currentPinned
            })
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to toggle pin status' }));
            throw new Error(error.message);
        }
        return response.json();
    }
}; 