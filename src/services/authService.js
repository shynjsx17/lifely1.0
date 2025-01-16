const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost/lifely1.0/backend';
const API_URL = `${BASE_URL}/api`;

const defaultOptions = {
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

export const authService = {
    login: async (userEmail, userPass) => {
        try {
            const response = await fetch(`${API_URL}/login.php`, {
                ...defaultOptions,
                method: 'POST',
                body: JSON.stringify({ userEmail, userPass })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store the session token
            if (data.data && data.data.session_token) {
                localStorage.setItem('session_token', data.data.session_token);
                localStorage.setItem('user', JSON.stringify(data.data));
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
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
        return !!localStorage.getItem('session_token');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
}; 