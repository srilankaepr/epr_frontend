import axios from 'axios';

const API = axios.create({
    baseURL: 'https://eprbackend-production.up.railway.app/api'
    // withCredentials: true 👈 මේක මකන්න හෝ comment කරන්න
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); 
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;