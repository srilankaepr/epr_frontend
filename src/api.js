import axios from 'axios';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://eprbackend-production.up.railway.app/api'
});

export default API;