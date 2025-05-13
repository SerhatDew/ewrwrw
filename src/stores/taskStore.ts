import { create } from 'zustand';
import { Task, TaskStatus } from '../types';
import { useAuthStore } from './authStore';

interface TaskState {
  tasks: Task[];
  userTasks: Task[];
  loading: boolean;
  error: string | null;
  getTasks: () => Promise<void>;
  getUserTasks: () => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  markAsCompleted: (id: number) => Promise<void>;
  approveTask: (id: number) => Promise<void>;
  rejectTask: (id: number) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  userTasks: [],
  loading: false,
  error: null,

  getTasks: async () => {
    set({ loading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('http://localhost:3001/api/tasks', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch tasks');
      }

      set({ tasks: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  getUserTasks: async () => {
    set({ loading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`http://localhost:3001/api/tasks/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user tasks');
      }

      set({ userTasks: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createTask: async (task) => {
    set({ loading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          ...task,
          createdBy: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create task');
      }

      const { tasks } = get();
      set({ 
        tasks: [...tasks, data],
        loading: false 
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateTask: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`http://localhost:3001/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update task');
      }

      const { tasks, userTasks } = get();
      
      set({
        tasks: tasks.map(task => task.id === id ? { ...task, ...data } : task),
        userTasks: userTasks.map(task => task.id === id ? { ...task, ...data } : task),
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteTask: async (id) => {
    set({ loading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`http://localhost:3001/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete task');
      }

      const { tasks, userTasks } = get();
      
      set({
        tasks: tasks.filter(task => task.id !== id),
        userTasks: userTasks.filter(task => task.id !== id),
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  markAsCompleted: async (id) => {
    const { updateTask } = get();
    await updateTask(id, { 
      status: TaskStatus.COMPLETED,
      completionPercentage: 100,
    });
  },

  approveTask: async (id) => {
    const { updateTask } = get();
    await updateTask(id, { status: TaskStatus.APPROVED });
  },

  rejectTask: async (id) => {
    const { updateTask } = get();
    await updateTask(id, { 
      status: TaskStatus.REJECTED,
      completionPercentage: 70, // Assuming 70% when rejected
    });
  },
}));