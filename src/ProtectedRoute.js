import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
    // LocalStorage එකෙන් userRole එක ලබා ගැනීම
    const userRole = localStorage.getItem('userRole');
    
    console.log("--- Security Layer Check ---");
    console.log("Required Role:", allowedRole);
    console.log("Found User Role:", userRole);

    // 1. යූසර් ලොගින් වෙලාම නැත්නම් (userRole එක හිස් නම්) Login එකට රීඩිරෙක්ට් කරයි
    if (!userRole || userRole === "" || userRole === "undefined" || userRole === null) {
        console.warn("Access Denied! No user role found in storage.");
        return <Navigate to="/" replace />;
    }

    // 2. යූසර්ට අදාළ පේජ් එකට යන්න අවසර තිබේදැයි බැලීම (Case-Insensitive check)
    // මෙහිදී දෙපැත්තම .toUpperCase() කරන නිසා 'customer' හෝ 'CUSTOMER' යන ඕනෑම එකක් ගැලපේ
    if (allowedRole && userRole.toUpperCase() !== allowedRole.toUpperCase()) {
        console.error(`Access Denied! Role Mismatch. Expected: ${allowedRole}, Found: ${userRole}`);
        return <Navigate to="/" replace />;
    }

    // සියල්ල හරි නම් අදාළ Component එක පෙන්වයි
    return children;
};

export default ProtectedRoute;