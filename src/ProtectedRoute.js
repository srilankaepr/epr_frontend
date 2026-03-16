import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
    // LocalStorage එකෙන් userRole එක සහ අලුතින් හදපු accessToken එක ලබා ගැනීම
    const userRole = localStorage.getItem('userRole');
    const token = localStorage.getItem('accessToken'); // 👈 අලුතින් එක් කළා
    
    console.log("--- Security Layer Check ---");
    console.log("Required Role:", allowedRole);
    console.log("Found User Role:", userRole);
    console.log("Token Status:", token ? "✅ Valid Token Found" : "❌ Token Missing");

    // 1. යූසර් ලොගින් වෙලා නැත්නම් හෝ Token එක නැත්නම් Login එකට රීඩිරෙක්ට් කරයි
    if (!token || !userRole || userRole === "" || userRole === "undefined" || userRole === null) {
        console.warn("Access Denied! No valid token or role found in storage.");
        return <Navigate to="/" replace />;
    }

    // 2. යූසර්ට අදාළ පේජ් එකට යන්න අවසර තිබේදැයි බැලීම
    if (allowedRole && userRole.toUpperCase() !== allowedRole.toUpperCase()) {
        console.error(`Access Denied! Role Mismatch. Expected: ${allowedRole}, Found: ${userRole}`);
        return <Navigate to="/" replace />;
    }

    // සියල්ල හරි නම් අදාළ Component එක පෙන්වයි
    return children;
};

export default ProtectedRoute;