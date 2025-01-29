import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/landing', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('session_token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Validate session on every route change
  useEffect(() => {
    const validateSession = async () => {
      // Skip validation for public routes
      if (PUBLIC_ROUTES.includes(location.pathname)) {
        setLoading(false);
        return;
      }

      const token = sessionStorage.getItem('session_token');
      
      if (!token) {
        setUser(null);
        setLoading(false);
        if (!PUBLIC_ROUTES.includes(location.pathname)) {
          navigate('/login', { replace: true });
        }
        return;
      }

      try {
        const response = await fetch('http://localhost/lifely1.0/backend/api/validate_session.php', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (data.status === 'success' && data.data?.user) {
          setUser(data.data.user);
        } else {
          // Clear invalid session
          sessionStorage.clear();
          localStorage.clear();
          setUser(null);
          if (!PUBLIC_ROUTES.includes(location.pathname)) {
            navigate('/login', { replace: true });
          }
        }
      } catch (error) {
        console.error('Session validation error:', error);
        sessionStorage.clear();
        localStorage.clear();
        setUser(null);
        if (!PUBLIC_ROUTES.includes(location.pathname)) {
          navigate('/login', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    validateSession();

    // Set up interval to periodically validate session
    const intervalId = setInterval(validateSession, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [navigate, location]);

  const login = async (userData) => {
    try {
      const response = await fetch('http://localhost/lifely1.0/backend/api/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Store the session token
        sessionStorage.setItem('session_token', data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);
        navigate('/myday');
        return { success: true };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const response = await fetch('http://localhost/lifely1.0/backend/api/signup.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Store the session token
        sessionStorage.setItem('session_token', data.data.token);
        setUser(data.data.user);
        navigate('/myday');
        return { success: true };
      } else {
        throw new Error(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = sessionStorage.getItem('session_token');
      
      // Clear all storage first
      sessionStorage.clear();
      localStorage.clear();
      setUser(null);
      setToken(null);

      // Call logout API with the token
      if (token) {
        await fetch('http://localhost/lifely1.0/backend/api/logout.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }

      // Clear browser history state
      window.history.pushState(null, '', '/login');
      window.history.replaceState(null, '', '/login');

      // Add cache-busting headers
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Cache-Control';
      meta.content = 'no-cache, no-store, must-revalidate';
      document.head.appendChild(meta);

      const pragma = document.createElement('meta');
      pragma.httpEquiv = 'Pragma';
      pragma.content = 'no-cache';
      document.head.appendChild(meta);

      const expires = document.createElement('meta');
      expires.httpEquiv = 'Expires';
      expires.content = '0';
      document.head.appendChild(meta);

      // Clear all storage again to be absolutely sure
      sessionStorage.clear();
      localStorage.clear();
      setUser(null);
      setToken(null);

      // Force a complete page reload
      window.location.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, ensure everything is cleared
      sessionStorage.clear();
      localStorage.clear();
      setUser(null);
      setToken(null);
      window.location.replace('/login');
    }
  };

  // Add cache control effect
  useEffect(() => {
    // Prevent caching for authenticated routes
    if (user && !PUBLIC_ROUTES.includes(location.pathname)) {
      // Add no-cache headers
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Cache-Control';
      meta.content = 'no-cache, no-store, must-revalidate';
      document.head.appendChild(meta);

      const pragma = document.createElement('meta');
      pragma.httpEquiv = 'Pragma';
      pragma.content = 'no-cache';
      document.head.appendChild(pragma);

      const expires = document.createElement('meta');
      expires.httpEquiv = 'Expires';
      expires.content = '0';
      document.head.appendChild(expires);

      return () => {
        document.head.removeChild(meta);
        document.head.removeChild(pragma);
        document.head.removeChild(expires);
      };
    }
  }, [user, location.pathname]);

  // Update history protection to check for public routes
  useEffect(() => {
    const handlePopState = () => {
      const token = sessionStorage.getItem('session_token');
      if ((!token || !user) && !PUBLIC_ROUTES.includes(location.pathname)) {
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, user, location]);

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};