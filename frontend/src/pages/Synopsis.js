import React, { useEffect, useState } from 'react';
import './synopsis.css';
import axios from 'axios';
import { fetchAllSynopsis } from '../api';



function Synopsis() {
  const [synopses, setSynopses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    let isMounted = true;
    const fetchData = () => {
      fetchAllSynopsis()
        .then(res => {
          if (isMounted) {
            setSynopses(res.data);
            setLoading(false);
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





  return (
    <div className="synopsis-page">
      <h1 className="synopsis-title">Thesis Synopsis</h1>
      <div className="synopsis-card-list">
        {synopses.map((item) => (
          <div className="synopsis-card" key={item._id}>
            <div className="synopsis-card-header">
              <div className="synopsis-avatar">
                <span role="img" aria-label="avatar">👤</span>
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
        ))}
      </div>
    </div>
  );
}



export default Synopsis;
