import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // Increased timeout to 15 seconds for live backend
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false, // Set to false for cross-origin requests
});

// Add a request interceptor to include the token in headers
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
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
    console.error("API Error:", error);

    if (error.response) {
      // Server responded with error status
      console.error("Error Response:", error.response.data);
      console.error("Error Status:", error.response.status);

      if (error.response.status === 401) {
        // Clear token and redirect to login
        localStorage.removeItem("token");
        window.location.href = "/";
      } else if (error.response.status === 500) {
        console.error("Server Error:", error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("Network Error - No response received:", error.request);
    } else if (error.code === "ECONNABORTED") {
      console.error("Request Timeout:", error.message);
    } else {
      // Something else happened
      console.error("Request Setup Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Add a simple health check function
const testBackendConnection = async () => {
  try {
    const response = await fetch(`${BASE_URL}/`);
    console.log("Backend health check:", response.status, response.statusText);
    const text = await response.text();
    console.log("Backend response:", text);
  } catch (error) {
    console.error("Backend connection test failed:", error);
  }
};

// Test the connection immediately
testBackendConnection();

export default axiosInstance;
