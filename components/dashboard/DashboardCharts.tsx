import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

interface DashboardChartsProps {
  repos: any[];
}

const DashboardCharts = ({ repos }: DashboardChartsProps) => {
  // Calculate repository size distribution
  const sizeData = repos.map(repo => ({
    name: repo.name,
    size: repo.size / 1024, // Convert to MB
    stars: repo.stargazers_count,
    forks: repo.forks_count,
  }))
  .sort((a, b) => b.size - a.size)
  .slice(0, 5);

  // Calculate stars and forks over time
  const engagementData = repos
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map(repo => ({
      name: repo.name,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      watchers: repo.watchers_count,
    }))
    .slice(-10); // Get last 10 repositories

  // Calculate language statistics for summary card
  const languageStats = repos.reduce((acc, repo) => {
    if (repo.language && !acc[repo.language]) {
      acc[repo.language] = true;
    }
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Top Repositories by Size */}
      <div className="bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow duration-300">
        <h3 className="text-lg font-semibold mb-4">Top Repositories by Size</h3>
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
      </div>

      {/* Repository Engagement Trends */}
      <div className="bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow duration-300">
        <h3 className="text-lg font-semibold mb-4">Repository Engagement</h3>
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
            {repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow duration-300">
          <h4 className="text-sm font-medium text-gray-500">Total Forks</h4>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {repos.reduce((sum, repo) => sum + repo.forks_count, 0)}
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