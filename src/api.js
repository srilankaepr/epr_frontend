import axios from 'axios';

const API = axios.create({
    baseURL: 'https://eprbackend-production.up.railway.app/api',
    withCredentials: true
});

// 👈 මේ කෑල්ල අලුතින් දාන්න
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); 
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;