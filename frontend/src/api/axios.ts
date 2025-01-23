import axios, { InternalAxiosRequestConfig } from 'axios';
import { API_URL, TOKEN_KEY } from '../config';

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Remove default headers that might cause preflight issues
    'X-Requested-With': null as any
  },
  // Enable credentials for CORS
  withCredentials: true,
  timeout: 10000
});

// Add auth token to requests if available
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ensure CORS headers are properly set
    config.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000';
    config.headers['Access-Control-Allow-Credentials'] = 'true';
    
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`[API Request] ${config.method?.toUpperCase()} ${fullUrl}`, {
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for debugging
instance.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} from ${response.config.url}`, {
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('[API Response Error]', {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url,
        method: error.config.method,
        headers: error.response.headers
      });
    } else if (error.request) {
      // The request was made but no response was received
      // This could be due to CORS or network issues
      console.error('[API Request Failed]', {
        request: error.request,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

export default instance;
