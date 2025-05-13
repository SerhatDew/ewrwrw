import { useEffect } from 'react';
import { useUserStore } from '../../stores/userStore';
import { User } from '../../types';

interface ChatUserListProps {
  onSelectUser: (user: User) => void;
  selectedUserId?: number;
}

const ChatUserList = ({ onSelectUser, selectedUserId }: ChatUserListProps) => {
  const { users, getUsers, loading } = useUserStore();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse flex items-center space-x-4">
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="mt-2 h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {users.map((user) => (
        <button
          key={user.id}
          onClick={() => onSelectUser(user)}
          className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
            selectedUserId === user.id ? 'bg-primary-50' : ''
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">{user.username}</h3>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ChatUserList;