import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import MarkdownRenderer from "../../../components/MarkdownRenderer";
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';

interface TreeItem {
  path: string;
  mode: string;
  type: string;
  sha: string;
  url: string;
  size?: number;
}

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  url?: string;
  download_url?: string;
}

interface Branch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
}

const getLanguageFromFileName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const languageMap: { [key: string]: string } = {
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'yml': 'yaml',
    'yaml': 'yaml',
    'json': 'json',
    'md': 'markdown',
    'markdown': 'markdown',
    'sh': 'bash',
    'bash': 'bash',
    'sql': 'sql',
  };
  return languageMap[extension || ''] || 'plaintext';
};

const isImageFile = (fileName: string): boolean => {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp'];
  return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

const isJsonFile = (fileName: string): boolean => {
  return fileName.toLowerCase().endsWith('.json');
};

export default function RepoDocsPage() {
  const router = useRouter();
  const { owner, repo, token, branch: branchParam } = router.query;
  const { data: session, status } = useSession();
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [currentBranch, setCurrentBranch] = useState<string>("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);

  useEffect(() => {
    if (token) {
      setAccessToken(token as string);
    } else if (typeof window !== 'undefined') {
      const storedToken = sessionStorage.getItem('installationToken');
      if (storedToken) {
        setAccessToken(storedToken);
      } else if (session?.accessToken) {
        setAccessToken(session.accessToken as string);
      } else {
        setError("No authentication token available. Please sign in again.");
        console.error("No access token found in token prop, session storage, or session state");
      }
    }
  }, [token, session]);

  useEffect(() => {
    const validateAndFetchData = async () => {
      if (!accessToken || !owner || !repo) return;

      try {
        setLoading(true);
        setError("");

        // Validate token
        const testResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `token ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'GitHub-Doc-Viewer'
          }
        });

        if (!testResponse.ok) {
          const data = await testResponse.json();
          if (testResponse.status === 401) {
            sessionStorage.removeItem('installationToken');
            setError("Authentication token is invalid or expired. Please sign in again.");
            return;
          }
        }

        // Fetch repository info and branches in parallel
        const [repoResponse, branchesResponse] = await Promise.all([
          fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
              'Authorization': `token ${accessToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'GitHub-Doc-Viewer'
            }
          }),
          fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, {
            headers: {
              'Authorization': `token ${accessToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'GitHub-Doc-Viewer'
            }
          })
        ]);

        const [repoData, branchesData] = await Promise.all([
          repoResponse.json(),
          branchesResponse.json()
        ]);

        if (!repoResponse.ok) {
          throw new Error(repoData.message || 'Failed to fetch repository information');
        }

        if (!branchesResponse.ok) {
          throw new Error(branchesData.message || 'Failed to fetch repository branches');
        }

        // Set default branch from repository data
        setDefaultBranch(repoData.default_branch);
        
        // Set available branches
        setBranches(branchesData);

        // Set current branch based on URL param or default branch
        const targetBranch = branchParam as string || repoData.default_branch;
        setCurrentBranch(targetBranch);

      } catch (err) {
        console.error("Error during initialization:", err);
        setError(err.message || "Failed to initialize repository view");
      } finally {
        setLoading(false);
      }
    };

    validateAndFetchData();
  }, [accessToken, owner, repo, branchParam]);

  useEffect(() => {
    if (currentBranch && accessToken && owner && repo) {
      fetchRepoTree(currentBranch);
    }
  }, [currentBranch, accessToken, owner, repo]);

  useEffect(() => {
    if (selectedFile && selectedFile.type === 'file') {
      fetchFileContent(selectedFile.url);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (fileContent) {
      Prism.highlightAll();
    }
  }, [fileContent]);

  const fetchBranches = async () => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/branches`,
        {
          headers: {
            'Authorization': `token ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'GitHub-Doc-Viewer'
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setBranches(data);
      } else {
        console.error('Error fetching branches:', data);
        setError(data.message || "Failed to fetch repository branches");
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
      setError("Failed to fetch repository branches");
    }
  };

  const handleBranchChange = (branchName: string) => {
    setIsBranchMenuOpen(false);
    if (branchName === currentBranch) return;

    // Update URL with new branch
    router.push({
      pathname: router.pathname,
      query: { ...router.query, branch: branchName }
    }, undefined, { shallow: true });

    setCurrentBranch(branchName);
    setSelectedFile(null);
    setFileContent("");
  };

  const buildFileTree = (items: TreeItem[]): FileNode[] => {
    try {
      const root: { [key: string]: FileNode } = {};
      
      // Sort items to ensure directories come before files
      const sortedItems = [...items].sort((a, b) => {
        if (a.type === 'tree' && b.type !== 'tree') return -1;
        if (a.type !== 'tree' && b.type === 'tree') return 1;
        return a.path.localeCompare(b.path);
      });

      // First pass: create all directories
      sortedItems.forEach(item => {
        if (item.type === 'tree') {
          const parts = item.path.split('/');
          let currentPath = '';
          
          parts.forEach((part, index) => {
            const pathSoFar = currentPath ? `${currentPath}/${part}` : part;
            if (!root[pathSoFar]) {
              root[pathSoFar] = {
                name: part,
                path: pathSoFar,
                type: 'directory',
                children: []
              };
              
              // Add to parent's children if not root
              if (currentPath && root[currentPath]) {
                root[currentPath].children!.push(root[pathSoFar]);
              }
            }
            currentPath = pathSoFar;
          });
        }
      });

      // Second pass: add all files
      sortedItems.forEach(item => {
        if (item.type === 'blob') {
          const parts = item.path.split('/');
          const fileName = parts.pop()!;
          const dirPath = parts.join('/');
          
          const fileNode: FileNode = {
            name: fileName,
            path: item.path,
            type: 'file',
            url: item.url,
            download_url: `https://raw.githubusercontent.com/${owner}/${repo}/${currentBranch}/${item.path}`
          };

          if (parts.length === 0) {
            // Root level file
            root[fileName] = fileNode;
          } else {
            // File inside directory
            if (root[dirPath] && root[dirPath].children) {
              root[dirPath].children!.push(fileNode);
            } else {
              // Create missing directory structure if needed
              let currentPath = '';
              parts.forEach((part, index) => {
                const pathSoFar = currentPath ? `${currentPath}/${part}` : part;
                if (!root[pathSoFar]) {
                  root[pathSoFar] = {
                    name: part,
                    path: pathSoFar,
                    type: 'directory',
                    children: []
                  };
                  
                  // Add to parent's children if not root
                  if (currentPath && root[currentPath]) {
                    root[currentPath].children!.push(root[pathSoFar]);
                  }
                }
                currentPath = pathSoFar;
              });
              
              // Now add the file to the newly created directory
              if (root[dirPath]) {
                root[dirPath].children!.push(fileNode);
              }
            }
          }
        }
      });

      // Get root level nodes (those without '/' in their path)
      const rootNodes = Object.values(root).filter(node => !node.path.includes('/'));

      // Sort root nodes (directories first, then alphabetically)
      rootNodes.sort((a, b) => {
        if (a.type === 'directory' && b.type !== 'directory') return -1;
        if (a.type !== 'directory' && b.type === 'directory') return 1;
        return a.name.localeCompare(b.name);
      });

      // Sort children of all directories
      const sortNodes = (nodes: FileNode[]) => {
        nodes.sort((a, b) => {
          if (a.type === 'directory' && b.type !== 'directory') return -1;
          if (a.type !== 'directory' && b.type === 'directory') return 1;
          return a.name.localeCompare(b.name);
        });
        
        nodes.forEach(node => {
          if (node.type === 'directory' && node.children) {
            sortNodes(node.children);
          }
        });
      };

      rootNodes.forEach(node => {
        if (node.type === 'directory' && node.children) {
          sortNodes(node.children);
        }
      });

      return rootNodes;
    } catch (error) {
      console.error('Error building file tree:', error);
      console.error('Items received:', items);
      throw new Error(`Failed to build file tree: ${error.message}`);
    }
  };

  const fetchRepoTree = async (branch: string) => {
    try {
      setLoading(true);
      setError(""); // Clear any previous errors
      
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
      console.log('Fetching repository tree from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Doc-Viewer'
        }
      });
      
      const data = await response.json();
      
      // Log the response status and headers for debugging
      console.log('API Response Status:', response.status);
      console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        if (!data.tree) {
          console.error('Invalid API response format:', data);
          setError("Invalid response format from GitHub API");
          return;
        }
        
        console.log(`Received ${data.tree.length} items in tree`);
        const tree = buildFileTree(data.tree);
        console.log('Processed tree structure:', tree);
        setFileTree(tree);
      } else {
        console.error('GitHub API Error:', data);
        if (data.message === "Not Found") {
          setError(`Repository or branch "${branch}" not found. Please check if the repository exists and you have access to it.`);
        } else if (data.message?.includes("API rate limit exceeded")) {
          setError("GitHub API rate limit exceeded. Please try again later.");
        } else if (data.message?.includes("Bad credentials")) {
          setError("Authentication failed. Please try signing in again.");
        } else {
          setError(data.message || "Failed to fetch repository structure");
        }
      }
    } catch (err) {
      console.error('Error details:', err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(`Error fetching repository structure: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFileContent = async (url: string) => {
    try {
      setLoading(true);
      const response = await fetch(url, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        const content = data.content ? atob(data.content.replace(/\n/g, '')) : '';
        setFileContent(content);
      } else {
        setError(data.message || "Failed to fetch file content");
      }
    } catch (err) {
      setError("An error occurred while fetching file content");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderFileTree = (nodes: FileNode[], level: number = 0) => {
    return nodes
      .filter(node => 
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (node.type === 'directory' && node.children?.some(child => 
          child.name.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      )
      .map((node) => (
        <div key={node.path} style={{ marginLeft: `${level * 16}px` }}>
          <button
            onClick={() => node.type === 'file' ? setSelectedFile(node) : null}
            className={`w-full text-left px-3 py-2 rounded-lg mb-1 text-sm transition-colors duration-150 flex items-center ${
              selectedFile?.path === node.path
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg 
              className="w-4 h-4 mr-2 flex-shrink-0" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {node.type === 'directory' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              )}
            </svg>
            <span className="truncate">{node.name}</span>
          </button>
          {node.type === 'directory' && node.children && renderFileTree(node.children, level + 1)}
        </div>
      ));
  };

  const renderFileContent = () => {
    if (!selectedFile) return null;

    const fileName = selectedFile.name.toLowerCase();

    // Create content wrapper with consistent styling
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 m-0">
            {selectedFile.name}
          </h2>
          {selectedFile.download_url && (
            <a
              href={selectedFile.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700"
              title="View raw"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>

        <div className="content-wrapper overflow-auto">
          {isImageFile(fileName) ? (
            <div className="flex justify-center items-center bg-gray-50 rounded-lg p-4">
              <img 
                src={selectedFile.download_url} 
                alt={selectedFile.name}
                className="max-w-full max-h-[600px] object-contain"
              />
            </div>
          ) : isJsonFile(fileName) ? (
            <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <code className="language-json">
                {JSON.stringify(JSON.parse(fileContent), null, 2)}
              </code>
            </pre>
          ) : fileName.endsWith('.md') ? (
            <div className="markdown-content">
              <MarkdownRenderer content={fileContent} />
            </div>
          ) : (
            <pre className="line-numbers">
              <code className={`language-${getLanguageFromFileName(fileName)}`}>
                {fileContent}
              </code>
            </pre>
          )}
        </div>
      </div>
    );
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Please sign in to view repository documentation</h2>
        <Link 
          href="/"
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 h-[64px] z-50 shadow-sm">
        <div className="h-full px-6 flex items-center justify-between max-w-[1920px] mx-auto">
          <div className="flex items-center min-w-0 space-x-4">
            <Link 
              href="/"
              className="text-gray-500 hover:text-gray-700 transition-colors duration-150 mr-3 flex-shrink-0 p-2 hover:bg-gray-50 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="flex items-center text-gray-700 min-w-0 flex-shrink">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className="text-base font-semibold truncate">{owner}/{repo}</span>
            </div>

            {/* Branch selector */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
                className="flex items-center h-8 px-3 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 font-medium"
              >
                <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="truncate max-w-[100px]">{currentBranch}</span>
                <svg className="w-4 h-4 ml-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isBranchMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setIsBranchMenuOpen(false)}
                  />
                  <div className="absolute z-20 mt-1 w-56 right-0 bg-white rounded-md shadow-lg border border-gray-200">
                    <div className="py-1 max-h-64 overflow-y-auto">
                      {branches.map((branch) => (
                        <button
                          key={branch.name}
                          onClick={() => handleBranchChange(branch.name)}
                          className={`
                            w-full text-left px-4 py-2 text-sm
                            ${branch.name === currentBranch
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-50'
                            }
                            flex items-center justify-between
                          `}
                        >
                          <span className="truncate">{branch.name}</span>
                          {branch.name === defaultBranch && (
                            <span className="ml-2 text-xs text-gray-400">default</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsNavOpen(!isNavOpen)}
            className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isNavOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
              />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex pt-[64px] h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside 
          className={`
            ${isNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
            fixed 
            lg:relative 
            top-[64px] 
            left-0 
            h-[calc(100vh-64px)] 
            w-[300px]
            flex-shrink-0 
            bg-white 
            border-r 
            border-gray-200 
            transition-transform 
            duration-200 
            ease-in-out 
            z-40
            flex
            flex-col
          `}
        >
          {/* Search header */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 px-3 pr-8 text-sm bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-150 placeholder-gray-400"
                />
                <svg 
                  className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="border-b border-red-100 bg-red-50">
              <div className="px-3 py-2">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* File tree */}
          <div className="flex-1 overflow-y-auto">
            <nav className="p-3">
              <div className="space-y-0.5">
                {renderFileTree(fileTree)}
              </div>
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isNavOpen && (
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-50 lg:hidden z-30"
            onClick={() => setIsNavOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : selectedFile ? (
            <div className="p-6">
              <div className="prose prose-blue max-w-none bg-white rounded-lg">
                {renderFileContent()}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Select a file to view its content</p>
            </div>
          )}
        </main>
      </div>

      <style jsx global>{`
        /* Base styles */
        body {
          margin: 0;
          padding: 0;
        }

        /* File tree item styling */
        .file-tree-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 4px 8px;
          font-size: 0.875rem;
          color: #4b5563;
          border-radius: 4px;
          transition: all 150ms ease-in-out;
        }

        .file-tree-item:hover {
          background-color: #f3f4f6;
        }

        .file-tree-item.active {
          background-color: #eff6ff;
          color: #1d4ed8;
        }

        .file-tree-item .icon {
          margin-right: 8px;
          flex-shrink: 0;
        }

        /* Scrollbar styling */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background-color: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }

        /* Content styling */
        .prose {
          max-width: none !important;
        }

        pre {
          margin: 0;
          padding: 1rem;
          background-color: #1f2937;
          border-radius: 0.5rem;
          overflow-x: auto;
        }

        pre code {
          font-family: 'JetBrains Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
        }

        /* Ensure proper image display */
        .content-wrapper img {
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
} 