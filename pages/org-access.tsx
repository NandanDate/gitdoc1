import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";

// Define interfaces for TypeScript type checking
interface Installation {
  id: number;
  account: {
    login: string;
    avatar_url: string;
    type: string;
  };
  permissions?: Record<string, string>;
}

interface Repository {
  id: number;
  name: string;
  description: string | null;
  owner: {
    login: string;
  };
}

interface Organization {
  login: string;
  id: number;
}

export default function OrgAccess() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [userOrgs, setUserOrgs] = useState<Organization[]>([]);
  const [selectedInstallation, setSelectedInstallation] = useState<Installation | null>(null);
  const [installationToken, setInstallationToken] = useState("");
  const [orgRepos, setOrgRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch GitHub App installations and user's organizations when component loads
  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      loadData();
    }
  }, [status, session]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch all installations first
      const installationsResponse = await fetch("/api/github/raw-installations");
      
      if (!installationsResponse.ok) {
        const errorData = await installationsResponse.json();
        throw new Error(errorData.message || "Failed to fetch GitHub App installations");
      }
      
      const installationsData = await installationsResponse.json();
      const allInstallations = installationsData.installations || [];
      setInstallations(allInstallations);
      
      // Then fetch user's organizations
      try {
        const orgsResponse = await fetch("https://api.github.com/user/orgs", {
          headers: {
            Authorization: `token ${session.accessToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "GitHub-Docs-Hub"
          }
        });
        
        if (orgsResponse.ok) {
          const userOrgsData = await orgsResponse.json();
          setUserOrgs(userOrgsData);
        }
      } catch (orgsError) {
        console.error("Error fetching user organizations:", orgsError);
      }
    } catch (err: any) {
      setError("Error loading data: " + err.message);
      console.error("Data loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInstallationSelect = async (installation: Installation) => {
    setSelectedInstallation(installation);
    
    try {
      setLoading(true);
      setError("");
      
      // Use only the raw-token endpoint
      const tokenResponse = await fetch(
        `/api/github/raw-token?installationId=${installation.id}`
      );
      
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(errorData.message || "Failed to generate installation token");
      }
      
      const tokenData = await tokenResponse.json();
      
      if (!tokenData.token) {
        throw new Error("No token returned from API");
      }
      
      setInstallationToken(tokenData.token);
      
      // Get organization repositories if it's an organization installation
      if (installation.account.type === "Organization") {
        await fetchOrgRepos(installation.account.login, tokenData.token);
      }
    } catch (err: any) {
      setError("Error generating token: " + err.message);
      console.error("Token generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgRepos = async (orgName: string, token: string) => {
    try {
      setLoading(true);
      
      // Get user's personal access token from session
      const userToken = session?.accessToken as string;
      
      const apiUrl = `/api/github/org-repos?orgName=${orgName}&installationToken=${token}${userToken ? `&userAccessToken=${userToken}` : ''}`;
      
      const reposResponse = await fetch(apiUrl);
      
      if (!reposResponse.ok) {
        const errorData = await reposResponse.json();
        throw new Error(errorData.message || "Failed to fetch organization repositories");
      }
      
      const reposData = await reposResponse.json();
      setOrgRepos(reposData.repos || []);
    } catch (err: any) {
      setError("Error fetching repositories: " + err.message);
      console.error("Repository fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const navigateToRepoDocumentation = (repo: Repository) => {
    const owner = repo.owner.login;
    const repoName = repo.name;
    
    // Store the installation token in session storage for use in repo documentation
    sessionStorage.setItem('installationToken', installationToken);
    
    // Navigate to the repository documentation page
    router.push(`/repos/${owner}/${repoName}?token=${encodeURIComponent(installationToken)}`);
  };

  if (status === "loading") {
    return <div>Loading session...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="container">
        <h1>Access Denied</h1>
        <p>You must be signed in to access organization resources.</p>
        <Link href="/">Back to Home</Link>
      </div>
    );
  }

  // Filter installations to only show organizations the user is a member of
  const filteredInstallations = installations.filter(installation => 
    installation.account.type === "Organization" &&
    userOrgs.some(org => org.login.toLowerCase() === installation.account.login.toLowerCase())
  );

  return (
    <div className="container">
      <header>
        <h1>Organization Access via GitHub App</h1>
        <Link href="/">Back to Home</Link>
      </header>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="content">
        <div className="installations-section">
          <h2>Your Organizations with GitHub App</h2>
          
          {loading && <p>Loading...</p>}
          
          {filteredInstallations.length === 0 ? (
            <p>No GitHub App installations found in your organizations</p>
          ) : (
            <ul className="installations-list">
              {filteredInstallations.map((installation) => (
                <li 
                  key={installation.id}
                  className={selectedInstallation && selectedInstallation.id === installation.id ? "selected" : ""}
                  onClick={() => handleInstallationSelect(installation)}
                >
                  <div className="account-info">
                    <img 
                      src={installation.account.avatar_url} 
                      alt={installation.account.login}
                      className="avatar"
                    />
                    <div>
                      <h3>{installation.account.login}</h3>
                      <p className="account-type">{installation.account.type}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {selectedInstallation && (
          <div className="repos-section">
            <h2>Repositories for {selectedInstallation.account.login}</h2>
            
            {installationToken && (
              <div className="permissions-info">
                <h3>GitHub App Permissions</h3>
                <p>This installation has the following permissions:</p>
                <ul>
                  {selectedInstallation.permissions && 
                    Object.entries(selectedInstallation.permissions).map(([perm, level]) => (
                      <li key={perm}>{perm}: {level}</li>
                    ))
                  }
                </ul>
                <p className="note">
                  Note: If you don't see repositories, ensure your GitHub App has "Repository: Contents" 
                  and "Repository: Metadata" permissions.
                </p>
              </div>
            )}
            
            {loading && <p>Loading repositories...</p>}
            
            {!loading && orgRepos.length === 0 ? (
              <div className="no-repos">
                <p>No repositories found</p>
                <p className="help-text">
                  This may happen because:
                  <ul>
                    <li>The organization has no repositories</li>
                    <li>The GitHub App doesn't have the required permissions</li>
                    <li>You don't have access to view the repositories</li>
                  </ul>
                </p>
              </div>
            ) : (
              <ul className="repos-list">
                {orgRepos.map((repo) => (
                  <li key={repo.id} onClick={() => navigateToRepoDocumentation(repo)}>
                    <div className="repo-info">
                      <h3>{repo.name}</h3>
                      <p>{repo.description || "No description"}</p>
                    </div>
                    <button className="view-docs-btn">View Docs</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .content {
          display: flex;
          gap: 30px;
        }

        .installations-section,
        .repos-section {
          flex: 1;
          border: 1px solid #eaeaea;
          border-radius: 8px;
          padding: 20px;
        }

        .installations-list,
        .repos-list {
          list-style: none;
          padding: 0;
        }

        .installations-list li,
        .repos-list li {
          cursor: pointer;
          border: 1px solid #eaeaea;
          border-radius: 5px;
          padding: 15px;
          margin-bottom: 10px;
          transition: all 0.2s ease;
        }

        .installations-list li:hover,
        .repos-list li:hover {
          background-color: #f5f5f5;
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .installations-list li.selected {
          border-color: #0070f3;
          background-color: rgba(0, 112, 243, 0.05);
        }

        .account-info {
          display: flex;
          align-items: center;
        }

        .avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          margin-right: 15px;
        }

        .account-type {
          color: #666;
          font-size: 14px;
        }

        .repos-list li {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .repo-info {
          flex: 1;
        }

        .repo-info h3 {
          margin: 0 0 5px 0;
        }

        .repo-info p {
          color: #666;
          margin: 0;
        }

        .view-docs-btn {
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 5px;
          padding: 8px 15px;
          cursor: pointer;
        }

        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 10px 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }

        .permissions-info {
          background-color: #f8f9fa;
          border-radius: 5px;
          padding: 15px;
          margin-bottom: 20px;
          font-size: 14px;
        }
        
        .permissions-info h3 {
          margin-top: 0;
          margin-bottom: 10px;
        }
        
        .note {
          font-style: italic;
          color: #666;
          margin-top: 10px;
        }
        
        .no-repos {
          background-color: #f8f9fa;
          border-radius: 5px;
          padding: 15px;
        }
        
        .help-text {
          color: #666;
          font-size: 14px;
        }
        
        .help-text ul {
          margin-top: 5px;
          padding-left: 20px;
        }
      `}</style>
    </div>
  );
} 