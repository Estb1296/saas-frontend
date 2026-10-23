import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export const ProtectedRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();

    // Check localStorage fallback so async state updates don't trigger false redirects
    const tokenInStorage = localStorage.getItem('token');
    const isUserAuthenticated = isAuthenticated || (!!tokenInStorage && tokenInStorage !== 'undefined');

    if (!isUserAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};