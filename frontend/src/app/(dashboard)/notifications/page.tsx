'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell, CheckCheck, Trash2, CreditCard, Building2, HardHat, Users,
  Calculator, Settings, AlertTriangle, Calendar, Inbox, RefreshCw,
  Filter,
} from 'lucide-react';
import { apiService } from '@/services/api';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ALERT';
  category: string;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: string;
  priority?: number;
}

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIES: Record<string, { icon: React.ElementType; bg: string; iconColor: string; label: string; dot: string }> = {
  PAYMENT:      { icon: CreditCard,    bg: 'bg-green-50',   iconColor: 'text-green-600',  label: 'Payment',      dot: 'bg-green-500'  },
  BOOKING:      { icon: Building2,     bg: 'bg-blue-50',    iconColor: 'text-blue-600',   label: 'Booking',      dot: 'bg-blue-500'   },
  CONSTRUCTION: { icon: HardHat,       bg: 'bg-orange-50',  iconColor: 'text-orange-600', label: 'Construction', dot: 'bg-orange-500' },
  EMPLOYEE:     { icon: Users,         bg: 'bg-purple-50',  iconColor: 'text-purple-600', label: 'HR',           dot: 'bg-purple-500' },
  ACCOUNTING:   { icon: Calculator,    bg: 'bg-teal-50',    iconColor: 'text-teal-600',   label: 'Accounting',   dot: 'bg-teal-500'   },
  LEAD:         { icon: Users,         bg: 'bg-yellow-50',  iconColor: 'text-yellow-600', label: 'Lead',         dot: 'bg-yellow-500' },
  CUSTOMER:     { icon: Users,         bg: 'bg-pink-50',    iconColor: 'text-pink-600',   label: 'Customer',     dot: 'bg-pink-500'   },
  TASK:         { icon: Calendar,      bg: 'bg-indigo-50',  iconColor: 'text-indigo-600', label: 'Task',         dot: 'bg-indigo-500' },
  REMINDER:     { icon: AlertTriangle, bg: 'bg-amber-50',   iconColor: 'text-amber-600',  label: 'Reminder',     dot: 'bg-amber-500'  },
  SYSTEM:       { icon: Settings,      bg: 'bg-gray-100',   iconColor: 'text-gray-500',   label: 'System',       dot: 'bg-gray-400'   },
};

const TYPE_BORDER: Record<string, string> = {
  SUCCESS: 'border-l-[3px] border-green-400',
  WARNING: 'border-l-[3px] border-amber-400',
  ERROR:   'border-l-[3px] border-red-400',
  ALERT:   'border-l-[3px] border-red-400',
  INFO:    'border-l-[3px] border-transparent',
};

const FILTER_TABS = [
  { key: 'all',    label: 'All'       },
  { key: 'unread', label: 'Unread'    },
  { key: 'PAYMENT',      label: 'Payments'     },
  { key: 'BOOKING',      label: 'Bookings'     },
  { key: 'CONSTRUCTION', label: 'Construction' },
  { key: 'ACCOUNTING',   label: 'Accounting'   },
  { key: 'SYSTEM',       label: 'System'       },
];

