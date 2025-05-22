import React from 'react';
import { signIn } from 'next-auth/react';
import GitHubIcon from './GitHubIcon';
import FeaturesList from './FeaturesList';

const LoginPage = () => {
  return (
    <div className="auth-section">
      <div className="auth-content">
        <div className="auth-left">
          <div className="auth-main">
            <div className="brand-section">
              <h1>CodeBooks</h1>
              <div className="brand-tagline">Your documentation, unified and organized</div>
            </div>
            <h2>Welcome back!</h2>
            <p>Sign in with your GitHub account to access and manage your repository documentation in one place. Keep all your documentation organized and easily accessible.</p>
            <button 
              className="sign-in-button" 
              onClick={() => signIn("github", { 
                callbackUrl: '/',
                redirect: true,
                prompt: 'login'
              })}
            >
              <GitHubIcon />
              <span>Sign in with GitHub</span>
            </button>
          </div>
        </div>
        <div className="auth-right">
          <FeaturesList />
        </div>
      </div>

      <style jsx>{`
        .auth-section {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0a1518 0%, #1a2f36 50%, #234450 100%);
          padding: 20px;
          margin: 0;
          box-sizing: border-box;
          position: fixed;
          top: 0;
          left: 0;
        }
        
        .auth-content {
          display: flex;
          width: 100%;
          max-width: 1400px;
          min-height: 600px;
          background: rgba(255, 255, 255, 0.98);
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          backdrop-filter: blur(10px);
        }
        
        .auth-left {
          flex: 1;
          padding: 60px;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .auth-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .brand-section {
          margin-bottom: 40px;
        }

        h1 {
          color: #1a202c;
          font-size: 3rem;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .brand-tagline {
          color: #4a5568;
          font-size: 1.1rem;
          margin-top: 8px;
        }
        
        .auth-right {
          flex: 1;
          background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%);
          padding: 60px;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .auth-right::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent);
        }
        
        h2 {
          color: #2d3748;
          font-size: 1.75rem;
          font-weight: 600;
          margin-bottom: 20px;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }
        
        p {
          color: #4a5568;
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 40px;
          max-width: 500px;
        }
        
        .sign-in-button {
          background: linear-gradient(135deg, #24292e 0%, #1a202c 100%);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          align-self: flex-start;
          position: relative;
          overflow: hidden;
        }
        
        .sign-in-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }
        
        .sign-in-button:active {
          transform: translateY(0);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .sign-in-button::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .sign-in-button:hover::after {
          opacity: 1;
        }

        @media (max-width: 1200px) {
          .auth-content {
            margin: 0;
            border-radius: 0;
            min-height: 100vh;
          }
        }

        @media (max-width: 1024px) {
          .auth-content {
            flex-direction: column;
          }

          .auth-left, .auth-right {
            padding: 40px;
          }

          .auth-right {
            border-left: none;
          }

          h2 {
            font-size: 2rem;
          }
        }

        @media (max-width: 640px) {
          .auth-left, .auth-right {
            padding: 30px;
          }

          .auth-section {
            padding: 0;
          }

          h1 {
            font-size: 2.5rem;
          }

          h2 {
            font-size: 1.5rem;
          }

          p {
            font-size: 1rem;
          }

          .sign-in-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage; 