import axios from 'axios';

// මුළු project එකටම එකම base URL එක මෙතන තියෙන්නේ
const API = axios.create({
    baseURL: 'https://dumidu-td9b.vercel.app/api'
});

export default API;