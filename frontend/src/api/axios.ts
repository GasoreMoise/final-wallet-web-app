import axios, { InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../config';

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false, 
  timeout: 10000
});

// Add a request interceptor for debugging
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`[API Request] ${config.method?.toUpperCase()} ${fullUrl}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error.message);
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} from ${response.config.url}`);
    return response.data;
  },
  (error) => {
    if (error.response) {
      console.error('[API Response Error]', {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('[API Network Error] No response received', {
        url: error.config?.url,
        message: error.message
      });
    } else {
      console.error('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

export default instance;
