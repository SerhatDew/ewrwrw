import { create } from 'zustand';
import { Message, ChatState } from '../types';
import { socket } from '../services/socket';

interface ChatStore extends ChatState {
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  setTyping: (userId: string, isTyping: boolean) => void;
  loadMessages: (userId: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  loading: false,
  error: null,
  typing: {},

  sendMessage: async (receiverId, content) => {
    try {
      const message = await socket.emitWithAck('send_message', {
        receiverId,
        content,
      });
      set(state => ({
        messages: [...state.messages, message],
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  editMessage: async (messageId, content) => {
    try {
      const updatedMessage = await socket.emitWithAck('edit_message', {
        messageId,
        content,
      });
      set(state => ({
        messages: state.messages.map(msg =>
          msg.id === messageId ? updatedMessage : msg
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await socket.emitWithAck('delete_message', { messageId });
      set(state => ({
        messages: state.messages.filter(msg => msg.id !== messageId),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  markAsRead: async (messageId) => {
    try {
      const updatedMessage = await socket.emitWithAck('mark_as_read', {
        messageId,
      });
      set(state => ({
        messages: state.messages.map(msg =>
          msg.id === messageId ? updatedMessage : msg
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  setTyping: (userId, isTyping) => {
    set(state => ({
      typing: {
        ...state.typing,
        [userId]: isTyping,
      },
    }));
  },

  loadMessages: async (userId) => {
    set({ loading: true, error: null });
    try {
      const messages = await socket.emitWithAck('load_messages', { userId });
      set({ messages, loading: false });
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
    }
  },
}));

// Socket event listeners
socket.on('message_received', (message: Message) => {
  useChatStore.setState(state => ({
    messages: [...state.messages, message],
  }));
});

socket.on('message_updated', (message: Message) => {
  useChatStore.setState(state => ({
    messages: state.messages.map(msg =>
      msg.id === message.id ? message : msg
    ),
  }));
});

socket.on('message_deleted', (messageId: string) => {
  useChatStore.setState(state => ({
    messages: state.messages.filter(msg => msg.id !== messageId),
  }));
});

socket.on('typing_status', ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
  useChatStore.getState().setTyping(userId, isTyping);
});