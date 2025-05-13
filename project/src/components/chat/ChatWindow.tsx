import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useChatStore } from '../../stores/chatStore';
import { Send, Paperclip, Image } from 'lucide-react';
import { format } from 'date-fns';

const ChatWindow = () => {
  const { user } = useAuthStore();
  const { messages, sendMessage, loadMessages, typing } = useChatStore();
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadMessages(user.id.toString());
    }
  }, [user, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!user || (!newMessage.trim() && !selectedFile)) return;

    try {
      await sendMessage(user.id.toString(), newMessage);
      setNewMessage('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-card">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === user?.id.toString() ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.senderId === user?.id.toString()
                  ? 'bg-primary-100 text-primary-900'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <div className="mt-1 text-xs text-gray-500 flex items-center justify-end">
                <span>{format(new Date(message.createdAt), 'HH:mm')}</span>
                {message.read && message.senderId === user?.id.toString() && (
                  <span className="ml-1">✓✓</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {Object.entries(typing).map(([userId, isTyping]) => (
          isTyping && userId !== user?.id.toString() && (
            <div key={userId} className="text-sm text-gray-500 italic">
              Someone is typing...
            </div>
          )
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx"
            />
            <Paperclip className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </label>
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*"
            />
            <Image className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </label>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() && !selectedFile}
            className="bg-primary-600 text-white rounded-lg p-2 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        {selectedFile && (
          <div className="mt-2 text-sm text-gray-600">
            Selected file: {selectedFile.name}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatWindow;