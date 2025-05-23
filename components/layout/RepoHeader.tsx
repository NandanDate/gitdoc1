import React from 'react';
import Link from 'next/link';
import { Branch } from '../../types/github';

interface RepoHeaderProps {
  owner: string;
  repo: string;
  currentBranch: string;
  defaultBranch: string;
  branches: Branch[];
  isNavOpen: boolean;
  isBranchMenuOpen: boolean;
  setIsNavOpen: (isOpen: boolean) => void;
  setIsBranchMenuOpen: (isOpen: boolean) => void;
  onBranchChange: (branchName: string) => void;
}

const RepoHeader: React.FC<RepoHeaderProps> = ({
  owner,
  repo,
  currentBranch,
  defaultBranch,
  branches,
  isNavOpen,
  isBranchMenuOpen,
  setIsNavOpen,
  setIsBranchMenuOpen,
  onBranchChange,
}) => {
  return (
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
                        onClick={() => onBranchChange(branch.name)}
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
  );
};

export default RepoHeader; 