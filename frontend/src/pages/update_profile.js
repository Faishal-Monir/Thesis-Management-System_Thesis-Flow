import React, { useState, useEffect } from 'react';
import api from '../api';
import './update_profile.css';

const UpdateProfile = ({ sessionData, setSessionData }) => {
    const [form, setForm] = useState({
        Name: '',
        mail: '',
        profile_pic: ''
    });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const cached = JSON.parse(localStorage.getItem('session') || '{}');
        const currentSessionData = sessionData || cached;
        if (currentSessionData) {
            setForm({
                Name: currentSessionData.Name || '',
                mail: currentSessionData.mail || '',
                profile_pic: ''
            });
        }
    }, [sessionData]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        setError('');
        setSuccess(false);
        let profilePicUrl = '';
        const cached = JSON.parse(localStorage.getItem('session') || '{}');
        const currentSessionData = sessionData || cached;
        if (!currentSessionData || !currentSessionData.student_id) {
            setError('Session data missing. Please log in again.');
            setUploading(false);
            return;
        }
        try {
            if (file) {
                const formData = new FormData();
                formData.append('image', file);
                const uploadRes = await api.post('/upload-profile-picture', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                profilePicUrl = uploadRes.data.url;
            }

            // console.log('Update payload:', {
            //     student_id: currentSessionData.student_id,
            //     Name: form.Name,
            //     mail: form.mail,
            //     profile_pic: profilePicUrl
            // });
            const updateRes = await api.put(`/update-user/${currentSessionData.student_id}`, {
                Name: form.Name,
                mail: form.mail,
                profile_pic: profilePicUrl
            });
            if (setSessionData) {
                setSessionData({ Name: updateRes.data.Name, mail: updateRes.data.mail });
            } else {
                const updatedSession = { ...cached, Name: updateRes.data.Name, mail: updateRes.data.mail };
                localStorage.setItem('session', JSON.stringify(updatedSession));
            }
            setSuccess(true);
            window.location.href = '/dashboard';
        } catch (err) {
            console.error('Update error:', err);
            let errorMsg = 'Update failed';
            if (err.response) {
                errorMsg += `\nStatus: ${err.response.status}`;
                if (err.response.data) {
                    errorMsg += `\nBackend: ${JSON.stringify(err.response.data)}`;
                }
            } else if (err.message) {
                errorMsg += `\nMessage: ${err.message}`;
            }
            setError(errorMsg);
        }
        setUploading(false);
    };

    return (
        <div className="update-profile-container">
            <h2 className="update-profile-title">Update Profile</h2>
            <form className="update-profile-form" onSubmit={handleSubmit}>
                <label>Name:</label>
                <input type="text" name="Name" value={form.Name} onChange={handleChange} required />
                <label>Email:</label>
                <input type="email" name="mail" value={form.mail} onChange={handleChange} required />
                <label>Profile Picture:</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <button type="submit" disabled={uploading}>Update Profile</button>
            </form>
            {uploading && <div className="waiting-msg">Waiting ...</div>}
            {success && <div className="success-msg">Profile updated successfully!</div>}
            {error && <div className="error-msg">{error}</div>}
        </div>
    );
};

export default UpdateProfile;
