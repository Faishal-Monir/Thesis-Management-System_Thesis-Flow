import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5005'; // Use environment variable or fallback to localhost

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
export const resetPassword = (data) => api.post('/reset', data);

export const fetchResourcesAPI = async () => {
  const response = await api.get('/resources');
  return response.data;
};

export const addResourceAPI = async (data) => {
  const response = await api.post('/resources', data);
  return response.data;
};

export const updateResourceAPI = async (id, data) => {
  const response = await api.put(`/resources/${id}`, data);
  return response.data;
};

export const deleteResourceAPI = async (id) => {
  await api.delete(`/resources/${id}`);
};

export default api;
