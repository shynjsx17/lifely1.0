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

        window.addEventListener('popstate', handlePopState);
        
        // Cleanup
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [navigate, location, user]);

    // Immediate check for authentication
    if (!user || !sessionStorage.getItem('session_token')) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return children;
};

export default PrivateRoute; 