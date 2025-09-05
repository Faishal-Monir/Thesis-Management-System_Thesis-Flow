import React, { useState } from 'react';
import './forgotpassword.css';
import { resetPassword, sendRegistrationEmail } from '../api';

function ForgotPassword() {
	const cached = JSON.parse(localStorage.getItem('resetUser') || '{}');
	const student_id = cached.student_id || '';
	const mail = cached.mail || '';
	const [newPassword, setNewPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');
		setLoading(true);
		try {
			if (!student_id) {
				setError('Student ID not found. Please request a reset link again.');
				setLoading(false);
				return;
			}
			await resetPassword({ student_id, new_password: newPassword });
					await sendRegistrationEmail({
						mail,
						subject: 'Password Reset Successful',
						msg: `Your password has been successfully reset for your Thesis Management System account.\n\n You can use this link: ${process.env.REACT_APP_FRONTEND_BASE_URL}/login to login with your new password.`
					});
			setSuccess('Password reset successful! Confirmation email sent.');
			setTimeout(() => {
				window.location.href = '/login';
			}, 3000);
		} catch (err) {
			setError('Failed to reset password.');
		}
		setLoading(false);
	};

	return (
		<div className="home-bg-container">
			<video className="home-bg-video" src="/bgvideo.mp4" autoPlay loop muted playsInline />
			<div className="home-bg-gradient"></div>
			<div className="home-content login-content">
				<form className="login-form" onSubmit={handleSubmit}>
					<h2 className="login-title">Reset Password</h2>
					<label htmlFor="newPassword" className="login-label">New Password</label>
					<div className="login-password-wrapper">
						<input
							id="newPassword"
							type={showPassword ? 'text' : 'password'}
							className="login-input"
							value={newPassword}
							onChange={e => setNewPassword(e.target.value)}
							required
							disabled={loading}
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
					{error && <div className="login-error">{error}</div>}
					{success && <div className="login-success">{success}</div>}
					<button
						type="submit"
						disabled={loading}
						className="login-btn-signin"
					>
						{loading ? 'Resetting...' : 'Reset Password'}
					</button>
					<div className="login-or">Back to login?</div>
					<button
						type="button"
						onClick={() => window.location.href = '/login'}
						className="login-btn-register"
					>
						Login
					</button>
				</form>
			</div>
		</div>
	);
}

export default ForgotPassword;