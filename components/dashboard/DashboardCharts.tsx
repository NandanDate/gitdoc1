import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

interface Repository {
  id: number;
  name: string;
  size: number;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string | null;
  created_at: string;
}

interface DashboardChartsProps {
  repos: Repository[];
}

const DashboardCharts = ({ repos = [] }: DashboardChartsProps) => {
  // Ensure repos is an array
  if (!Array.isArray(repos)) {
    console.error('Invalid repos data:', repos);
    repos = [];
  }

  // Calculate repository size distribution
  const sizeData = repos.map(repo => ({
    name: repo.name,
    size: (repo.size || 0) / 1024, // Convert to MB, default to 0 if undefined
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
  }))
  .sort((a, b) => b.size - a.size)
  .slice(0, 5);

  // Calculate stars and forks over time
  const engagementData = repos
    .filter(repo => repo.created_at) // Only include repos with valid created_at
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map(repo => ({
      name: repo.name,
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      watchers: repo.watchers_count || 0,
    }))
    .slice(-10); // Get last 10 repositories

  // Calculate language statistics for summary card
  const languageStats = repos.reduce((acc, repo) => {
    if (repo.language && !acc[repo.language]) {
      acc[repo.language] = true;
    }
    return acc;
  }, {} as Record<string, boolean>);

  const NoDataMessage = () => (
    <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-gray-500">No data available</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Top Repositories by Size */}
      <div className="bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow duration-300">
        <h3 className="text-lg font-semibold mb-4">Top Repositories by Size</h3>
        {sizeData.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sizeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" unit=" MB" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip
                  formatter={(value: number) => `${value.toFixed(2)} MB`}
                  labelStyle={{ color: '#111827' }}
                />
                <Bar dataKey="size" fill="#3B82F6" name="Size (MB)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <NoDataMessage />
        )}
      </div>

      {/* Repository Engagement Trends */}
      <div className="bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow duration-300">
        <h3 className="text-lg font-semibold mb-4">Repository Engagement</h3>
        {engagementData.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="stars" stroke="#F59E0B" name="Stars" />
                <Line type="monotone" dataKey="forks" stroke="#10B981" name="Forks" />
                <Line type="monotone" dataKey="watchers" stroke="#6366F1" name="Watchers" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <NoDataMessage />
        )}
      </div>

      {/* Summary Cards */}
      <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow duration-300">
          <h4 className="text-sm font-medium text-gray-500">Total Repositories</h4>
          <p className="text-2xl font-bold text-gray-900 mt-2">{repos.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow duration-300">
          <h4 className="text-sm font-medium text-gray-500">Total Stars</h4>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow duration-300">
          <h4 className="text-sm font-medium text-gray-500">Total Forks</h4>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {repos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow duration-300">
          <h4 className="text-sm font-medium text-gray-500">Languages Used</h4>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {Object.keys(languageStats).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts; 