const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost/lifely1.0/backend';
const API_URL = `${BASE_URL}/api`;

const getDefaultOptions = () => {
    const token = localStorage.getItem('session_token');
    return {
        mode: 'cors',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        }
    };
};

export const calendarService = {
    // Get Google Calendar authorization URL
    getAuthUrl: async () => {
        const response = await fetch(`${API_URL}/google-calendar-auth.php`, {
            ...getDefaultOptions(),
            method: 'GET'
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to get auth URL');
        }
        return data;
    },

    // Handle OAuth callback
    handleCallback: async (code) => {
        const response = await fetch(`${API_URL}/google-calendar-callback.php?code=${code}`, {
            ...getDefaultOptions(),
            method: 'GET'
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to handle callback');
        }
        return data;
    },

    // Get user's Google Calendar events
    getEvents: async (start, end) => {
        const params = new URLSearchParams({
            start: start.toISOString(),
            end: end.toISOString()
        });

        const response = await fetch(
            `${API_URL}/google-calendar.php?${params.toString()}`,
            {
                ...getDefaultOptions(),
                method: 'GET'
            }
        );

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch events');
        }
        return data;
    },

    // Create a new event
    createEvent: async (eventData) => {
        const response = await fetch(`${API_URL}/google-calendar.php`, {
            ...getDefaultOptions(),
            method: 'POST',
            body: JSON.stringify(eventData)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create event');
        }
        return data;
    },

    // Update an event
    updateEvent: async (eventId, eventData) => {
        const response = await fetch(`${API_URL}/google-calendar.php`, {
            ...getDefaultOptions(),
            method: 'PUT',
            body: JSON.stringify({ id: eventId, ...eventData })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update event');
        }
        return data;
    },

    // Delete an event
    deleteEvent: async (eventId) => {
        const response = await fetch(`${API_URL}/google-calendar.php`, {
            ...getDefaultOptions(),
            method: 'DELETE',
            body: JSON.stringify({ id: eventId })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete event');
        }
        return data;
    }
}; 