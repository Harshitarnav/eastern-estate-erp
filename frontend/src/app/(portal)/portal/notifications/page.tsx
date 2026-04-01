'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell, CheckCheck, Trash2, CreditCard, HardHat,
  FileText, Building2, Inbox, RefreshCw,
} from 'lucide-react';
import { apiService } from '@/services/api';
import { formatDistanceToNow, format } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: string;
}

const CAT: Record<string, { icon: React.ElementType; bg: string; color: string; label: string }> = {
  PAYMENT:      { icon: CreditCard, bg: 'bg-green-50',  color: 'text-green-600',  label: 'Payment'      },
  CONSTRUCTION: { icon: HardHat,    bg: 'bg-orange-50', color: 'text-orange-600', label: 'Construction' },
  BOOKING:      { icon: Building2,  bg: 'bg-blue-50',   color: 'text-blue-600',   label: 'Booking'      },
  DEMAND_DRAFT: { icon: FileText,   bg: 'bg-purple-50', color: 'text-purple-600', label: 'Demand Draft' },
};
const fallback = { icon: Bell, bg: 'bg-gray-100', color: 'text-gray-500', label: 'Notification' };

function groupByDate(items: Notification[]) {
  const today = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate()-1);
  const map = new Map<string, Notification[]>();
  for (const n of items) {
    const d = new Date(n.createdAt); d.setHours(0,0,0,0);
    const key = d.getTime() === today.getTime() ? 'Today'
      : d.getTime() === yesterday.getTime() ? 'Yesterday'
      : format(d, 'd MMM yyyy');
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(n);
  }
  const groups: { label: string; items: Notification[] }[] = [];
  map.forEach((v, k) => groups.push({ label: k, items: v }));
  return groups;
}

export default function PortalNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'unread'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d: any = await apiService.get('/notifications?includeRead=true');
      setNotifications(Array.isArray(d) ? d : []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markAllRead = async () => {
    try {
      await apiService.patch('/notifications/mark-all-read', {});
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { /* silent */ }
  };

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      try {
        await apiService.patch(`/notifications/${n.id}/read`, {});
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
      } catch { /* silent */ }
    }
    if (n.actionUrl) router.push(n.actionUrl);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiService.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch { /* silent */ }
  };

  const filtered = tab === 'unread' ? notifications.filter(n => !n.isRead) : notifications;
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const groups = groupByDate(filtered);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition">
            <RefreshCw className="w-4 h-4" />
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#A8211B]/10 text-[#A8211B] text-xs font-bold hover:bg-[#A8211B]/20 transition">
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5">
        {([
          { key: 'all',    label: 'All',    count: notifications.length },
          { key: 'unread', label: 'Unread', count: unreadCount          },
        ] as const).map(({ key, label, count }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition ${
              tab === key ? 'bg-[#A8211B] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#A8211B]/30'
            }`}>
            {label}
            {count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black leading-none ${
                tab === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 flex gap-3 border border-gray-100">
              <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center">
          <Inbox className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">
            {tab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {tab === 'unread' ? "You're all caught up!" : "Updates about your property will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(({ label, items }) => (
            <div key={label}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <div className="space-y-2">
                {items.map((n) => {
                  const c = CAT[n.category] ?? fallback;
                  const Icon = c.icon;
                  return (
                    <div key={n.id} onClick={() => handleClick(n)}
                      className={`bg-white rounded-2xl border overflow-hidden flex cursor-pointer hover:shadow-sm transition-all group ${
                        !n.isRead ? 'border-[#A8211B]/20 bg-[#FEF9F0]' : 'border-gray-100'
                      }`}>
                      <div className="flex-1 flex items-start gap-3 p-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.bg}`}>
                          <Icon className={`w-5 h-5 ${c.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm leading-snug ${!n.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                              {n.title}
                            </p>
                            {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#A8211B] shrink-0 mt-1" />}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${c.bg} ${c.color}`}>{c.label}</span>
                            <span className="text-[10px] text-gray-400">
                              {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button onClick={(e) => handleDelete(n.id, e)}
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
