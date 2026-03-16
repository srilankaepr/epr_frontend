import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // පේජ් එක Refresh කරද්දී LocalStorage එකේ තියෙන Token එක බලනවා
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('userRole');
        const name = localStorage.getItem('userName');

        if (token && role) {
            setUser({ role, name, token });
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('token', userData.token);
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('userName', userData.name);
    };

    const logout = () => {
        setUser(null);
        localStorage.clear();
        window.location.href = '/'; 
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);