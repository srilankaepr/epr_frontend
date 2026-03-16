import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // පේජ් එක Refresh කරද්දී දත්ත ටික නැවත ගන්නවා
        const role = localStorage.getItem('userRole');
        const name = localStorage.getItem('userName');
        const email = localStorage.getItem('userEmail');

        if (role) {
            setUser({ role, name, email });
        }
        setLoading(false);
    }, []);

    // ✅ මෙතන පරාමිතීන් දෙකක් ගන්න විදිහට හැදුවා
    const login = (userData, role) => {
        setUser({ ...userData, role }); // State එකට දානවා
        
        // LocalStorage එකටත් දානවා (ProtectedRoute එකට පේන්න)
        localStorage.setItem('userRole', role);
        localStorage.setItem('userName', userData.fullName || userData.name || '');
        localStorage.setItem('userEmail', userData.email || '');
        if(userData.coPartnerId) localStorage.setItem('coPartnerId', userData.coPartnerId);
    };

    const logout = () => {
        setUser(null);
        localStorage.clear();
        window.location.href = '/'; 
    };

    return (
        <AuthContext.Provider value={{ user, role: user?.role, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);