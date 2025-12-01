import api from './api';

export interface Notification {
  id: string;
  userId: string;
  targetRoles?: string;
  targetDepartments?: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ALERT';
  category: 'BOOKING' | 'PAYMENT' | 'LEAD' | 'CONSTRUCTION' | 'EMPLOYEE' | 'CUSTOMER' | 'ACCOUNTING' | 'SYSTEM' | 'TASK' | 'REMINDER';
  actionUrl?: string;
  actionLabel?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  isRead: boolean;
  readAt?: string;
  shouldSendEmail: boolean;
  emailSent: boolean;
  emailSentAt?: string;
  priority: number;
  expiresAt?: string;
  metadata?: Record<string, any>;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationDto {
  userId?: string;
  targetRoles?: string;
  targetDepartments?: string;
  title: string;
  message: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ALERT';
  category?: 'BOOKING' | 'PAYMENT' | 'LEAD' | 'CONSTRUCTION' | 'EMPLOYEE' | 'CUSTOMER' | 'ACCOUNTING' | 'SYSTEM' | 'TASK' | 'REMINDER';
  actionUrl?: string;
  actionLabel?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  shouldSendEmail?: boolean;
  priority?: number;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

class NotificationsService {
  /**
   * Get all notifications for the current user
   */
  async getAll(includeRead: boolean = true): Promise<Notification[]> {
    const response = await api.get<Notification[]>(`/notifications?includeRead=${includeRead}`);
    return response || [];
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ count: number }>('/notifications/unread-count');
    return response?.count || 0;
  }

  /**
   * Create a new notification
   */
  async create(data: CreateNotificationDto): Promise<Notification[]> {
    const response = await api.post<Notification[]>('/notifications', data);
    return response || [];
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<Notification> {
    const response = await api.patch<Notification>(`/notifications/${id}/read`);
    return response;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/mark-all-read');
  }

  /**
   * Delete a notification
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  }

  /**
   * Clear all read notifications
   */
  async clearRead(): Promise<void> {
    await api.delete('/notifications/clear/read');
  }

  /**
   * Get notification icon based on type
   */
  getNotificationIcon(type: Notification['type']): string {
    switch (type) {
      case 'INFO':
        return '📋';
      case 'SUCCESS':
        return '✅';
      case 'WARNING':
        return '⚠️';
      case 'ERROR':
        return '❌';
      case 'ALERT':
        return '🔔';
      default:
        return '📬';
    }
  }

  /**
   * Get notification color based on type
   */
  getNotificationColor(type: Notification['type']): string {
    switch (type) {
      case 'INFO':
        return 'bg-blue-100 border-blue-500 text-blue-900';
      case 'SUCCESS':
        return 'bg-green-100 border-green-500 text-green-900';
      case 'WARNING':
        return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      case 'ERROR':
        return 'bg-red-100 border-red-500 text-red-900';
      case 'ALERT':
        return 'bg-purple-100 border-purple-500 text-purple-900';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-900';
    }
  }

  /**
   * Get category label
   */
  getCategoryLabel(category: Notification['category']): string {
    return category.charAt(0) + category.slice(1).toLowerCase().replace(/_/g, ' ');
  }
}

export default new NotificationsService();
