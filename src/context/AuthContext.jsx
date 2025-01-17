import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const validateSession = async () => {
      const token = sessionStorage.getItem('session_token');
      
      if (token) {
        try {
          const response = await fetch('http://localhost/lifely1.0/backend/api/validate_session.php', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          const data = await response.json();
          
          if (data.status === 'success') {
            setUser(data.data.user);
          } else {
            // Clear invalid token
            sessionStorage.removeItem('session_token');
            navigate('/login');
          }
        } catch (error) {
          console.error('Session validation error:', error);
          sessionStorage.removeItem('session_token');
          navigate('/login');
        }
      } else {
        setLoading(false);
      }
      setLoading(false);
    };

    validateSession();
  }, [navigate]);

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

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('session_token');
    navigate('/login');
  };

  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
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