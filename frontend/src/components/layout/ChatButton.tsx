'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Search, Users, User, Plus, ChevronLeft, MoreVertical, Paperclip } from 'lucide-react';
import chatService, { ChatGroup, ChatMessage } from '@/services/chat.service';
import employeesService, { Employee } from '@/services/employees.service';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'groups' | 'chat' | 'newGroup' | 'newMessage'>('groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const currentEmployeeId = (user as any)?.employeeId || user?.id;

  // Load groups and unread count
  useEffect(() => {
    if (isOpen) {
      loadGroups();
      loadUnreadCount();
    }
  }, [isOpen]);

  // Auto-refresh for new messages (polling every 10 seconds)
  useEffect(() => {
    if (isOpen && selectedGroup) {
      const interval = setInterval(() => {
        loadMessages(selectedGroup.id);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen, selectedGroup]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load employees when in newGroup or newMessage view
  useEffect(() => {
    if (view === 'newGroup' || view === 'newMessage') {
      loadEmployees();
    }
  }, [view]);

  const loadGroups = async () => {
    try {
      const data = await chatService.getMyGroups();
      setGroups(data);
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await chatService.getTotalUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const loadMessages = async (groupId: string) => {
    try {
      setLoading(true);
      const data = await chatService.getMessages(groupId);
      setMessages(data);
      // Mark as read
      await chatService.markAsRead(groupId);
      loadUnreadCount();
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async (query: string = '') => {
    try {
      const data = query
        ? await employeesService.search(query)
        : await employeesService.getAll();
      // Filter out current user
      const currentEmployeeId = (user as any)?.employeeId || user?.id;
      setEmployees(data.filter(emp => emp.id !== currentEmployeeId && emp.isActive !== false));
    } catch (error) {
      console.error('Failed to load employees:', error);
      setEmployees([]);
    }
  };

  const handleSelectGroup = async (group: ChatGroup) => {
    setSelectedGroup(group);
    setView('chat');
    await loadMessages(group.id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedGroup) return;

    try {
      await chatService.sendMessage({
        chatGroupId: selectedGroup.id,
        messageText: messageText.trim(),
      });
      setMessageText('');
      await loadMessages(selectedGroup.id);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleBack = () => {
    setView('groups');
    setSelectedGroup(null);
    setMessages([]);
    setGroupName('');
    setGroupDescription('');
    setSelectedEmployees([]);
    setEmployeeSearchQuery('');
    loadGroups();
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedEmployees.length === 0) return;

    try {
      setLoading(true);
      await chatService.createGroup({
        name: groupName,
        description: groupDescription,
        groupType: 'GROUP',
        participantIds: selectedEmployees,
      });
      setGroupName('');
      setGroupDescription('');
      setSelectedEmployees([]);
      setView('groups');
      await loadGroups();
    } catch (error) {
      console.error('Failed to create group:', error);
      alert('Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartDirectChat = async (employeeId: string) => {
    try {
      setLoading(true);
      const group = await chatService.createDirectChat(employeeId);
      console.log('Direct chat response:', group);
      
      if (!group || !group.id) {
        console.error('Invalid group response:', group);
        throw new Error('Failed to create chat - invalid server response');
      }
      
      setView('chat');
      setSelectedGroup(group);
      await loadMessages(group.id);
    } catch (error) {
      console.error('Failed to start direct chat:', error);
      alert(`Failed to start chat: ${error instanceof Error ? error.message : 'Please try again'}`);
    } finally {
      setLoading(false);
    }
  };

  const getGroupDisplayName = (group: ChatGroup) => {
    if (group.groupType === 'DIRECT') {
      const otherParticipant = (group.participants || []).find(
        (p) => p.employeeId !== currentEmployeeId
      );
      return otherParticipant?.employeeName || 'Direct Message';
    }
    return group.name || 'Unnamed Group';
  };

  const filteredGroups = (groups || []).filter((group) =>
    getGroupDisplayName(group).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEmployees = (employees || []).filter((emp) =>
    emp.fullName.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
    emp.email?.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
    emp.position?.toLowerCase().includes(employeeSearchQuery.toLowerCase())
  );

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Chat"
        style={{ color: '#7B1E12' }}
      >
        <MessageCircle className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center" style={{ backgroundColor: '#A8211B' }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Slide-in Panel */}
          <div className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
            
            {/* Groups View */}
            {view === 'groups' && (
              <>
                {/* Header */}
                <div className="text-white p-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #A8211B 0%, #7B1E12 100%)' }}>
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="w-6 h-6" />
                    <h2 className="text-lg font-semibold">Messages</h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded transition-colors"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8a1b16'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search conversations..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': '#A8211B' } as any}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#A8211B'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 border-b flex space-x-2">
                  <button
                    onClick={() => setView('newGroup')}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-white rounded-lg transition-all hover:scale-105 active:scale-95"
                    style={{ backgroundColor: '#A8211B' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8a1b16'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A8211B'}
                  >
                    <Users className="w-4 h-4" />
                    <span>New Group</span>
                  </button>
                  <button
                    onClick={() => setView('newMessage')}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-white rounded-lg transition-all hover:scale-105 active:scale-95"
                    style={{ backgroundColor: '#F2C94C', color: '#333333' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dab43d'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F2C94C'}
                  >
                    <User className="w-4 h-4" />
                    <span>New Message</span>
                  </button>
                </div>

                {/* Group List */}
                <div className="flex-1 overflow-y-auto">
                  {filteredGroups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                      <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
                      <p className="text-lg font-medium">No conversations yet</p>
                      <p className="text-sm text-center">Start a new chat to get started</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredGroups.map((group) => (
                        <button
                          key={group.id}
                          onClick={() => handleSelectGroup(group)}
                          className="w-full p-4 hover:bg-gray-50 transition-colors text-left flex items-start space-x-3"
                        >
                          {/* Avatar */}
                          <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF3E2' }}>
                            {group.groupType === 'DIRECT' ? (
                              <User className="w-6 h-6" style={{ color: '#A8211B' }} />
                            ) : (
                              <Users className="w-6 h-6" style={{ color: '#A8211B' }} />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium text-gray-900 truncate">
                                {getGroupDisplayName(group)}
                              </h3>
                              {group.lastMessage && (
                                <span className="text-xs text-gray-500 ml-2">
                                  {formatDistanceToNow(new Date(group.lastMessage.createdAt), {
                                    addSuffix: true,
                                  })}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {group.lastMessage ? group.lastMessage.messageText : 'No messages yet'}
                            </p>
                            {group.unreadCount > 0 && (
                              <span className="inline-block mt-1 px-2 py-0.5 text-white text-xs font-semibold rounded-full" style={{ backgroundColor: '#A8211B' }}>
                                {group.unreadCount}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* New Group View */}
            {view === 'newGroup' && (
              <>
                <div className="text-white p-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #A8211B 0%, #7B1E12 100%)' }}>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={handleBack} 
                      className="p-1 rounded transition-colors"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8a1b16'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-semibold">New Group</h2>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
                      <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Enter group name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                        placeholder="What's this group about?"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Add Members * ({selectedEmployees.length} selected)</label>
                      <input
                        type="text"
                        value={employeeSearchQuery}
                        onChange={(e) => {
                          setEmployeeSearchQuery(e.target.value);
                          loadEmployees(e.target.value);
                        }}
                        placeholder="Search employees..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                      />
                      <div className="max-h-64 overflow-y-auto border rounded-lg">
                        {filteredEmployees.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            No employees found
                          </div>
                        ) : (
                          filteredEmployees.map((emp) => (
                            <label key={emp.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0">
                              <input
                                type="checkbox"
                                checked={selectedEmployees.includes(emp.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedEmployees([...selectedEmployees, emp.id]);
                                  } else {
                                    setSelectedEmployees(selectedEmployees.filter(id => id !== emp.id));
                                  }
                                }}
                                className="mr-3 h-4 w-4"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{emp.fullName}</p>
                                <p className="text-sm text-gray-500">{emp.position || 'Employee'}</p>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t">
                  <button
                    onClick={handleCreateGroup}
                    disabled={!groupName.trim() || selectedEmployees.length === 0 || loading}
                    className="w-full py-3 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium hover:scale-105 active:scale-95"
                    style={{ backgroundColor: '#A8211B' }}
                    onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#8a1b16')}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A8211B'}
                  >
                    {loading ? 'Creating...' : `Create Group (${selectedEmployees.length} members)`}
                  </button>
                </div>
              </>
            )}

            {/* New Message View */}
            {view === 'newMessage' && (
              <>
                <div className="text-white p-4 flex items-center justify-between" style={{ backgroundColor: '#F2C94C', color: '#333333' }}>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={handleBack} 
                      className="p-1 rounded transition-colors"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dab43d'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-semibold">New Message</h2>
                  </div>
                </div>

                <div className="p-4 border-b">
                  <input
                    type="text"
                    value={employeeSearchQuery}
                    onChange={(e) => {
                      setEmployeeSearchQuery(e.target.value);
                      loadEmployees(e.target.value);
                    }}
                    placeholder="Search employees..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    onFocus={(e) => e.currentTarget.style.borderColor = '#F2C94C'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
                  />
                </div>

                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: '#F2C94C' }} />
                    </div>
                  ) : filteredEmployees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                      <User className="w-16 h-16 mb-4 opacity-50" />
                      <p className="text-lg font-medium">No employees found</p>
                    </div>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => handleStartDirectChat(emp.id)}
                        className="w-full p-4 hover:bg-gray-50 transition-colors text-left flex items-center space-x-3 border-b"
                      >
                        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF3E2' }}>
                          <User className="w-6 h-6" style={{ color: '#F2C94C' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{emp.fullName}</p>
                          <p className="text-sm text-gray-500 truncate">{emp.position || 'Employee'} {emp.department ? `· ${emp.department}` : ''}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}

            {/* Chat View */}
            {view === 'chat' && selectedGroup && (
              <>
                {/* Header */}
                <div className="text-white p-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #A8211B 0%, #7B1E12 100%)' }}>
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <button
                      onClick={handleBack}
                      className="p-1 rounded transition-colors"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8a1b16'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8a1b16' }}>
                      {selectedGroup.groupType === 'DIRECT' ? (
                        <User className="w-5 h-5" />
                      ) : (
                        <Users className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold truncate">
                        {getGroupDisplayName(selectedGroup)}
                      </h2>
                      <p className="text-sm" style={{ color: '#F3E3C1' }}>
                        {(selectedGroup.participants || []).length} participant
                        {(selectedGroup.participants || []).length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <button 
                    className="p-1 rounded transition-colors"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8a1b16'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: '#A8211B' }} />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
                      <p className="text-lg font-medium">No messages yet</p>
                      <p className="text-sm">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwnMessage = message.sender?.id === currentEmployeeId;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-lg p-3 shadow`}
                            style={isOwnMessage ? { backgroundColor: '#A8211B', color: 'white' } : { backgroundColor: 'white', color: '#333333' }}
                          >
                            {!isOwnMessage && message.sender && (
                              <p className="text-xs font-medium mb-1 opacity-75">
                                {message.sender.fullName || 'User'}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.messageText}
                            </p>
                            <p
                              className="text-xs mt-1"
                              style={{ color: isOwnMessage ? '#F3E3C1' : '#6B7280' }}
                            >
                              {formatDistanceToNow(new Date(message.createdAt), {
                                addSuffix: true,
                              })}
                              {message.isEdited && ' (edited)'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
                  <div className="flex items-end space-x-2">
                    <button
                      type="button"
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Type a message..."
                      rows={1}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent resize-none"
                      onFocus={(e) => e.currentTarget.style.borderColor = '#A8211B'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
                      style={{ minHeight: '40px', maxHeight: '120px' }}
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim()}
                      className="p-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-95"
                      style={{ backgroundColor: '#A8211B' }}
                      onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#8a1b16')}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A8211B'}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
                </form>
              </>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
