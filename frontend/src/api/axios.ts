import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  // You can add headers or interceptors here
});

export default axiosInstance;
