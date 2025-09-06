import React, { useEffect, useState } from 'react';
import './synopsis.css';
import { fetchAllSynopsis, fetchUserByEmail } from '../api';



function Synopsis() {
  const [synopses, setSynopses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [profilePics, setProfilePics] = useState({});


  useEffect(() => {
    let isMounted = true;
    const fetchData = () => {
      fetchAllSynopsis()
        .then(async res => {
          if (isMounted) {
            setSynopses(res.data);
            setLoading(false);
            const picPromises = res.data.map(async item => {
              try {
                const userRes = await fetchUserByEmail(item.mail);
                return { email: item.mail, pic: userRes.data.profile_pic };
              } catch {
                return { email: item.mail, pic: null };
              }
            });
            const pics = await Promise.all(picPromises);
            const picMap = {};
            pics.forEach(({ email, pic }) => {
              picMap[email] = pic;
            });
            setProfilePics(picMap);
          }
        })
        .catch(err => {
          if (isMounted) {
            setError('Failed to load synopsis data');
            setLoading(false);
          }
        });
    };
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) return <div className="synopsis-loading">Loading...</div>;
  if (error) return <div className="synopsis-error">{error}</div>;





  // Filter synopses by search
  const filtered = synopses.filter(item => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.mail && item.mail.toLowerCase().includes(q)) ||
      (item.topic && item.topic.toLowerCase().includes(q))
    );
  });

  return (
    <div className="synopsis-page">
      <h1 className="synopsis-title">Thesis Synopsis</h1>
      <div className="synopsis-searchbar-container">
        <form className="synopsis-searchbar-box" onSubmit={e => e.preventDefault()}>
          <span className="synopsis-search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="22" height="22">
              <circle cx="11" cy="11" r="7" strokeWidth="2" stroke="currentColor" fill="none" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" strokeWidth="2" stroke="currentColor" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by topic, faculty name, or email..."
            className="synopsis-search-input"
          />
        </form>
      </div>
      <div className="synopsis-card-list">
        {filtered.length === 0 ? (
          <div className="synopsis-error">No matching data found.</div>
        ) : (
          filtered.map((item) => (
            <div className="synopsis-card" key={item._id}>
              <div className="synopsis-card-header">
                <div className="synopsis-avatar synopsis-avatar-img">
                  <img
                    src={profilePics[item.mail] ? profilePics[item.mail] : require('./user.png')}
                    alt="avatar"
                    className="synopsis-avatar-img-el"
                    onError={e => { e.target.onerror = null; e.target.src = require('./user.png'); }}
                  />
                </div>
                <div className="synopsis-card-info">
                  <div className="synopsis-card-name">{item.name}</div>
                  <div className="synopsis-card-mail">
                    {item.mail}
                    <button
                      type="button"
                      className="ml-1 inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      onClick={() => navigator.clipboard.writeText(item.mail)}
                      title="Copy email"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v-1.125A2.625 2.625 0 0 0 13.875 2.25h-7.5A2.625 2.625 0 0 0 3.75 4.875v12.75A2.625 2.625 0 0 0 6.375 20.25H12" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 8.25h-7.5A2.25 2.25 0 0 0 9 10.5v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 21 18V10.5a2.25 2.25 0 0 0-2.25-2.25z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="synopsis-card-topic">
                <span className="block mb-1 text-sm font-medium text-gray-700">Topic</span>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.05rem', color: '#333' }}>{item.topic}</span>
              </div>
              <div className="synopsis-card-status">
                <span className={item.status === 1 ? 'status-dot taken' : 'status-dot available'}></span>
                Status: {item.status === 1 ? 'Taken' : 'Available'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}



export default Synopsis;
