import React, { useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkAuth = () => {
            const token = sessionStorage.getItem('session_token');
            if (!token || !user) {
                // Clear any remaining auth data
                sessionStorage.clear();
                localStorage.clear();
                // Navigate to login with location state
                navigate('/login', { 
                    replace: true,
                    state: { from: location.pathname }
                });
            }
        };

        // Check immediately
        checkAuth();

        // Add listener for popstate (browser back/forward)
        const handlePopState = () => {
            checkAuth();
        };

        // Add listener for visibility change (tab switch/resume)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                checkAuth();
            }
        };

        // Add listener for focus (window focus)
        const handleFocus = () => {
            checkAuth();
        };

        window.addEventListener('popstate', handlePopState);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);
        
        // Check auth status periodically
        const intervalId = setInterval(checkAuth, 30000); // Check every 30 seconds
        
        // Cleanup
        return () => {
            window.removeEventListener('popstate', handlePopState);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            clearInterval(intervalId);
        };
    }, [navigate, location, user]);

    // Prevent caching for this route
    useEffect(() => {
        const preventCaching = () => {
            // Prevent browser caching
            window.history.pushState(null, '', location.pathname);
            window.history.replaceState(null, '', location.pathname);
        };

        preventCaching();
        window.addEventListener('pageshow', preventCaching);

        return () => {
            window.removeEventListener('pageshow', preventCaching);
        };
    }, [location.pathname]);

    // Immediate check for authentication
    if (!user || !sessionStorage.getItem('session_token')) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return children;
};

export default PrivateRoute; 