import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import MarkdownRenderer from "../../../components/MarkdownRenderer";

export default function RepoDocsPage() {
  const router = useRouter();
  const { owner, repo, token } = router.query;
  const { data: session, status } = useSession();
  const [docsFiles, setDocsFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    if (token) {
      setAccessToken(token as string);
    } else if (typeof window !== 'undefined') {
      const storedToken = sessionStorage.getItem('installationToken');
      if (storedToken) {
        setAccessToken(storedToken);
      } else if (session?.accessToken) {
        setAccessToken(session.accessToken as string);
      }
    }
  }, [token, session]);

  useEffect(() => {
    if (accessToken && owner && repo) {
      fetchDocsFiles();
    }
  }, [accessToken, owner, repo]);

  useEffect(() => {
    if (selectedFile) {
      fetchFileContent(selectedFile.download_url);
    }
  }, [selectedFile]);

  const fetchDocsFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/github/repo-docs?owner=${owner}&repo=${repo}`, {
        headers: {
          'Authorization': `token ${accessToken}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setDocsFiles(data.files || []);
        
        const firstMarkdownFile = data.files?.find(file => 
          file.name.toLowerCase().endsWith('.md') || file.name.toLowerCase().endsWith('.markdown')
        );
        
        if (firstMarkdownFile) {
          setSelectedFile(firstMarkdownFile);
        }
      } else {
        setError(data.error || "Failed to fetch documentation files");
      }
    } catch (err) {
      setError("An error occurred while fetching documentation");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFileContent = async (url) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/github/file-content?url=${encodeURIComponent(url)}`, {
        headers: {
          'Authorization': `token ${accessToken}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setFileContent(data.content || "");
      } else {
        setError(data.error || "Failed to fetch file content");
      }
    } catch (err) {
      setError("An error occurred while fetching file content");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div>Loading session...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div>
        <p>Please sign in to view repository documentation</p>
        <Link href="/">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="repo-docs-container">
      <div className="repo-header">
        <h1>{owner}/{repo} Documentation</h1>
        <Link href="/">Back to home</Link>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading && <div className="loading">Loading...</div>}

      <div className="docs-content">
        <div className="sidebar">
          <h3>Files</h3>
          {docsFiles.length === 0 ? (
            <p>No documentation files found</p>
          ) : (
            <ul>
              {docsFiles.map((file) => (
                <li 
                  key={file.path} 
                  className={selectedFile && selectedFile.path === file.path ? "active" : ""}
                  onClick={() => setSelectedFile(file)}
                >
                  {file.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="content-display">
          {selectedFile ? (
            <div>
              <h2>{selectedFile.name}</h2>
              {selectedFile.name.toLowerCase().endsWith('.md') || 
               selectedFile.name.toLowerCase().endsWith('.markdown') ? (
                <MarkdownRenderer content={fileContent} />
              ) : (
                <pre>{fileContent}</pre>
              )}
            </div>
          ) : (
            <div className="placeholder">
              {docsFiles.length > 0 ? 
                "Select a file to view its content" : 
                "No documentation files available"
              }
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .repo-docs-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .repo-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .docs-content {
          display: flex;
          gap: 20px;
          min-height: 500px;
        }
        .sidebar {
          flex: 0 0 250px;
          border: 1px solid #eaeaea;
          border-radius: 5px;
          padding: 15px;
        }
        .sidebar ul {
          list-style: none;
          padding: 0;
        }
        .sidebar li {
          padding: 8px 10px;
          cursor: pointer;
          border-radius: 4px;
        }
        .sidebar li:hover {
          background-color: #f5f5f5;
        }
        .sidebar li.active {
          background-color: #0070f3;
          color: white;
        }
        .content-display {
          flex: 1;
          border: 1px solid #eaeaea;
          border-radius: 5px;
          padding: 20px;
          overflow: auto;
        }
        .placeholder {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 300px;
          color: #666;
        }
        .error-message {
          padding: 10px;
          background-color: #ffebee;
          color: #c62828;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        .loading {
          text-align: center;
          padding: 20px;
          color: #666;
        }
      `}</style>
    </div>
  );
} 