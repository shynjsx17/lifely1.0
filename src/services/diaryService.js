const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost/lifely1.0/backend';
const API_URL = `${BASE_URL}/api`;

const getDefaultOptions = () => {
    const token = localStorage.getItem('session_token');
    console.log('Getting token for diary request:', token ? token.substring(0, 10) + '...' : 'no token');
    
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

export const diaryService = {
    // Get all diary entries
    getEntries: async (archived = false) => {
        try {
            const params = new URLSearchParams();
            if (archived) params.append('archived', archived);

            const url = `${API_URL}/diary.php${params.toString() ? `?${params.toString()}` : ''}`;
            console.log('Fetching diary entries from:', url);
            
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

            console.log('Diary response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to fetch diary entries' }));
                
                if (response.status === 401) {
                    console.log('Unauthorized response from diary API');
                    throw new Error('Session expired. Please log in again.');
                }
                
                throw new Error(errorData.message);
            }

            const data = await response.json();
            console.log('Diary entries fetched successfully:', data.data?.length || 0, 'entries');
            return data;
        } catch (error) {
            console.error('Error fetching diary entries:', error);
            throw error;
        }
    },

    // Create a new entry
    createEntry: async (entryData) => {
        try {
            const options = getDefaultOptions();
            const response = await fetch(`${API_URL}/diary.php`, {
                ...options,
                method: 'POST',
                body: JSON.stringify(entryData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to create diary entry' }));
                throw new Error(errorData.message);
            }

            return response.json();
        } catch (error) {
            console.error('Error creating diary entry:', error);
            throw error;
        }
    },

    // Update an entry
    updateEntry: async (entryData) => {
        try {
            const options = getDefaultOptions();
            const response = await fetch(`${API_URL}/diary.php`, {
                ...options,
                method: 'PUT',
                body: JSON.stringify(entryData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to update diary entry' }));
                throw new Error(errorData.message);
            }

            return response.json();
        } catch (error) {
            console.error('Error updating diary entry:', error);
            throw error;
        }
    },

    // Archive an entry
    archiveEntry: async (entryId) => {
        try {
            const options = getDefaultOptions();
            const response = await fetch(`${API_URL}/diary.php`, {
                ...options,
                method: 'PUT',
                body: JSON.stringify({
                    id: entryId,
                    archived: true
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to archive diary entry' }));
                throw new Error(errorData.message);
            }

            return response.json();
        } catch (error) {
            console.error('Error archiving diary entry:', error);
            throw error;
        }
    }
}; 