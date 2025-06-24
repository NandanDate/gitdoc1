import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import RepoList from "../components/auth/RepoList";
import Sidebar from "../components/layout/Sidebar";

export default function Repositories() {
  const { data: session } = useSession();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.accessToken) {
      setLoading(true);
      setError(""); // Clear any previous errors
      fetch("/api/github/user-repos")
        .then(res => {
          if (!res.ok) {
            return res.json().then(data => {
              throw new Error(data.message || "Failed to fetch repositories");
            });
          }
          return res.json();
        })
        .then(data => {
          setRepos(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, [session]);

  const handleSignOut = async () => {
    localStorage.clear();
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    await signOut({ 
      callbackUrl: '/', 
      redirect: true 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onSignOut={handleSignOut} />
      
      <div className="pl-64">
        <main className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Your Repositories</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage documentation for all your GitHub repositories
            </p>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}
            <RepoList repos={repos} loading={loading} />
          </div>
        </main>
      </div>
    </div>
  );
} 