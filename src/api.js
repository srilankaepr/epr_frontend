
import axios from 'axios';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://eprbackend-production.up.railway.app/api'
});

//...............................................................

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken'); 
    
    const url = config.url.toLowerCase();
    const isPublicRoute = url.includes('register') || url.includes('login');

    if (token && !isPublicRoute) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        delete config.headers.Authorization;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});
//...............................................................
export default API;

