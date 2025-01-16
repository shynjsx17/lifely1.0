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
    const token = localStorage.getItem('session_token');
    console.log('Initial auth state, token exists:', !!token);
    return !!token;
  });

  const [token, setToken] = useState(() => {
    // Initialize token from localStorage
    const storedToken = localStorage.getItem('session_token');
    console.log('Initial token state:', storedToken ? `${storedToken.substring(0, 10)}...` : 'none');
    return storedToken || null;
  });

  useEffect(() => {
    // Update authentication state whenever user changes
    console.log('User state changed:', user ? 'logged in' : 'logged out');
    
    if (user && user.session_token) {
      console.log('Storing user session token:', user.session_token.substring(0, 10) + '...');
      console.log('Token expiry:', user.token_expiry || 'not set');
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('session_token', user.session_token);
      setToken(user.session_token);
      setIsAuthenticated(true);
    } else if (!user) {
      console.log('Clearing user data and token');
      localStorage.removeItem('user');
      localStorage.removeItem('session_token');
      setToken(null);
      setIsAuthenticated(false);
    }
  }, [user]);

  const login = async (userData) => {
    try {
      console.log('Login called with userData:', { 
        hasToken: !!userData.session_token,
        email: userData.userEmail,
        tokenExpiry: userData.token_expiry || 'not set'
      });

      // Ensure session_token is present
      if (!userData.session_token) {
        throw new Error('No session token in response');
      }
      
      // Store user data and token
      console.log('Setting session token:', userData.session_token.substring(0, 10) + '...');
      setUser(userData);
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
      console.log('Google login attempt for:', decoded.email);
      
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
        console.error('Google auth server response:', errorText);
        throw new Error(errorText || 'Failed to authenticate with Google');
      }

      const userData = await response.json();
      console.log('Google auth response:', { 
        status: response.status,
        hasToken: !!userData.data?.session_token 
      });
      
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
    console.log('Logout called');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, token, login, logout, googleLogin }}>
      <GoogleOAuthProvider clientId="708928527512-310dmj1nc847nah9ilqbq2np85ivpk6d.apps.googleusercontent.com">
        {children}
      </GoogleOAuthProvider>
    </AuthContext.Provider>
  );
};