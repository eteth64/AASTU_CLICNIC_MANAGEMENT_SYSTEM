import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000', // Fallback URL
    timeout: 10000,
});

export default axiosInstance;