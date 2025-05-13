import { useState } from 'react';
import { format } from 'date-fns';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  X, 
  MoreVertical,
  Check,
  FileText
} from 'lucide-react';
import { Task, TaskStatus, UserRole } from '../../types';
import { useTaskStore } from '../../stores/taskStore';
import { useAuthStore } from '../../stores/authStore';

interface TaskItemProps {
  task: Task;
}

const TaskItem = ({ task }: TaskItemProps) => {
  const { markAsCompleted, approveTask, rejectTask, deleteTask } = useTaskStore();
  const { user } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isAdmin = user?.role === UserRole.ADMIN;
  const isTeamLead = user?.role === UserRole.TEAM_LEAD;
  const isOwnTask = user?.id === task.assignedTo;
  
  const getStatusIcon = () => {
    switch (task.status) {
      case TaskStatus.PENDING:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
      case TaskStatus.IN_PROGRESS:
        return <Clock className="h-5 w-5 text-warning-500" />;
      case TaskStatus.COMPLETED:
        return <CheckCircle2 className="h-5 w-5 text-success-500" />;
      case TaskStatus.APPROVED:
        return <CheckCircle2 className="h-5 w-5 text-success-700" />;
      case TaskStatus.REJECTED:
        return <X className="h-5 w-5 text-error-500" />;
    }
  };

  const getStatusText = () => {
    switch (task.status) {
      case TaskStatus.PENDING:
        return 'Pending';
      case TaskStatus.IN_PROGRESS:
        return 'In Progress';
      case TaskStatus.COMPLETED:
        return 'Completed';
      case TaskStatus.APPROVED:
        return 'Approved';
      case TaskStatus.REJECTED:
        return 'Rejected';
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case TaskStatus.PENDING:
        return 'bg-gray-100 text-gray-800';
      case TaskStatus.IN_PROGRESS:
        return 'bg-warning-100 text-warning-800';
      case TaskStatus.COMPLETED:
        return 'bg-success-100 text-success-800';
      case TaskStatus.APPROVED:
        return 'bg-success-100 text-success-800';
      case TaskStatus.REJECTED:
        return 'bg-error-100 text-error-800';
    }
  };

  const handleMarkAsCompleted = async () => {
    await markAsCompleted(task.id);
    setMenuOpen(false);
  };

  const handleApproveTask = async () => {
    await approveTask(task.id);
    setMenuOpen(false);
  };

  const handleRejectTask = async () => {
    await rejectTask(task.id);
    setMenuOpen(false);
  };

  const handleDeleteTask = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id);
    }
    setMenuOpen(false);
  };

  const canComplete = isOwnTask && task.status !== TaskStatus.COMPLETED && 
                      task.status !== TaskStatus.APPROVED && task.status !== TaskStatus.REJECTED;
  
  const canApproveOrReject = isTeamLead && task.status === TaskStatus.COMPLETED;

  return (
    <div className={`border ${expanded ? 'border-primary-200' : 'border-gray-200'} rounded-lg overflow-hidden transition-all duration-150 hover:shadow-sm ${expanded ? 'shadow-card' : ''}`}>
      <div 
        className="p-4 cursor-pointer flex justify-between items-start"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center">
            <h3 className="text-lg font-medium text-gray-900 mr-3">{task.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="ml-1">{getStatusText()}</span>
            </span>
          </div>
          
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <div className="mr-6">
              <span className="font-medium">Due:</span>{' '}
              {format(new Date(task.dueDate), 'MMM d, yyyy')}
            </div>
            
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 w-24">
                <div 
                  className="bg-primary-600 h-2.5 rounded-full" 
                  style={{ width: `${task.completionPercentage}%` }}
                ></div>
              </div>
              <span>{task.completionPercentage}%</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative inline-block text-left">
            <button
              type="button"
              className="flex items-center justify-center h-8 w-8 rounded-full bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            
            {menuOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-10">
                <div className="py-1">
                  {canComplete && (
                    <button
                      type="button"
                      className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsCompleted();
                      }}
                    >
                      <CheckCircle2 className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                      Mark as Completed
                    </button>
                  )}
                  
                  {canApproveOrReject && (
                    <>
                      <button
                        type="button"
                        className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApproveTask();
                        }}
                      >
                        <Check className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                        Approve Task
                      </button>
                      
                      <button
                        type="button"
                        className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRejectTask();
                        }}
                      >
                        <X className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                        Reject Task
                      </button>
                    </>
                  )}
                  
                  {isAdmin && (
                    <button
                      type="button"
                      className="group flex items-center px-4 py-2 text-sm text-error-600 hover:bg-error-50 hover:text-error-900 w-full text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask();
                      }}
                    >
                      <X className="mr-3 h-5 w-5 text-error-400 group-hover:text-error-500" />
                      Delete Task
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 animate-slideIn">
          <div className="prose prose-sm max-w-none text-gray-700">
            <p>{task.description}</p>
          </div>
          
          {task.attachmentUrl && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Attachment</h4>
              <a 
                href={task.attachmentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={(e) => e.stopPropagation()}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Attachment
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskItem;