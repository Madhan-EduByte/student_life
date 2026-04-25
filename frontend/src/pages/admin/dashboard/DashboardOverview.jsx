import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    total_students: 0,
    active_roadmaps: 0,
    at_risk_students: 0,
    system_health: 'checking...'
  });

  useEffect(() => {
    // Fetch dashboard stats from the FastAPI admin endpoint
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to load admin stats:', error);
        setStats((prev) => ({ ...prev, system_health: 'error' }));
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Global Command Center</h1>
        <p className="text-gray-600 mt-1">
          Welcome back. Here is your high-level intelligence view.
        </p>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Students" value={stats.total_students} color="bg-blue-500" />
        <StatCard title="Active Roadmaps" value={stats.active_roadmaps} color="bg-indigo-500" />
        <StatCard title="At-Risk Students" value={stats.at_risk_students} color="bg-red-500" />
        <StatCard 
          title="System Health" 
          value={stats.system_health.toUpperCase()} 
          color={stats.system_health === 'operational' ? 'bg-emerald-500' : 'bg-amber-500'} 
        />
      </div>

      {/* Analytics Main Stage */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Student Lifecycle Analytics</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded border-dashed border-2 border-gray-300">
          <span className="text-gray-500 font-medium tracking-wide">
            [ Visual Funnel Chart Placeholder ]
          </span>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${color}`}>
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
    </div>
    <div>
      <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
    </div>
  </div>
);

export default DashboardOverview;