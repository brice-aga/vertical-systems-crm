import React from 'react';
import { Calendar } from 'lucide-react';

const ContentCalendar: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text section-gradient-content">
            Content Calendar
          </h1>
          <p className="text-gray-400 mt-2">
            Plan and schedule your content
          </p>
        </div>
      </div>

      <div className="glass-card p-8 text-center">
        <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-600" />
        <h3 className="text-xl font-semibold text-white mb-2">Calendar coming soon</h3>
        <p className="text-gray-400">Schedule and plan your content releases</p>
      </div>
    </div>
  );
};

export default ContentCalendar;
