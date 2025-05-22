import React, { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface Repo {
  id: number;
  full_name: string;
  description: string;
  owner: {
    login: string;
  };
  name: string;
  html_url: string;
  default_branch: string;
}

interface RepoListProps {
  repos: Repo[];
  loading: boolean;
}

const RepoList = ({ repos, loading }: RepoListProps) => {
  const [generatingReadme, setGeneratingReadme] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [readmeContent, setReadmeContent] = useState('');

  const handleGenerateReadme = async (repo: Repo) => {
    try {
      setGeneratingReadme(repo.id);
      const response = await fetch('/api/generate-readme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repo_url: repo.html_url,
          branch: repo.default_branch,
          debug: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate README');
      }

      const data = await response.json();
      if (data.status === 'success' && data.readme_content) {
        setReadmeContent(data.readme_content);
        setShowModal(true);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating README:', error);
      alert('Failed to generate README. Please try again.');
    } finally {
      setGeneratingReadme(null);
    }
  };

  const Modal = ({ isOpen, onClose, content }: { isOpen: boolean; onClose: () => void; content: string }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Generated README</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="overflow-y-auto p-6 prose prose-sm max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
          <div className="border-t p-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading repositories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} content={readmeContent} />
      {repos.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-xl font-semibold text-gray-700">No repositories found</p>
          <p className="text-gray-500 mt-2">Repositories you have access to will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {repos.map((repo) => (
            <div 
              key={repo.id} 
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full"
            >
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {repo.full_name}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                    {repo.description || "No description provided"}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-auto pt-4 border-t border-gray-100">
                  <Link 
                    href={`/repos/${repo.owner.login}/${repo.name}`}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex-1"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Docs
                  </Link>
                  <a 
                    href={repo.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 flex-1"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                  <button
                    onClick={() => handleGenerateReadme(repo)}
                    disabled={generatingReadme === repo.id}
                    className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-md hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200 flex-1 ${generatingReadme === repo.id ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {generatingReadme === repo.id ? 'Generating...' : 'Create README'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RepoList; 