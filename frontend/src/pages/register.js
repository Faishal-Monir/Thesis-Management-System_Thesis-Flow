import React, { useState } from 'react';
import './register.css';
import { registerUser, createApprovalRequest, checkUserExists, sendRegistrationEmail } from '../api';

function Registration() {
  const [form, setForm] = useState({
    Name: '',
    student_id: '',
    mail: '',
    Password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      let userExists = false;
      try {
        const existsRes = await checkUserExists(form.mail);
        if (existsRes.data && existsRes.data.mail) {
          userExists = true;
        }
      } catch (err) {

        userExists = false;
      }
      if (userExists) {
        setError('User already registered.');
        setLoading(false);
        return;
      }

      await registerUser(form);
      if (!form.mail.endsWith('@g.bracu.ac.bd')) {
        await createApprovalRequest({
          sup_id: form.student_id,
          type: 'login',
          status: 0
        });
      }

      setSuccess('Registration successful!');
      await sendRegistrationEmail({
  mail: form.mail,
  subject: 'Your Registration is Complete',
  msg: `Thank You for registering in our Thesis Management System.\n You can login by simply going to the following Link: \n\n${process.env.REACT_APP_FRONTEND_BASE_URL}/login`
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        window.location.href = '/login';
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="home-bg-container">
      <video className="home-bg-video" src="/bgvideo.mp4" autoPlay loop muted playsInline />
      <div className="home-bg-gradient"></div>
      <div className="home-content registration-content">
        <form className="registration-form" onSubmit={handleSubmit}>
          <h2 className="registration-title">Create your account</h2>
          <label htmlFor="Name" className="registration-label">Name</label>
          <input
            id="Name"
            name="Name"
            type="text"
            className="registration-input"
            value={form.Name}
            onChange={handleChange}
            required
          />
          <label htmlFor="student_id" className="registration-label">ID/Pin</label>
          <input
            id="student_id"
            name="student_id"
            type="text"
            className="registration-input"
            value={form.student_id}
            onChange={handleChange}
            required
          />
          <label htmlFor="mail" className="registration-label">Email</label>
          <input
            id="mail"
            name="mail"
            type="text"
            className="registration-input"
            value={form.mail}
            onChange={handleChange}
            required
          />
          <label htmlFor="Password" className="registration-label">Password</label>
          <div className="registration-password-wrapper">
            <input
              id="Password"
              name="Password"
              type={showPassword ? 'text' : 'password'}
              className="registration-input"
              value={form.Password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="registration-show-password"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="registration-eye-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c.75-4.5 5.25-7.5 9.75-7.5s9 3 9.75 7.5c-.75 4.5-5.25 7.5-9.75 7.5s-9-3-9.75-7.5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="registration-eye-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223a10.477 10.477 0 00-.72 1.055C2.25 12 7.5 19.5 12 19.5c1.7 0 3.29-.5 4.68-1.277M21 21l-6-6m0 0a3 3 0 01-4.243-4.243m4.243 4.243L3 3" />
                </svg>
              )}
            </button>
          </div>
          {error && <div className="registration-error">{error}</div>}
          {success && <div className="registration-success">{success}</div>}
          <button type="submit" disabled={loading} className="registration-btn-submit">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Registration;
