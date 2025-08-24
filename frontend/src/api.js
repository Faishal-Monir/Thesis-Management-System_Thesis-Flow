import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5005'; 

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


// Group APIs
export const fetchAllGroups = () => api.get('/groups');
export const fetchGroupById = (id) => api.get(`/groups/${id}`);
export const createGroup = (data) => api.post('/groups', data);
export const addStudentToGroup = (id, student_id) =>
 api.put(`/groups/${id}`, { student_id });
export const deleteGroup = (id) => api.delete(`/groups/${id}`);
export const removeStudentFromGroup = (groupId, studentId) =>
 api.delete(`/groups/${groupId}/student`, { data: { student_id: studentId } });

export const updateGroup = (groupId, data) =>
  axios.put(`/groups/${groupId}`, data);


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


// Student Proposal API functions
export const fetchAllProposals = () => api.get('/students/propose');
export const fetchProposalById = (id) => api.get(`/students/propose/${id}`);
export const createProposal = (data) => api.post('/students/propose', data);
export const updateProposal = (id, data) => api.put(`/students/propose/${id}`, data);
export const deleteProposal = (id) => api.delete(`/students/propose/${id}`);


// Synopsis APIs
export const getSynopsisBySupId = (sup_id) => api.get(`/synopsis/${sup_id}`);
export const registerSynopsis = (data) => api.post('/register/synopsis', data);
export const deleteSynopsis = (data) => api.delete('/delete/synopsis', { data });
export const updateSynopsis = (data) => api.put('/update/synopsis', data);

export const getApprovalList = () => api.get('/approve');
export const getApprovalDetails = (id) => api.get(`/approve/${id}`);
export const approveUser = (id, payload) => api.put(`/approve/${id}`, payload);

// Thesis Registration APIs
export const fetchAllTheses = () => axios.get(`${API_BASE_URL}/thesis`);
export const registerThesis = (data) => api.post("/thesis/register", data);
// Fetch group info for a specific student
export const fetchGroupByStudentId = (student_id) => 
  api.get(`/groups/student/${student_id}`);



export default api;



