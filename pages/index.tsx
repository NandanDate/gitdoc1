import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.accessToken) {
      setLoading(true);
      fetch("/api/github/user-repos")
        .then(res => res.json())
        .then(data => {
          setRepos(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [session]);

  const handleSignOut = async () => {
    // Clear local storage
    localStorage.clear();
    
    // Clear session cookies
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Sign out with NextAuth
    await signOut({ 
      callbackUrl: '/', 
      redirect: true 
    });
  };

  return (
    <div className="container">
      <h1>Centralized GitHub Docs</h1>
      
      {!session ? (
        <div className="auth-section">
          <p>Sign in with your GitHub account to access repository documentation</p>
          <button 
            className="sign-in-button" 
            onClick={() => signIn("github", { 
              callbackUrl: '/',
              redirect: true,
              prompt: 'login'
            })}
          >
            Sign in with GitHub
          </button>
        </div>
      ) : (
        <div className="user-section">
          <div className="user-header">
            <div className="user-info">
              <img 
                src={session.user.image} 
                alt={session.user.name} 
                className="avatar"
              />
              <p>Welcome, {session.user.name}</p>
            </div>
            <div className="user-actions">
              <Link href="/org-access" className="org-access-button">
                Organization Access
              </Link>
              <button 
                className="sign-out-button" 
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
          </div>
          
          <h2>Your Repositories</h2>
          
          {loading ? (
            <p>Loading repositories...</p>
          ) : (
            <div className="repo-list">
              {repos.length === 0 ? (
                <p>No repositories found</p>
              ) : (
                <ul>
                  {repos.map((repo: any) => (
                    <li key={repo.id} className="repo-item">
                      <div className="repo-details">
                        <h3>{repo.full_name}</h3>
                        <p>{repo.description || "No description"}</p>
                      </div>
                      <div className="repo-actions">
                        <Link 
                          href={`/repos/${repo.owner.login}/${repo.name}`}
                          className="docs-link"
                        >
                          View Docs
                        </Link>
                        <a 
                          href={repo.html_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="github-link"
                        >
                          GitHub →
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }
        
        h1 {
          margin-bottom: 30px;
          color: #333;
          text-align: center;
        }
        
        .auth-section {
          text-align: center;
          padding: 40px 0;
        }
        
        .sign-in-button {
          background-color: #2ea44f;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
        }
        
        .user-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        
        .user-info {
          display: flex;
          align-items: center;
        }
        
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 10px;
        }
        
        .user-actions {
          display: flex;
          gap: 10px;
        }
        
        .org-access-button {
          background-color: #0070f3;
          color: white;
          padding: 8px 16px;
          border-radius: 5px;
          text-decoration: none;
          display: inline-block;
        }
        
        .sign-out-button {
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          padding: 8px 16px;
          border-radius: 5px;
          cursor: pointer;
        }
        
        .repo-list ul {
          list-style: none;
          padding: 0;
        }
        
        .repo-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border: 1px solid #eaeaea;
          border-radius: 5px;
          margin-bottom: 15px;
        }
        
        .repo-details {
          flex: 1;
        }
        
        .repo-details h3 {
          margin: 0 0 5px 0;
        }
        
        .repo-details p {
          margin: 0;
          color: #666;
        }
        
        .repo-actions {
          display: flex;
          gap: 10px;
        }
        
        .docs-link {
          background-color: #0070f3;
          color: white;
          padding: 8px 16px;
          border-radius: 5px;
          text-decoration: none;
        }
        
        .github-link {
          background-color: #f5f5f5;
          color: #333;
          padding: 8px 16px;
          border-radius: 5px;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
} 