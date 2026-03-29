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


    const login = (userData, role, token, adminRole) => {
    setUser({ 
        ...userData, 
        role, 
        token,
        name: userData.fullName || userData.name || '',
        email: userData.email || userData.officialEmail || ''
    });
        
        localStorage.setItem('accessToken', token); 
        localStorage.setItem('userRole', role);
        localStorage.setItem('userName', userData.fullName || userData.name || '');
        localStorage.setItem('userEmail', userData.email || userData.officialEmail || '');
        localStorage.setItem('adminName', userData.fullName || userData.name || '');
        localStorage.setItem('adminEmail', userData.email || userData.officialEmail || '');
        localStorage.setItem('adminPhoto', userData.profilePic || '');

if (userData.adminRole) {
        localStorage.setItem('adminRole', userData.adminRole);
    } else {
        localStorage.removeItem('adminRole'); 
    }
        
if (userData.coPartnerId) {
            localStorage.setItem('coPartnerId', userData.coPartnerId);
        } else {
            localStorage.removeItem('coPartnerId');
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