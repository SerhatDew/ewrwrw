import { useEffect } from 'react';
import { format } from 'date-fns';
import { 
  BarChart as BarChartIcon, 
  ListChecks, 
  Users, 
  Award
} from 'lucide-react';
import { useTaskStore } from '../stores/taskStore';
import { useUserStore } from '../stores/userStore';
import { TaskStatus } from '../types';
import DashboardCard from '../components/dashboard/DashboardCard';
import DashboardStats from '../components/dashboard/DashboardStats';
import TopPerformersTable from '../components/dashboard/TopPerformersTable';
import TaskCompletionChart from '../components/dashboard/TaskCompletionChart';

const Dashboard = () => {
  const { tasks, getTasks, loading: tasksLoading } = useTaskStore();
  const { 
    topPerformers, 
    getTopPerformers, 
    loading: usersLoading 
  } = useUserStore();

  useEffect(() => {
    getTasks();
    getTopPerformers();
  }, [getTasks, getTopPerformers]);

  const completedTasks = tasks.filter(task => 
    task.status === TaskStatus.COMPLETED || 
    task.status === TaskStatus.APPROVED
  );

  const stats = {
    total: tasks.length,
    completed: completedTasks.length,
    inProgress: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length,
    pending: tasks.filter(task => task.status === TaskStatus.PENDING).length,
  };

  const loading = tasksLoading || usersLoading;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of tasks and team performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard 
          title="Total Tasks"
          value={stats.total}
          description="All tasks"
          icon={<ListChecks className="h-8 w-8 text-primary-500" />}
          loading={loading}
        />
        <DashboardCard 
          title="Completed"
          value={stats.completed}
          description={`${Math.round((stats.completed / (stats.total || 1)) * 100)}% completion rate`}
          icon={<ListChecks className="h-8 w-8 text-success-500" />}
          loading={loading}
        />
        <DashboardCard 
          title="In Progress"
          value={stats.inProgress}
          description={`${Math.round((stats.inProgress / (stats.total || 1)) * 100)}% of all tasks`}
          icon={<ListChecks className="h-8 w-8 text-warning-500" />}
          loading={loading}
        />
        <DashboardCard 
          title="Pending"
          value={stats.pending}
          description={`${Math.round((stats.pending / (stats.total || 1)) * 100)}% of all tasks`}
          icon={<ListChecks className="h-8 w-8 text-error-500" />}
          loading={loading}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Task Completion Status
            </h2>
            <BarChartIcon className="h-5 w-5 text-gray-500" />
          </div>
          <TaskCompletionChart tasks={tasks} loading={loading} />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Completed Tasks
            </h2>
            <ListChecks className="h-5 w-5 text-gray-500" />
          </div>
          
          {loading ? (
            <div className="animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="py-3 border-b border-gray-100">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : completedTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No completed tasks yet</p>
          ) : (
            <div className="space-y-4">
              {completedTasks.slice(0, 5).map(task => (
                <div key={task.id} className="p-3 border-b border-gray-100 last:border-0">
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-sm text-gray-500">
                      {format(new Date(task.updatedAt), 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm font-medium text-success-600">
                      {task.completionPercentage}% complete
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Top Weekly Performers
            </h2>
            <Users className="h-5 w-5 text-gray-500" />
          </div>
          <TopPerformersTable performers={topPerformers.weekly} loading={loading} />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Top Monthly Performers
            </h2>
            <Award className="h-5 w-5 text-gray-500" />
          </div>
          <TopPerformersTable performers={topPerformers.monthly} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;