import axios from 'axios';

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000/api' 
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
export { API_BASE_URL };
