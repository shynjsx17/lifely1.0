import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize user from localStorage
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize authentication state from localStorage
    return localStorage.getItem('session_token') !== null;
  });

  const [token, setToken] = useState(() => {
    // Initialize token from localStorage
    return localStorage.getItem('session_token') || null;
  });

  useEffect(() => {
    // Update authentication state whenever user changes
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      if (user.session_token) {
        localStorage.setItem('session_token', user.session_token);
        setToken(user.session_token);
      }
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('session_token');
      setToken(null);
      setIsAuthenticated(false);
    }
  }, [user]);

  const login = async (userData) => {
    try {
      // Ensure session_token is present
      if (!userData.session_token) {
        throw new Error('No session token in response');
      }
      
      // Store user data and token
      setUser(userData);
      localStorage.setItem('session_token', userData.session_token);
      setToken(userData.session_token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const googleLogin = async (credentialResponse) => {
    try {
      if (!credentialResponse?.credential) {
        throw new Error('No credential received from Google');
      }

      const decoded = jwtDecode(credentialResponse.credential);
      console.log('Decoded token:', decoded);
      
      // Send the token to your backend for verification
      const response = await fetch('http://localhost/lifely1.0/backend/api/google-auth.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          credential: credentialResponse.credential,
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(errorText || 'Failed to authenticate with Google');
      }

      const userData = await response.json();
      
      // Ensure we have a session token
      if (!userData.data?.session_token) {
        throw new Error('No session token in Google auth response');
      }
      
      await login(userData.data);
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('session_token');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, token, login, logout, googleLogin }}>
      <GoogleOAuthProvider clientId="708928527512-310dmj1nc847nah9ilqbq2np85ivpk6d.apps.googleusercontent.com">
        {children}
      </GoogleOAuthProvider>
    </AuthContext.Provider>
  );
};