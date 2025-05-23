import React from 'react';
import { FileNode } from '../../types/github';

interface RepoSidebarProps {
  isNavOpen: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  error?: string;
  onNavClose: () => void;
  children: React.ReactNode;
}

const RepoSidebar: React.FC<RepoSidebarProps> = ({
  isNavOpen,
  searchQuery,
  setSearchQuery,
  error,
  onNavClose,
  children
}) => {
  return (
    <>
      <aside 
        className={`
          ${isNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
          fixed 
          lg:sticky 
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
          overflow-hidden
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto repo-sidebar-content">
          <nav className="p-3">
            <div className="space-y-0.5">
              {children}
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isNavOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 lg:hidden z-30"
          onClick={onNavClose}
        />
      )}

      <style jsx global>{`
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
        .repo-sidebar-content::-webkit-scrollbar {
          width: 6px;
        }

        .repo-sidebar-content::-webkit-scrollbar-track {
          background-color: transparent;
        }

        .repo-sidebar-content::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }

        .repo-sidebar-content::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
      `}</style>
    </>
  );
};

export default RepoSidebar; 