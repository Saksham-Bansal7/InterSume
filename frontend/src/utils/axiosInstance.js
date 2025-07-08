import axios from 'axios';
import { BASE_URL } from './apiPaths';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // Set a timeout of 10 seconds
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Add a request interceptor to include the token in headers
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('token');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
); 

// Add a response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                window.location.href = '/';
            } else if (error.response.status === 500) {
                console.error("Server Error:");
            }
        } 
        else if(error.code === 'ECONNABORTED') {
            console.error("Request Timeout:", error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
