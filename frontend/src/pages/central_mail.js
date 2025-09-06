import React, { useState } from 'react';
import '../pages/central_mail.css';
import { sendCentralMail } from '../api';

const getSession = () => {
	try {
		const s = localStorage.getItem('session');
		return s ? JSON.parse(s) : {};
	} catch {
		return {};
	}
};
const CentralMail = () => {
	const session = getSession();
	const [subject, setSubject] = useState('');
	const [msg, setMsg] = useState('');
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState('');
	const [error, setError] = useState('');

	if (session.usr_type !== 'Admin') {
		return <div className="central-mail-container"><h2>Access Denied</h2></div>;
	}

	const handleSend = async (e) => {
		e.preventDefault();
		setLoading(true);
		setSuccess('');
		setError('');
		try {
			await sendCentralMail(subject, msg);
			setSuccess('Mail sent to all users successfully!');
			setSubject('');
			setMsg('');
		} catch {
			setError('Failed to send mail.');
		}
		setLoading(false);
	};

	return (
		<div className="central-mail-center">
			<div className="central-mail-container">
                <div className="central-mail-header">
				<h2>Send Central Mail</h2>
                </div>
				<form className="central-mail-form" onSubmit={handleSend}>
					<div>
						<label><b>Subject:</b></label>
						<input
							type="text"
							value={subject}
							onChange={e => setSubject(e.target.value)}
							required
							className="central-mail-input"
						/>
					</div>
					<div>
						<label><b>Message:</b></label>
						<textarea
							value={msg}
							onChange={e => setMsg(e.target.value)}
							required
							className="central-mail-textarea"
							rows={5}
						/>
					</div>
					<button type="submit" className="central-mail-btn" disabled={loading}>
						{loading ? 'Sending...' : 'Send'}
					</button>
				</form>
				{success && <div className="central-mail-success">{success}</div>}
				{error && <div className="central-mail-error">{error}</div>}
			</div>
		</div>
	);
};

export default CentralMail;
