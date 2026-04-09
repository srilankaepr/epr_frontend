import axios from 'axios';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://eprbackend-production.up.railway.app/api'
});

export default API; 


/*
import axios from 'axios';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://eprbackend-production.up.railway.app/api'
});

// 🚀 වැදගත්ම කොටස: හැම Request එකකටම කලින් Token එක Header එකට ඇතුළත් කිරීම
API.interceptors.request.use((config) => {
    // ඔයාගේ LocalStorage එකේ Token එක තියෙන නම (Key) මෙතනට දාන්න
    // Screenshot එකේ තිබුණේ 'accessToken' කියලයි
    const token = localStorage.getItem('accessToken'); 
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;

*/