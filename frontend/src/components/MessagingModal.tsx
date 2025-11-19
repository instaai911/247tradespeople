import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, User, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Conversation, Message } from '../types';

interface MessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation?: Conversation;
  jobId?: string;
  otherUserId?: string;
}

const MessagingModal = ({ isOpen, onClose, conversation, jobId, otherUserId }: MessagingModalProps) => {
  const { state, dispatch } = useApp();
  const [newMessage, setNewMessage] = useState('');
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversation) {
      setCurrentConversation(conversation);
    } else if (jobId && otherUserId && state.currentUser) {
      // Find or create conversation
      const existingConv = state.conversations.find(
        c => c.jobId === jobId &&
             ((c.homeownerId === state.currentUser!.id || c.homeownerId === otherUserId) &&
              (c.tradespersonId === state.currentUser!.id || c.tradespersonId === otherUserId))
      );
      
      if (existingConv) {
        console.log('Found existing conversation:', existingConv);
        setCurrentConversation(existingConv);
      } else {
        // Create new conversation if job and other user exist
        const job = state.jobLeads.find(j => j.id === jobId);
        const otherUser = state.users.find(u => u.id === otherUserId);
        
        if (job && otherUser && state.currentUser) {
          let homeownerId: string;
          let tradespersonId: string;
          
          if (state.currentUser.type === 'homeowner') {
            homeownerId = state.currentUser.id;
            tradespersonId = otherUserId;
          } else {
            homeownerId = otherUserId;
            tradespersonId = state.currentUser.id;
          }
          
          const tempConversation: Conversation = {
            id: `temp_${jobId}_${otherUserId}`,
            jobId,
            jobTitle: job.title,
            homeownerId,
            tradespersonId,
            messages: [],
            createdAt: new Date().toISOString(),
            unreadCount: 0
          };
          
          console.log('Creating temp conversation:', tempConversation);
          setCurrentConversation(tempConversation);
          
          // Create the conversation in state immediately
          dispatch({
            type: 'CREATE_CONVERSATION',
            payload: { jobId, homeownerId, tradespersonId }
          });
        }
      }
    }
  }, [conversation, jobId, otherUserId, state.conversations, state.currentUser, dispatch]);


  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  useEffect(() => {
    // Mark messages as read when modal opens
    if (isOpen && currentConversation && state.currentUser) {
      dispatch({
        type: 'MARK_MESSAGES_READ',
        payload: { conversationId: currentConversation.id, userId: state.currentUser.id }
      });
    }
  }, [isOpen, currentConversation, state.currentUser, dispatch]);

  if (!isOpen || !currentConversation || !state.currentUser) return null;

  const otherUser = state.users.find(u => 
    u.id === (state.currentUser!.type === 'homeowner' ? currentConversation.tradespersonId : currentConversation.homeownerId)
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !otherUser) return;

    // Get the latest conversation from state to ensure we have current messages
    const latestConversation = state.conversations.find(c => 
      c.jobId === currentConversation.jobId &&
      c.homeownerId === currentConversation.homeownerId &&
      c.tradespersonId === currentConversation.tradespersonId
    );

    // Update current conversation with latest messages before sending
    if (latestConversation && latestConversation.messages.length !== currentConversation.messages.length) {
      setCurrentConversation(latestConversation);
    }

    const messagePayload = {
      jobId: currentConversation.jobId,
      senderId: state.currentUser!.id,
      receiverId: otherUser.id,
      content: newMessage.trim()
    };
    
    console.log('Sending message:', messagePayload);
    
    dispatch({
      type: 'SEND_MESSAGE',
      payload: messagePayload
    });

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <MessageCircle className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{otherUser?.name}</h2>
              <p className="text-sm text-gray-600">{currentConversation.jobTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {(() => {
            // Get the latest conversation from state for message display
            const latestConversation = state.conversations.find(c => 
              c.jobId === currentConversation.jobId &&
              c.homeownerId === currentConversation.homeownerId &&
              c.tradespersonId === currentConversation.tradespersonId
            );
            
            const messagesToShow = latestConversation?.messages || currentConversation.messages || [];
            
            if (messagesToShow.length === 0) {
              return (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No messages yet. Start the conversation!</p>
                </div>
              );
            }
            
            return messagesToShow.map((message, index) => {
              const isOwnMessage = message.senderId === state.currentUser!.id;
              
              return (
                <div
                  key={`${message.id}-${index}`}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-xs opacity-75 mb-1">{message.senderName}</p>
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center mt-1 text-xs ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingModal;