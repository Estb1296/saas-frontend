import React, { useState } from 'react';
import { AuthContext } from './AuthContext';
import type { User } from '../types/admin';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const savedUser = localStorage.getItem('user');
            if (!savedUser || savedUser === 'undefined' || savedUser === 'null') {
                return null;
            }
            return JSON.parse(savedUser) as User;
        } catch (error) {
            console.error('Failed to parse user from localStorage:', error);
            localStorage.removeItem('user'); // Clean up corrupt storage value
            return null;
        }
    });

    const [token, setToken] = useState<string | null>(() => {
        const savedToken = localStorage.getItem('token');
        if (!savedToken || savedToken === 'undefined' || savedToken === 'null') {
            return null;
        }
        return savedToken;
    });

    const login = (newToken: string, newUser: User) => {
        if (!newUser || !newToken) {
            console.error('Invalid login payload');
            return;
        }
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                isAuthenticated: !!token,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};