function groupByDate(notifications: Notification[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; items: Notification[] }[] = [];
  const map = new Map<string, Notification[]>();

  for (const n of notifications) {
    const d = new Date(n.createdAt);
    d.setHours(0, 0, 0, 0);
    let key: string;
    if (d.getTime() === today.getTime()) key = 'Today';
    else if (d.getTime() === yesterday.getTime()) key = 'Yesterday';
    else key = format(d, 'd MMM yyyy');

    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(n);
  }

  map.forEach((items, label) => groups.push({ label, items }));
  return groups;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [markingAll, setMarkingAll] = useState(false);
  const [clearingRead, setClearingRead] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data: any = await apiService.get('/notifications?includeRead=true');
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await apiService.patch('/notifications/mark-all-read', {});
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch { toast.error('Failed to mark all as read'); }
    finally { setMarkingAll(false); }
  };

  const handleClearRead = async () => {
    setClearingRead(true);
    try {
      await apiService.delete('/notifications/clear/read');
      setNotifications(prev => prev.filter(n => !n.isRead));
      toast.success('Read notifications cleared');
    } catch { toast.error('Failed to clear read notifications'); }
    finally { setClearingRead(false); }
  };

  const handleMarkRead = async (n: Notification) => {
    if (n.isRead) return;
    try {
      await apiService.patch(`/notifications/${n.id}/read`, {});
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
    } catch { /* silent */ }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiService.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch { toast.error('Failed to delete notification'); }
  };

  const handleClick = async (n: Notification) => {
    await handleMarkRead(n);
    if (n.actionUrl) router.push(n.actionUrl);
  };

  // ── Filter ────────────────────────────────────────────────────────────────

  const filtered = notifications.filter(n => {
    if (tab === 'all') return true;
    if (tab === 'unread') return !n.isRead;
    return n.category === tab;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const groups = groupByDate(filtered);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#A8211B]" /> Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} disabled={markingAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#A8211B]/10 text-[#A8211B] text-xs font-bold hover:bg-[#A8211B]/20 transition disabled:opacity-50">
              <CheckCheck className="w-3.5 h-3.5" />
              {markingAll ? 'Marking…' : 'Mark all read'}
            </button>
          )}
          {notifications.some(n => n.isRead) && (
            <button onClick={handleClearRead} disabled={clearingRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition disabled:opacity-50">
              <Trash2 className="w-3.5 h-3.5" />
              {clearingRead ? 'Clearing…' : 'Clear read'}
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {FILTER_TABS.map(({ key, label }) => {
          const count = key === 'unread'
            ? unreadCount
            : key === 'all'
            ? notifications.length
            : notifications.filter(n => n.category === key).length;
          if (key !== 'all' && key !== 'unread' && count === 0) return null;
          return (
            <button key={key} onClick={() => setTab(key)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                tab === key
                  ? 'bg-[#A8211B] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#A8211B]/30 hover:text-[#A8211B]'
              }`}>
              {label}
              {count > 0 && (
                <span className={`text-[10px] font-black px-1 py-0.5 rounded-md leading-none ${
                  tab === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 flex gap-3 border border-gray-100">
              <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-2.5 bg-gray-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Inbox className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">
            {tab === 'unread' ? 'No unread notifications' : 'No notifications found'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {tab === 'unread' ? "You're all caught up!" : 'Notifications will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(({ label, items }) => (
            <div key={label}>
              {/* Date group label */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <div className="space-y-2">
                {items.map((n) => {
                  const cat = CATEGORIES[n.category] ?? CATEGORIES.SYSTEM;
                  const Icon = cat.icon;
                  return (
                    <div key={n.id}
                      onClick={() => handleClick(n)}
                      className={`bg-white rounded-2xl border border-gray-100 overflow-hidden flex cursor-pointer hover:shadow-sm transition-all group ${
                        !n.isRead ? 'bg-[#FEF9F0]' : ''
                      } ${TYPE_BORDER[n.type] ?? TYPE_BORDER.INFO}`}>

                      <div className="flex-1 flex items-start gap-3 p-4">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cat.bg}`}>
                          <Icon className={`w-5 h-5 ${cat.iconColor}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-0.5">
                            <p className={`text-sm leading-snug ${!n.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                              {n.title}
                            </p>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full bg-[#A8211B] mt-1" />
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{n.message}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${cat.bg} ${cat.iconColor}`}>
                              {cat.label}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                            </span>
                            {n.actionUrl && (
                              <span className="text-[10px] font-semibold text-[#A8211B]">
                                {n.actionLabel || 'View →'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDelete(n.id, e)}
                        className="px-3 text-gray-200 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all border-l border-gray-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
