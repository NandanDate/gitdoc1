import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import LoginPage from "../components/auth/LoginPage";
import Sidebar from "../components/layout/Sidebar";
import DashboardCharts from "../components/dashboard/DashboardCharts";

export default function Home() {
  const { data: session } = useSession();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.accessToken) {
      setLoading(true);
      setError("");
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
          // Ensure data is an array
          if (!Array.isArray(data)) {
            console.error("Received non-array data:", data);
            setRepos([]);
            throw new Error("Invalid data format received from server");
          }
          setRepos(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching repos:", err);
          setError(err.message);
          setRepos([]); // Ensure repos is an empty array on error
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

  if (!session) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onSignOut={handleSignOut} />
      
      <div className="pl-64">
        <main className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Overview of your repository statistics and recent activity
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
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

          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin"></div>
                <p className="text-gray-600">Loading dashboard data...</p>
              </div>
            </div>
          ) : (
            <>
              <DashboardCharts repos={repos} />
              
              <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-xl p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                  <p className="text-sm text-gray-500">Your most recently updated repositories</p>
                </div>
                
                <div className="space-y-4">
                  {repos.length > 0 ? (
                    repos.slice(0, 5).map((repo) => (
                      <div 
                        key={repo.id} 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transform hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 hover:border-gray-200 hover:shadow-[0_4px_12px_rgb(0,0,0,0.05)]"
                      >
                        <div>
                          <h3 className="font-medium text-gray-900">{repo.full_name}</h3>
                          <p className="text-sm text-gray-500">
                            Last updated: {new Date(repo.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <a
                          href={`/repos/${repo.owner.login}/${repo.name}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center group"
                        >
                          View Docs
                          <svg 
                            className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No repositories found</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
} 