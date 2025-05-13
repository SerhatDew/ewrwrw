import { TaskStatus } from '../../types';
import { Task } from '../../types';

interface DashboardStatsProps {
  tasks: Task[];
  loading: boolean;
}

const DashboardStats = ({ tasks, loading }: DashboardStatsProps) => {
  const completedTasks = tasks.filter(
    task => task.status === TaskStatus.COMPLETED || task.status === TaskStatus.APPROVED
  );
  const inProgressTasks = tasks.filter(task => task.status === TaskStatus.IN_PROGRESS);
  const pendingTasks = tasks.filter(task => task.status === TaskStatus.PENDING);
  const rejectedTasks = tasks.filter(task => task.status === TaskStatus.REJECTED);

  const stats = {
    total: tasks.length,
    completed: completedTasks.length,
    inProgress: inProgressTasks.length,
    pending: pendingTasks.length,
    rejected: rejectedTasks.length,
  };

  const statItems = [
    { name: 'Total', value: stats.total, className: 'text-gray-800' },
    { name: 'Completed', value: stats.completed, className: 'text-success-600' },
    { name: 'In Progress', value: stats.inProgress, className: 'text-warning-600' },
    { name: 'Pending', value: stats.pending, className: 'text-gray-600' },
    { name: 'Rejected', value: stats.rejected, className: 'text-error-600' },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Task Statistics</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {loading ? (
          <>
            {statItems.map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </>
        ) : (
          <>
            {statItems.map(item => (
              <div key={item.name} className="text-center">
                <p className="text-sm text-gray-500">{item.name}</p>
                <p className={`text-2xl font-semibold ${item.className}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardStats;