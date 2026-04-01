'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, X, CheckCheck, CreditCard, HardHat, FileText, Building2, Inbox } from 'lucide-react';
import { apiService } from '@/services/api';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

const CAT: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
  PAYMENT:      { icon: CreditCard, bg: 'bg-green-50',  color: 'text-green-600'  },
  CONSTRUCTION: { icon: HardHat,    bg: 'bg-orange-50', color: 'text-orange-600' },
  BOOKING:      { icon: Building2,  bg: 'bg-blue-50',   color: 'text-blue-600'   },
  DEMAND_DRAFT: { icon: FileText,   bg: 'bg-purple-50', color: 'text-purple-600' },
};
const fallbackCat = { icon: Bell, bg: 'bg-gray-100', color: 'text-gray-500' };

export default function PortalNotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const loadCount = useCallback(async () => {
    try {
      const d: any = await apiService.get('/notifications/unread-count');
      setUnread(d?.count ?? 0);
    } catch { /* silent */ }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const d: any = await apiService.get('/notifications?includeRead=true');
      setNotifications(Array.isArray(d) ? d.slice(0, 10) : []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadCount();
    const t = setInterval(loadCount, 30_000);
    return () => clearInterval(t);
  }, [loadCount]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggle = () => {
    if (!open) loadAll();
    setOpen(v => !v);
  };

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      try {
        await apiService.patch(`/notifications/${n.id}/read`, {});
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
        setUnread(c => Math.max(0, c - 1));
      } catch { /* silent */ }
    }
    if (n.actionUrl) { setOpen(false); router.push(n.actionUrl); }
  };

  const markAll = async () => {
    try {
      await apiService.patch('/notifications/mark-all-read', {});
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnread(0);
    } catch { /* silent */ }
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle}
        className="relative p-2 rounded-xl hover:bg-[#A8211B]/10 transition"
        aria-label="Notifications">
        <Bell className="w-5 h-5 text-[#A8211B]" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-[#A8211B] text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div ref={ref}
          className="
            fixed left-2 right-2 top-16
            sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80
            bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden flex flex-col
          "
          style={{ maxHeight: '70vh' }}>

          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <span className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-[#A8211B]" /> Notifications
              {unread > 0 && <span className="text-[10px] bg-[#A8211B] text-white px-1.5 py-0.5 rounded-full font-black">{unread}</span>}
            </span>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button onClick={markAll}
                  className="text-[10px] font-bold text-[#A8211B] hover:bg-[#FEF3E2] px-2 py-1 rounded-lg transition flex items-center gap-1">
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="p-4 space-y-3 animate-pulse">
                {[1,2,3].map(i => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-2.5 bg-gray-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Inbox className="w-10 h-10 text-gray-200 mb-2" />
                <p className="text-sm font-semibold text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const c = CAT[n.category] ?? fallbackCat;
                const Icon = c.icon;
                return (
                  <button key={n.id} onClick={() => handleClick(n)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50/80 transition ${!n.isRead ? 'bg-[#FEF9F0]' : ''}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${c.bg}`}>
                      <Icon className={`w-4 h-4 ${c.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs leading-snug ${!n.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-600'}`}>
                          {n.title}
                        </p>
                        {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-[#A8211B] shrink-0 mt-1" />}
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-gray-50 p-2">
              <button onClick={() => { setOpen(false); router.push('/portal/notifications'); }}
                className="w-full text-center text-xs font-bold text-[#A8211B] hover:bg-[#FEF3E2] py-2 rounded-xl transition">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
