import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 🔄 පේජ් එක Refresh කරද්දී LocalStorage එකෙන් දත්ත නැවත ලබා ගැනීම
        const role = localStorage.getItem('userRole');
        const name = localStorage.getItem('userName');
        const email = localStorage.getItem('userEmail');
        const token = localStorage.getItem('accessToken'); // 👈 අලුතින් එක් කළා (Security Token එක)

        if (token && role) {
            // ටෝකන් එක සහ රෝල් එක දෙකම තියෙනවා නම් විතරක් යූසර්ව ලොග් කරනවා
            setUser({ role, name, email, token });
        }
        setLoading(false);
    }, []);

    // ✅ Login function එක දැන් පරාමිතීන් 3ක් ලබා ගන්නවා (userData, role, token)
    const login = (userData, role, token) => {
        setUser({ ...userData, role, token }); // React State එක Update කිරීම
        
        // 🛡️ LocalStorage එකට දත්ත දැමීම
        localStorage.setItem('accessToken', token); // 👈 අලුතින් එක් කළා (මේක තමයි වැදගත්ම)
        localStorage.setItem('userRole', role);
        localStorage.setItem('userName', userData.fullName || userData.name || '');
        localStorage.setItem('userEmail', userData.email || '');
        
        if(userData.coPartnerId) {
            localStorage.setItem('coPartnerId', userData.coPartnerId);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.clear(); // සියලුම දත්ත මකා දමයි (Token එක ඇතුළුව)
        window.location.href = '/'; 
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);