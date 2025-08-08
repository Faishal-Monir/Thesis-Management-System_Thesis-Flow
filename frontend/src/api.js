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
export const fetchStudentById = (student_id) => api.get(`/users/dashboard?student_id=${student_id}`);

export const registerUser = (data) => api.post('/register', data);
export const createApprovalRequest = (data) => api.post('/req', data);
export const checkUserExists = (mailOrId) => api.get(`/usr/${mailOrId}`);
export const sendRegistrationEmail = (data) => api.post('/email/send', data);
export const resetPassword = (data) => api.post('/reset', data);

// Student Proposal API functions
export const fetchAllProposals = () => api.get('/students/propose');
export const fetchProposalById = (id) => api.get(`/students/propose/${id}`);
export const createProposal = (data) => api.post('/students/propose', data);
export const updateProposal = (id, data) => api.put(`/students/propose/${id}`, data);
export const deleteProposal = (id) => api.delete(`/students/propose/${id}`);

export default api;
