import React from 'react';
import Link from 'next/link';
import { Session } from 'next-auth';

interface UserHeaderProps {
  session: Session;
  onSignOut: () => void;
}

const UserHeader = ({ session, onSignOut }: UserHeaderProps) => {
  return (
    <div className="flex items-center space-x-4">
      <Link 
        href="/org-access"
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
      >
        <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        Organization Access
      </Link>
      
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-3">
          <img 
            src={session.user?.image!} 
            alt={session.user?.name!} 
            className="w-8 h-8 rounded-full border border-gray-200"
          />
          <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">
            {session.user?.name}
          </span>
        </div>
        
        <button 
          onClick={onSignOut}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  );
};

export default UserHeader; 