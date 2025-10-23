'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, X } from 'lucide-react';
import notificationsService, { Notification } from '@/services/notifications.service';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsService.getAll(true);
      // Show only the 5 most recent - handle if data is undefined
      setNotifications(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await notificationsService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      try {
        await notificationsService.markAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }

    // Navigate if there's an action URL
    if (notification.actionUrl) {
      setIsOpen(false);
      router.push(notification.actionUrl);
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    router.push('/notifications');
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      loadNotifications();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">📬</div>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">
                        {notificationsService.getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="font-medium">
                            {notificationsService.getCategoryLabel(notification.category)}
                          </span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t bg-gray-50">
              <button
                onClick={handleViewAll}
                className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 py-2"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
