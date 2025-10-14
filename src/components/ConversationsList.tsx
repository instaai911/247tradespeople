import React from 'react';
import { MessageCircle, User, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Conversation } from '../types';

interface ConversationsListProps {
  onSelectConversation: (conversation: Conversation) => void;
}

const ConversationsList = ({ onSelectConversation }: ConversationsListProps) => {
  const { state } = useApp();

  if (!state.currentUser) return null;

  const userConversations = state.conversations.filter(conv => 
    (conv.homeownerId === state.currentUser!.id || conv.tradespersonId === state.currentUser!.id)
  );

  console.log('User conversations:', userConversations);
  console.log('Current user:', state.currentUser);
  console.log('All conversations:', state.conversations);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (userConversations.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No conversations yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Messages will appear here when you purchase job leads or accept interest from tradespeople
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {userConversations.map((conversation) => {
        const otherUserId = state.currentUser!.type === 'homeowner' 
          ? conversation.tradespersonId 
          : conversation.homeownerId;
        const otherUser = state.users.find(u => u.id === otherUserId);
        
        if (!otherUser) return null;

        return (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {otherUser.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate">{otherUser.name}</h3>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 ml-2">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conversation.jobTitle}</p>
                  {conversation.lastMessage && (
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-500 truncate flex-1">
                        {conversation.lastMessage.senderName}: {conversation.lastMessage.content}
                      </p>
                      <div className="flex items-center text-xs text-gray-400 ml-2">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(conversation.lastMessage.timestamp)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationsList;