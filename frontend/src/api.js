import axios from 'axios';

// Replace with your actual backend URL
const API_BASE_URL = 'http://localhost:5000'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add this function:
export const fetchAllSynopsis = () => api.get('/synopsis');

export default api;
