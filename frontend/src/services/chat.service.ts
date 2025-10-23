import api from './api';

export interface ChatGroup {
  id: string;
  name: string;
  description?: string;
  groupType: 'GROUP' | 'DIRECT';
  avatarUrl?: string;
  createdByEmployeeId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  lastMessage?: {
    id: string;
    messageText: string;
    createdAt: string;
    senderName: string;
  };
  participants: ChatParticipant[];
  myRole: 'ADMIN' | 'MEMBER';
}

export interface ChatParticipant {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
  lastReadAt?: string;
}

export interface ChatMessage {
  id: string;
  chatGroupId: string;
  senderEmployeeId: string;
  messageText: string;
  mentionedEmployeeIds: string[];
  replyToMessageId?: string;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: string;
    fullName: string;
    email: string;
  };
  attachments: ChatAttachment[];
  replyTo?: {
    id: string;
    messageText: string;
    sender: {
      id: string;
      fullName: string;
    };
  };
}

export interface ChatAttachment {
  id: string;
  messageId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  mimeType?: string;
  uploadedAt: string;
}

export interface CreateGroupDto {
  name: string;
  description?: string;
  groupType?: 'GROUP' | 'DIRECT';
  avatarUrl?: string;
  participantIds: string[];
}

export interface SendMessageDto {
  chatGroupId: string;
  messageText: string;
  mentionedEmployeeIds?: string[];
  replyToMessageId?: string;
}

class ChatService {
  private baseUrl = '/chat';

  /**
   * Get all chat groups for the current user
   */
  async getMyGroups(): Promise<ChatGroup[]> {
    const response = await api.get(`${this.baseUrl}/groups`);
    return response;
  }

  /**
   * Create a new chat group
   */
  async createGroup(data: CreateGroupDto): Promise<ChatGroup> {
    const response = await api.post(`${this.baseUrl}/groups`, data);
    return response;
  }

  /**
   * Get a specific chat group
   */
  async getGroup(groupId: string): Promise<ChatGroup> {
    const response = await api.get(`${this.baseUrl}/groups/${groupId}`);
    return response;
  }

  /**
   * Get participants of a group
   */
  async getGroupParticipants(groupId: string): Promise<ChatParticipant[]> {
    const response = await api.get(`${this.baseUrl}/groups/${groupId}/participants`);
    return response;
  }

  /**
   * Add participants to a group
   */
  async addParticipants(groupId: string, employeeIds: string[]): Promise<void> {
    await api.post(`${this.baseUrl}/groups/${groupId}/participants`, { employeeIds });
  }

  /**
   * Remove a participant from a group
   */
  async removeParticipant(groupId: string, participantId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/groups/${groupId}/participants/${participantId}`);
  }

  /**
   * Create or get a direct message conversation
   */
  async createDirectMessage(employeeId: string): Promise<ChatGroup> {
    const response = await api.post(`${this.baseUrl}/direct`, { employeeId });
    // Ensure participants array exists
    if (!response.participants) {
      response.participants = [];
    }
    return response;
  }

  /**
   * Create a direct chat (alias for createDirectMessage)
   */
  async createDirectChat(employeeId: string): Promise<ChatGroup> {
    return this.createDirectMessage(employeeId);
  }

  /**
   * Send a message
   */
  async sendMessage(data: SendMessageDto): Promise<ChatMessage> {
    const response = await api.post(`${this.baseUrl}/messages`, data);
    return response;
  }

  /**
   * Get messages for a group
   */
  async getMessages(
    groupId: string,
    limit: number = 50,
    before?: string
  ): Promise<ChatMessage[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (before) {
      params.append('before', before);
    }
    const response = await api.get(
      `${this.baseUrl}/groups/${groupId}/messages?${params.toString()}`
    );
    return response;
  }

  /**
   * Mark messages as read for a group
   */
  async markAsRead(groupId: string): Promise<void> {
    await api.put(`${this.baseUrl}/groups/${groupId}/read`);
  }

  /**
   * Get unread count for a group
   */
  async getUnreadCount(groupId: string): Promise<number> {
    const response = await api.get(`${this.baseUrl}/groups/${groupId}/unread-count`);
    return response?.count || 0;
  }

  /**
   * Get total unread count across all groups
   */
  async getTotalUnreadCount(): Promise<number> {
    const response = await api.get(`${this.baseUrl}/unread-count`);
    return response?.count || 0;
  }

  /**
   * Edit a message
   */
  async editMessage(messageId: string, messageText: string): Promise<ChatMessage> {
    const response = await api.put(`${this.baseUrl}/messages/${messageId}`, { messageText });
    return response;
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/messages/${messageId}`);
  }

  /**
   * Search employees for direct messaging
   */
  async searchEmployees(query: string): Promise<any[]> {
    const response = await api.get(`${this.baseUrl}/search/employees?q=${query}`);
    return response;
  }
}

export const chatService = new ChatService();
export default chatService;
