
import axios from 'axios';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://eprbackend-production.up.railway.app/api'
});

//...............................................................

// api.js එක මෙහෙම වෙනස් කරන්න
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken'); 
    
    // ✅ includes පාවිච්චි කරන එකේදී වඩාත් ආරක්ෂිත විදිහ
    const url = config.url.toLowerCase();
    const isPublicRoute = url.includes('register') || url.includes('login');

    // ටෝකන් එකක් තියෙනවා නම් සහ ඒක Register/Login නෙවෙයි නම් විතරක් Header එක දාන්න
    if (token && !isPublicRoute) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        // 🚀 Register වලදී Header එකේ තියෙන පරණ දේවල් අයින් කරන්න මේක දාන්න
        delete config.headers.Authorization;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});
//...............................................................
export default API;

