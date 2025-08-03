import axios from 'axios';

// Replace with your actual backend URL
const API_BASE_URL = 'http://localhost:5000'; // Default port from your backend

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
