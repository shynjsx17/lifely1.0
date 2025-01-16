const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost/lifely1.0/backend';
const API_URL = `${BASE_URL}/api`;

const defaultOptions = {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

export const authService = {
    login: async (userEmail, userPass) => {
        try {
            console.log('Attempting login for:', userEmail);
            const response = await fetch(`${API_URL}/login.php`, {
                ...defaultOptions,
                method: 'POST',
                body: JSON.stringify({ userEmail, userPass })
            });

            const data = await response.json();
            console.log('Login response:', { 
                status: response.status, 
                ok: response.ok,
                hasData: !!data.data,
                hasToken: data.data?.session_token ? 'yes' : 'no'
            });
            
            if (!response.ok) {
                console.error('Login failed:', data.message);
                throw new Error(data.message || 'Login failed');
            }

            if (!data.data) {
                console.error('No data in response:', data);
                throw new Error('Invalid response format');
            }

            // Store the session token
            if (data.data.session_token) {
                console.log('Storing session token:', data.data.session_token.substring(0, 10) + '...');
                localStorage.setItem('session_token', data.data.session_token);
                localStorage.setItem('user', JSON.stringify(data.data));
                
                // Verify storage
                const storedToken = localStorage.getItem('session_token');
                console.log('Verified stored token:', storedToken ? storedToken.substring(0, 10) + '...' : 'not stored');
            } else {
                console.error('No session token in response data:', data);
                throw new Error('No session token received');
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            // Clear any partial data
            localStorage.removeItem('session_token');
            localStorage.removeItem('user');
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const response = await fetch(`${API_URL}/register.php`, {
                ...defaultOptions,
                method: 'POST',
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    logout: async () => {
        try {
            // Clear local storage
            localStorage.removeItem('session_token');
            localStorage.removeItem('user');

            // Optional: Call backend to invalidate session
            const response = await fetch(`${API_URL}/logout.php`, {
                ...defaultOptions,
                method: 'POST'
            });

            return response.ok;
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local storage even if backend call fails
            localStorage.removeItem('session_token');
            localStorage.removeItem('user');
            throw error;
        }
    },

    isAuthenticated: () => {
        const token = localStorage.getItem('session_token');
        console.log('Checking authentication, token exists:', !!token);
        return !!token;
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('session_token');
        console.log('Getting current user, token exists:', !!token);
        return user ? JSON.parse(user) : null;
    }
}; 