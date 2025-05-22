import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import RepoList from "../components/auth/RepoList";
import Sidebar from "../components/layout/Sidebar";

export default function Repositories() {
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
            <RepoList repos={repos} loading={loading} />
          </div>
        </main>
      </div>
    </div>
  );
} 