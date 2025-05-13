import { useState } from 'react';
import ChatWindow from '../components/chat/ChatWindow';
import ChatUserList from '../components/chat/ChatUserList';
import { User } from '../types';

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-4rem)]">
      <div className="flex h-full gap-6">
        <div className="w-1/3 bg-white rounded-lg shadow-card overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
          </div>
          <div className="overflow-y-auto h-[calc(100%-4rem)]">
            <ChatUserList
              onSelectUser={setSelectedUser}
              selectedUserId={selectedUser?.id}
            />
          </div>
        </div>
        
        <div className="flex-1">
          {selectedUser ? (
            <ChatWindow />
          ) : (
            <div className="h-full flex items-center justify-center bg-white rounded-lg shadow-card">
              <p className="text-gray-500">Select a user to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;