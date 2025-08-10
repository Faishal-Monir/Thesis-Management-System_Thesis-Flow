import React from "react";
import "./Home.css";

function Home() {
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
      <div className="home-content">
        <div style={{ maxWidth: 700, width: "100%" }}>
          <h1 className="home-title">Brac University</h1>
          <h2 className="home-subtitle">
            Department of Computer Science and Engineering
          </h2>
          <div className="home-btn-group">
            <a href="/login" className="home-btn login">
              Login
            </a>
            <a href="/register" className="home-btn register">
              Register
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
