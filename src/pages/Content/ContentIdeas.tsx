import React from 'react';
import { Lightbulb, Plus } from 'lucide-react';

const ContentIdeas: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text section-gradient-content">
            Content Ideas
          </h1>
          <p className="text-gray-400 mt-2">
            Brainstorm and capture content ideas
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-400 to-cyan-600 hover:from-teal-500 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-200">
          <Plus className="h-5 w-5" />
          <span>Add Idea</span>
        </button>
      </div>

      <div className="glass-card p-8 text-center">
        <Lightbulb className="h-16 w-16 mx-auto mb-4 text-gray-600" />
        <h3 className="text-xl font-semibold text-white mb-2">Start capturing ideas</h3>
        <p className="text-gray-400">Never lose a great content idea again</p>
      </div>
    </div>
  );
};

export default ContentIdeas;
