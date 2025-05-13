import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { 
  Plus, 
  Filter, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { useTaskStore } from '../stores/taskStore';
import { useAuthStore } from '../stores/authStore';
import { TaskStatus, UserRole } from '../types';
import TaskItem from '../components/tasks/TaskItem';
import CreateTaskModal from '../components/tasks/CreateTaskModal';

const Tasks = () => {
  const { user } = useAuthStore();
  const { tasks, getTasks, loading } = useTaskStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');

  useEffect(() => {
    getTasks();
  }, [getTasks]);

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filter);

  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all tasks
          </p>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </button>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">
            All Tasks {!loading && `(${filteredTasks.length})`}
          </h2>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Filter:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  filter === 'all'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter(TaskStatus.PENDING)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  filter === TaskStatus.PENDING
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <AlertCircle className="h-3 w-3 mr-1" />
                Pending
              </button>
              <button
                onClick={() => setFilter(TaskStatus.IN_PROGRESS)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  filter === TaskStatus.IN_PROGRESS
                    ? 'bg-warning-100 text-warning-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <Loader2 className="h-3 w-3 mr-1" />
                In Progress
              </button>
              <button
                onClick={() => setFilter(TaskStatus.COMPLETED)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  filter === TaskStatus.COMPLETED
                    ? 'bg-success-100 text-success-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completed
              </button>
              <button
                onClick={() => setFilter(TaskStatus.APPROVED)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  filter === TaskStatus.APPROVED
                    ? 'bg-success-100 text-success-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Approved
              </button>
              <button
                onClick={() => setFilter(TaskStatus.REJECTED)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  filter === TaskStatus.REJECTED
                    ? 'bg-error-100 text-error-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <X className="h-3 w-3 mr-1" />
                Rejected
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks found</h3>
            <p className="text-gray-500">
              {filter === 'all'
                ? 'There are no tasks yet'
                : `No tasks with ${filter} status`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
      
      {showCreateModal && (
        <CreateTaskModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default Tasks;