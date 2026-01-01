import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text section-gradient-dashboard">
            Dashboard
          </h1>
          <p className="text-gray-400 mt-2">
            Welcome back! Here's your overview.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-400">Today</p>
            <p className="text-lg font-semibold text-white">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 text-center">
        <p className="text-gray-400">Your dashboard is ready. Start by adding leads and tracking your pipeline.</p>
      </div>
    </div>
  );
};

export default Dashboard;