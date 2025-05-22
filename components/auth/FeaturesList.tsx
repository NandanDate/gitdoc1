import React from 'react';

const FeaturesList = () => {
  return (
    <div className="features-list">
      <div className="feature-item">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
        <div>
          <h3>Centralized Access</h3>
          <p>All your repository documentation in one place</p>
        </div>
      </div>
      <div className="feature-item">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
        </svg>
        <div>
          <h3>Easy Management</h3>
          <p>Seamless documentation organization</p>
        </div>
      </div>
      <div className="feature-item">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
        </svg>
        <div>
          <h3>Secure Access</h3>
          <p>Protected by GitHub authentication</p>
        </div>
      </div>

      <style jsx>{`
        .features-list {
          width: 100%;
        }
        
        .feature-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 30px;
          color: #24292e;
        }
        
        .feature-item:last-child {
          margin-bottom: 0;
        }
        
        .feature-item svg {
          margin-right: 15px;
          color: #0366d6;
          flex-shrink: 0;
        }
        
        .feature-item h3 {
          margin: 0 0 5px 0;
          font-size: 1.1rem;
          font-weight: 600;
        }
        
        .feature-item p {
          margin: 0;
          color: #586069;
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
};

export default FeaturesList; 