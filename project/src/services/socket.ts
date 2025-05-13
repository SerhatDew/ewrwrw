import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';

// Use relative URL to work with Vite's proxy
const SOCKET_URL = '/socket';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  path: '/socket.io',
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
  auth: (cb) => {
    const { user } = useAuthStore.getState();
    cb({ token: user?.token });
  },
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
  // Implement exponential backoff
  const nextDelay = Math.min(1000 * Math.pow(2, socket.io.reconnectionAttempts), 10000);
  socket.io.reconnectionDelay = nextDelay;
});

export const connectSocket = () => {
  const { user } = useAuthStore.getState();
  if (user && !socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// Add reconnection logic with maximum attempts
socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
  if (reason === 'io server disconnect') {
    // Reconnect if the server initiated the disconnect
    socket.connect();
  }
});

// Handle authentication errors
socket.on('unauthorized', () => {
  console.log('Unauthorized socket connection');
  disconnectSocket();
  useAuthStore.getState().logout();
});

// Add connection success handler
socket.on('connect', () => {
  console.log('Socket connected successfully');
  // Reset reconnection delay on successful connection
  socket.io.reconnectionDelay = 1000;
});