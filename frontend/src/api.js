import axios from 'axios';
const API_BASE_URL = 'https://thesis-management-system-zccg.onrender.com'; 
// const API_BASE_URL = 'http://localhost:5005';


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

export const addResourceAPI = async (formData) => {
  // Important: multipart/form-data for file upload
  const response = await api.post("/resources", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
export const deleteResourceAPI = async (id) => {
  await api.delete(`/resources/${id}`);
};


// // Student Proposal API functions - Updated
export const fetchAllProposals = (faculty_id = null) => {
  const params = faculty_id ? { faculty_id } : {};
  return api.get('/students/propose', { params });
};

export const fetchProposalById = (id) => api.get(`/students/propose/${id}`);
export const createProposal = (data) => api.post('/students/propose', data);
export const updateProposal = (id, data) => api.put(`/students/propose/${id}`, data);
export const deleteProposal = (id) => api.delete(`/students/propose/${id}`);

// New function for updating proposal status
export const updateProposalStatus = (id, statusData) => 
  api.post(`/students/propose/status/${id}`, statusData);

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
export const fetchGroupByStudentId = (student_id) => api.get(`/groups/student/${student_id}`);


// Fetch domain info by sup_id
export const fetchDomainBySupId = (sup_id) => api.get(`/domain/view/${sup_id}`);

// Register domain
export const registerDomain = (data) => api.post('/register/domain', data);

// Update domain
export const updateDomain = (data) => api.put('/update/domain', data);

// Fetch all domain subjects for dropdown
export const fetchDomainList = () => api.get('/domainlist/view');
export const clearDomain = (sup_id) => api.put('/domain/clear', { sup_id });

// Thesis Defer APIs
export const fetchAllThesisDefers = () => api.get('/thesis_defer'); // get all theses defer info

// Student requests defer for their thesis
export const requestThesisDefer = (data) => 
  api.put('/thesis_defer', { 
    thesis_id: data.thesis_id, 
    defer: 1 // always request defer
  });
  
  // Faculty approves or rejects a defer request
  export const decideThesisDefer = (data) => 
    api.put('/thesis_defer/decision', { 
      thesis_id: data.thesis_id, 
      decision: data.decision // "approve" or "reject"
    });
    
    // Admin resets a thesis defer back to none
    export const resetThesisDefer = (thesis_id) =>
      api.put("/thesis_defer/reset", { thesis_id });
    
    
    // Fetch all thesis progress
    export const fetchThesisProgressAPI = async () => {
      const response = await api.get("/thesis_progress");
      return response.data; // array of thesis objects
    };
    
    // Fetch single thesis by ID
    export const fetchThesisByIdAPI = async (thesisId) => {
      const id = Number(thesisId);
  if (isNaN(id)) throw new Error("Invalid thesis ID");
  const response = await api.get(`/thesis_progress/${id}`);
  return response.data;
};

// Upload a progress report (P1, P2, P3)
export const uploadThesisProgressAPI = async (thesisId, formData) => {
  const id = Number(thesisId);
  if (isNaN(id)) throw new Error("Invalid thesis ID");
  
  const response = await api.post(`/thesis_progress/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.thesis || response.data; // backend returns { message, thesis }
};

// Generate URL for viewing a thesis report file
export const getReportFileURL = (filePath) => {
  if (!filePath) return "";
  return `${API_BASE_URL}${filePath}`;
};

// Generate download URL for a thesis report
export const getReportDownloadURL = (filePath) => {
  if (!filePath) return "";
  const filename = filePath.split("/").pop();
  return `${API_BASE_URL}/thesis_progress/download/${filename}`;
};
// Thesis feed back api call
export const updateThesisFeedbackAPI = (groupId, data) => api.put(`/feedback/update/${groupId}`, data);
// Fetch feedback for a specific group and stage
export const fetchThesisFeedbackAPI = (groupId, stage) => api.get(`/feedback/show/${groupId}/${stage}`);

// Update user profile by student_id
export const updateUserByStudentId = (student_id, data) =>
  api.put(`/update-user/${student_id}`, data);


// Student requests thesis correction
export const requestThesisCorrection = (thesis_id) => 
  api.put("/thesis_correction/request", { thesis_id });

// Faculty approves thesis correction
export const approveThesisCorrection = (thesis_id) =>
  api.put("/thesis_correction/approve", { thesis_id, approve: true });

// Admin resets thesis correction flags
export const resetThesisCorrection = (thesis_id) =>
  api.put("/thesis_correction/reset", { thesis_id });

// Update topic & abstract after approval
export const correctThesisAPI = (thesisId, data) => 
  api.put(`/thesis_correction/${thesisId}`, data);

// Meeting APIs
export const fetchAllMeetings = () => api.get('/meeting');
// Book a meeting (assume POST to /meeting/book with meeting data)
export const bookMeeting = (data) => api.post('/book/meeting', data);

// Fetch all users (for faculty list)
export const fetchAllUsers = () => api.get('/usr');

// Fetch meetings for a specific faculty
export const fetchMeetingsByFacultyId = (faculty_id) => api.get(`/meeting/${faculty_id}`);


// Update meeting status (faculty approval)
export const updateMeetingStatus = (faculty_id, student_id, statusData) =>
  api.put(`/update/meeting/${faculty_id}/${student_id}`, statusData);


// Delete expired meetings (events before today)
export const deleteExpiredMeetings = () => api.delete('/meeting/expired');

// api for central mail
export const sendCentralMail = (subject, msg) =>
  api.post('/email/toall', { subject, msg });

// API for domain enlistment
export const enlistDomain = (domain_subject) =>
  api.post('/domain/enlist', { domain_subject });




export default api;



