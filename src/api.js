import axios from 'axios';

// 1. الرابط الأساسي للباك إند (تأكد من البورت 5182 كما في ملف launchSettings)
const API_BASE_URL = "https://mohammed13sarah-001-site1.itempurl.com/api";
const api = axios.create({
    baseURL: API_BASE_URL,
});

// 2. "Interceptor" لإرسال التوكن تلقائياً مع كل طلب (للأمان)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // نسحب التوكن من ذاكرة المتصفح
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;