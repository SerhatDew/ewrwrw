import { TopPerformer } from '../../types';
import { Trophy } from 'lucide-react';

interface TopPerformersTableProps {
  performers: TopPerformer[];
  loading: boolean;
}

const TopPerformersTable = ({ performers, loading }: TopPerformersTableProps) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center py-2">
              <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-10"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (performers.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No data available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {performers.slice(0, 10).map((performer, index) => (
        <div key={performer.userId} className="flex items-center py-2 border-b border-gray-100 last:border-0">
          <div className="flex-shrink-0 relative">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
              {performer.username.charAt(0).toUpperCase()}
            </div>
            {index < 3 && (
              <div className={`absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-white text-xs ${
                index === 0 
                  ? 'bg-yellow-500' 
                  : index === 1 
                    ? 'bg-gray-400' 
                    : 'bg-amber-700'
              }`}>
                {index + 1}
              </div>
            )}
          </div>
          <div className="ml-4 flex-1">
            <div className="text-sm font-medium text-gray-900">{performer.username}</div>
            <div className="text-xs text-gray-500">Rank #{index + 1}</div>
          </div>
          <div className="text-sm font-medium text-primary-600">
            {performer.tasksCompleted} tasks
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopPerformersTable;