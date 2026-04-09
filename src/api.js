
import axios from 'axios';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://eprbackend-production.up.railway.app/api'
});

//...............................................................

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken'); 
    
    const isPublicRoute = config.url.includes('/register') || config.url.includes('/login');

    if (token && !isPublicRoute) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
//...............................................................
export default API;

