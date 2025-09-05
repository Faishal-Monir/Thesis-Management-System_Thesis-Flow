import React, { useState } from 'react';
import './login.css';
import { fetchUserByEmail, fetchPasswordByEmail } from '../api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {

      const res = await fetchUserByEmail(email);
      const user = res.data;

      const passRes = await fetchPasswordByEmail(email);
      const decryptedPassword = passRes.data.decryptedPassword;
      if (password === decryptedPassword) {


        const sessionData = {
          Name: user.Name,
          student_id: user.student_id,
          mail: user.mail,
          usr_type: user.usr_type,
        };
    localStorage.setItem('session', JSON.stringify(sessionData));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loginTime', Date.now().toString());
    window.location.href = `${process.env.REACT_APP_FRONTEND_BASE_URL}/dashboard`;



      } else {
        setError('Password is incorrect. Try again.');
      }
    } catch (err) {
      setError('Invalid email or password.');
    }
    setLoading(false);
  };

  return (
    <div className="home-bg-container">
      <video
        className="home-bg-video"
        src="/bgvideo.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="home-bg-gradient"></div>
      <div className="home-content login-content">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2 className="login-title">Sign in to your account</h2>
          <label htmlFor="email" className="login-label">Student ID or Email</label>
          <input
            id="email"
            type="text"
            className="login-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <label htmlFor="password" className="login-label">Password</label>
          <div className="login-password-wrapper">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="login-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="login-show-password"
              tabIndex={-1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="login-eye-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c.75-4.5 5.25-7.5 9.75-7.5s9 3 9.75 7.5c-.75 4.5-5.25 7.5-9.75 7.5s-9-3-9.75-7.5z" />
              </svg>
            </button>
          </div>
          <div className="login-forgot-wrapper">
            <a href="/forgotpass_submission" className="login-forgot">Forgot Password?</a>
          </div>
          {error && <div className="login-error">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="login-btn-signin"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          <div className="login-or">Don't have an account ? </div>
          <button
            type="button"
            onClick={() => window.location.href = '/register'}
            className="login-btn-register"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

