import { Task, TaskStatus } from '../../types';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TaskCompletionChartProps {
  tasks: Task[];
  loading: boolean;
}

const TaskCompletionChart = ({ tasks, loading }: TaskCompletionChartProps) => {
  const statusCounts = {
    [TaskStatus.PENDING]: tasks.filter(task => task.status === TaskStatus.PENDING).length,
    [TaskStatus.IN_PROGRESS]: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length,
    [TaskStatus.COMPLETED]: tasks.filter(task => task.status === TaskStatus.COMPLETED).length,
    [TaskStatus.APPROVED]: tasks.filter(task => task.status === TaskStatus.APPROVED).length,
    [TaskStatus.REJECTED]: tasks.filter(task => task.status === TaskStatus.REJECTED).length,
  };
  
  const chartData = {
    labels: [
      'Pending', 
      'In Progress', 
      'Completed', 
      'Approved', 
      'Rejected'
    ],
    datasets: [
      {
        label: 'Number of Tasks',
        data: [
          statusCounts[TaskStatus.PENDING],
          statusCounts[TaskStatus.IN_PROGRESS],
          statusCounts[TaskStatus.COMPLETED],
          statusCounts[TaskStatus.APPROVED],
          statusCounts[TaskStatus.REJECTED],
        ],
        backgroundColor: [
          'rgba(156, 163, 175, 0.7)',  // gray for pending
          'rgba(251, 191, 36, 0.7)',   // amber for in progress
          'rgba(52, 211, 153, 0.7)',   // green for completed
          'rgba(16, 185, 129, 0.7)',   // emerald for approved
          'rgba(239, 68, 68, 0.7)',    // red for rejected
        ],
        borderColor: [
          'rgb(156, 163, 175)',
          'rgb(251, 191, 36)',
          'rgb(52, 211, 153)',
          'rgb(16, 185, 129)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            const total = tasks.length;
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${value} tasks (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-400">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TaskCompletionChart;