import { create } from 'zustand';
import { User, UserRole, TopPerformer } from '../types';
import { useAuthStore } from './authStore';

interface UserState {
  users: User[];
  topPerformers: {
    weekly: TopPerformer[];
    monthly: TopPerformer[];
  };
  loading: boolean;
  error: string | null;
  getUsers: () => Promise<void>;
  getTopPerformers: () => Promise<void>;
  updateUserRole: (userId: number, role: UserRole) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  topPerformers: {
    weekly: [],
    monthly: [],
  },
  loading: false,
  error: null,

  getUsers: async () => {
    set({ loading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('http://localhost:3001/api/users', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }

      set({ users: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  getTopPerformers: async () => {
    set({ loading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('http://localhost:3001/api/stats/top-performers', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch top performers');
      }

      set({ 
        topPerformers: {
          weekly: data.weekly,
          monthly: data.monthly,
        }, 
        loading: false 
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateUserRole: async (userId, role) => {
    set({ loading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      
      if (!user || user.role !== UserRole.ADMIN) {
        throw new Error('Unauthorized');
      }

      const response = await fetch(`http://localhost:3001/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user role');
      }

      set(state => ({
        users: state.users.map(u => 
          u.id === userId ? { ...u, role } : u
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));