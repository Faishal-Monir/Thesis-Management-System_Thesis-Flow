import React, { useState, useRef } from 'react';
import './forgotpass_submission.css';
import { checkUserExists, sendRegistrationEmail } from '../api';

function ForgotPassSubmission() {
	const [input, setInput] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [loading, setLoading] = useState(false);
	const [timer, setTimer] = useState(0);
	const timerRef = useRef(null);

		const handleSubmit = async (e) => {
			e.preventDefault();
			setError('');
			setSuccess('');
			setLoading(true);
			try {
				const res = await checkUserExists(input);
				const user = res.data;
				if (!user || !user.mail) {
					setError('User not found.');
					setLoading(false);
					return;
				}
			
				localStorage.setItem('resetUser', JSON.stringify({
					mail: user.mail,
					student_id: user.student_id
				}));

		
						await sendRegistrationEmail({
							mail: user.mail,
							subject: 'Password Reset Request',
							msg: `You requested a password reset for your Thesis Management System account. Click the link below to reset your password:\n\n${process.env.REACT_APP_FRONTEND_BASE_URL}/forgotpassword
												\n\nIf you did not request this, please ignore this email.`
						});

				setSuccess('Reset link sent to your email.');
				setTimer(30);
				timerRef.current = setInterval(() => {
					setTimer(prev => {
						if (prev <= 1) {
							clearInterval(timerRef.current);
							return 0;
						}
						return prev - 1;
					});
				}, 1000);
			} catch (err) {
				setError('User not found.');
			}
			setLoading(false);
		};

	React.useEffect(() => {
		return () => clearInterval(timerRef.current);
	}, []);

	return (
		<div className="home-bg-container">
			<video className="home-bg-video" src="/bgvideo.mp4" autoPlay loop muted playsInline />
			<div className="home-bg-gradient"></div>
			<div className="home-content login-content">
				<form className="login-form" onSubmit={handleSubmit}>
					<h2 className="login-title">Forgot Password</h2>
					<label htmlFor="input" className="login-label">Student ID or Email</label>
					<input
						id="input"
						type="text"
						className="login-input"
						value={input}
						onChange={e => setInput(e.target.value)}
						required
						disabled={loading || timer > 0}
					/>
					{error && <div className="login-error">{error}</div>}
					{success && <div className="login-success">{success}</div>}
					<button
						type="submit"
						disabled={loading || timer > 0}
						className="login-btn-signin"
					>
						{timer > 0 ? `Wait ${timer}s` : (loading ? 'Sending...' : 'Send Reset Link')}
					</button>
					<div className="login-or">Remembered your password?</div>
					<button
						type="button"
						onClick={() => window.location.href = '/login'}
						className="login-btn-register"
					>
						Back to Login
					</button>
				</form>
			</div>
		</div>
	);
}

export default ForgotPassSubmission;