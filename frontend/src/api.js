import axios from 'axios';


const API_BASE_URL = 'http://localhost:5005'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});



export const fetchAllSynopsis = () => api.get('/synopsis');

export const fetchUserByEmail = (email) => api.get(`/usr/${email}`);
export const fetchPasswordByEmail = (email) => api.get(`/usr/password/${email}`);

export const registerUser = (data) => api.post('/register', data);
export const createApprovalRequest = (data) => api.post('/req', data);
export const checkUserExists = (mailOrId) => api.get(`/usr/${mailOrId}`);
export const sendRegistrationEmail = (data) => api.post('/email/send', data);

export default api;
