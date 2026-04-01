'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell, BellOff, X, CheckCheck, CreditCard, Building2,
  HardHat, Users, Calculator, Settings, AlertTriangle,
  Calendar, ChevronRight, Inbox, Smartphone,
} from 'lucide-react';
import { apiService } from '@/services/api';
import { formatDistanceToNow } from 'date-fns';

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

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; bg: string; iconColor: string; label: string }> = {
  PAYMENT:      { icon: CreditCard,    bg: 'bg-green-50',   iconColor: 'text-green-600',  label: 'Payment'      },
  BOOKING:      { icon: Building2,     bg: 'bg-blue-50',    iconColor: 'text-blue-600',   label: 'Booking'      },
  CONSTRUCTION: { icon: HardHat,       bg: 'bg-orange-50',  iconColor: 'text-orange-600', label: 'Construction' },
  EMPLOYEE:     { icon: Users,         bg: 'bg-purple-50',  iconColor: 'text-purple-600', label: 'HR'           },
  ACCOUNTING:   { icon: Calculator,    bg: 'bg-teal-50',    iconColor: 'text-teal-600',   label: 'Accounting'   },
  LEAD:         { icon: Users,         bg: 'bg-yellow-50',  iconColor: 'text-yellow-600', label: 'Lead'         },
  CUSTOMER:     { icon: Users,         bg: 'bg-pink-50',    iconColor: 'text-pink-600',   label: 'Customer'     },
  TASK:         { icon: Calendar,      bg: 'bg-indigo-50',  iconColor: 'text-indigo-600', label: 'Task'         },
  REMINDER:     { icon: AlertTriangle, bg: 'bg-amber-50',   iconColor: 'text-amber-600',  label: 'Reminder'     },
  SYSTEM:       { icon: Settings,      bg: 'bg-gray-100',   iconColor: 'text-gray-500',   label: 'System'       },
};

const TYPE_RING: Record<string, string> = {
  SUCCESS: 'border-l-2 border-green-400',
  WARNING: 'border-l-2 border-amber-400',
  ERROR:   'border-l-2 border-red-400',
  ALERT:   'border-l-2 border-red-400',
  INFO:    '',
};

// ─── Component ────────────────────────────────────────────────────────────────

// ── Helpers ──────────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const output = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

/**
 * Returns the active service worker registration.
 * Tries multiple strategies so it works on iOS PWA, Android, and desktop.
 */
async function getSwRegistration(): Promise<ServiceWorkerRegistration> {
  // Strategy 1: check the root scope directly (fastest, works most of the time)
  const byScope = await navigator.serviceWorker.getRegistration('/');
  if (byScope?.active) return byScope;

  // Strategy 2: scan ALL registrations — handles iOS where scope can differ
  const allRegs = await navigator.serviceWorker.getRegistrations();
  const withActive = allRegs.find(r => r.active);
  if (withActive) return withActive;

  // Strategy 3: wait for the SW to become active (first install / updating)
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(
          'Service worker is not active.\n\n' +
          '• Make sure you opened the app from your Home Screen (not Safari).\n' +
          '• Close and reopen the app, then try again.'
        )),
        10_000,
      )
    ),
  ]);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // ── Data loading ──────────────────────────────────────────────────────────

  const loadUnreadCount = useCallback(async () => {
    try {
      const data: any = await apiService.get('/notifications/unread-count');
      setUnreadCount(data?.count ?? 0);
    } catch { /* silent */ }
  }, []);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data: any = await apiService.get('/notifications?includeRead=true');
      setNotifications(Array.isArray(data) ? data.slice(0, 8) : []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  // Poll unread count every 30s
  useEffect(() => {
    loadUnreadCount();
    const t = setInterval(loadUnreadCount, 30_000);
    return () => clearInterval(t);
  }, [loadUnreadCount]);

  // Check current push subscription state
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) return;
    getSwRegistration()
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setPushSubscribed(!!sub))
      .catch(() => {});
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const toggleOpen = () => {
    if (!isOpen) loadNotifications();
    setIsOpen(v => !v);
  };

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      try {
        await apiService.patch(`/notifications/${n.id}/read`, {});
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
        setUnreadCount(c => Math.max(0, c - 1));
      } catch { /* silent */ }
    }
    if (n.actionUrl) {
      setIsOpen(false);
      router.push(n.actionUrl);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await apiService.patch('/notifications/mark-all-read', {});
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
    finally { setMarkingAll(false); }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    router.push('/notifications');
  };

  const handleTogglePush = async () => {
    if (typeof window === 'undefined') return;

    if (!('serviceWorker' in navigator)) {
      alert('Push notifications require a service worker. Please use a modern browser.');
      return;
    }
    if (!('PushManager' in window)) {
      alert(
        'Push notifications are not supported.\n\n' +
        'On iPhone/iPad: iOS 16.4+ is required and the app must be installed to your Home Screen via Safari → Share → Add to Home Screen.'
      );
      return;
    }
    if (!('Notification' in window)) {
      alert('Please open the app from your Home Screen icon, not directly in Safari.');
      return;
    }

    setPushLoading(true);
    try {
      if (pushSubscribed) {
        // ── Unsubscribe ──
        const reg = await getSwRegistration();
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          await apiService.post('/notifications/push/unsubscribe', { endpoint: sub.endpoint });
        }
        setPushSubscribed(false);
        return;
      }

      // ── Subscribe ──

      if (Notification.permission === 'denied') {
        alert('Notifications are blocked.\n\nGo to Settings → Notifications → Eastern Estate and enable Allow Notifications.');
        return;
      }

      // Get SW registration BEFORE requesting permission —
      // iOS can fail subscribe() if the SW isn't controlling the page yet.
      const reg = await getSwRegistration();

      // On iOS, pushManager.subscribe() requires navigator.serviceWorker.controller
      // to be set (i.e. the page must have been loaded while a SW was active).
      // If it's null, the only fix is to reload the page so the SW claims it.
      if (!navigator.serviceWorker.controller) {
        alert(
          'The app needs to reload once to activate push notifications.\n\n' +
          'The page will now refresh — please tap "Enable mobile notifications" again after it reloads.'
        );
        window.location.reload();
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Please tap "Allow" when asked to receive notifications.');
        return;
      }

      const vapidData: any = await apiService.get('/notifications/push/vapid-public-key');
      if (!vapidData?.publicKey) {
        alert('Push notifications are not configured on the server yet.');
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidData.publicKey),
      });

      const { endpoint, keys } = sub.toJSON() as any;
      await apiService.post('/notifications/push/subscribe', {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      });
      setPushSubscribed(true);
    } catch (err: any) {
      const msg = err?.message || String(err);
      // Give actionable advice for the most common iOS error
      if (msg.toLowerCase().includes('abort') || msg.toLowerCase().includes('subscribe')) {
        alert(
          'Subscription failed. Please try:\n\n' +
          '1. Close the app fully (swipe up)\n' +
          '2. Reopen from Home Screen\n' +
          '3. Tap "Enable mobile notifications" again\n\n' +
          'Error: ' + msg
        );
      } else {
        alert('Could not enable notifications:\n\n' + msg);
      }
    } finally {
      setPushLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const unread = notifications.filter(n => !n.isRead);

  return (
    <div className="relative" ref={dropdownRef}>

      {/* Bell button */}
      <button onClick={toggleOpen}
        className="relative p-2 rounded-xl transition-colors hover:bg-[#FEF3E2]"
        aria-label="Notifications">
        <Bell className="h-5 w-5 text-[#A8211B]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-0.5 bg-[#A8211B] text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="
            fixed left-2 right-2 top-16
            sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-[360px]
            bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 flex flex-col overflow-hidden
          "
          style={{ maxHeight: '80vh' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#A8211B]" />
              <span className="font-bold text-gray-900 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-black bg-[#A8211B] text-white px-1.5 py-0.5 rounded-full leading-none">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread.length > 0 && (
                <button onClick={handleMarkAllRead} disabled={markingAll}
                  className="flex items-center gap-1 text-xs font-semibold text-[#A8211B] hover:bg-[#FEF3E2] px-2 py-1 rounded-lg transition disabled:opacity-40">
                  <CheckCheck className="w-3.5 h-3.5" />
                  {markingAll ? 'Marking…' : 'Mark all read'}
                </button>
              )}
              <button onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="space-y-3 p-4 animate-pulse">
                {[1,2,3].map(i => (
                  <div key={i} className="flex gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-full" />
                      <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                  <Inbox className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-500">All caught up</p>
                <p className="text-xs text-gray-400 mt-0.5">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const cat = CATEGORY_CONFIG[n.category] ?? CATEGORY_CONFIG.SYSTEM;
                const Icon = cat.icon;
                return (
                  <button key={n.id} onClick={() => handleClick(n)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50/80 transition-colors flex items-start gap-3 ${!n.isRead ? 'bg-[#FEF9F0]' : ''} ${TYPE_RING[n.type] ?? ''}`}>

                    {/* Category icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cat.bg}`}>
                      <Icon className={`w-4 h-4 ${cat.iconColor}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs leading-snug line-clamp-1 ${!n.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="mt-1 w-2 h-2 rounded-full bg-[#A8211B] shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${cat.bg} ${cat.iconColor}`}>
                          {cat.label}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-50 p-2 space-y-1">
            {notifications.length > 0 && (
              <button onClick={handleViewAll}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-[#A8211B] hover:bg-[#FEF3E2] transition">
                View all notifications <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            {/* Push notification toggle */}
            <button
              onClick={handleTogglePush}
              disabled={pushLoading}
              className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition disabled:opacity-50 ${
                pushSubscribed
                  ? 'text-gray-500 hover:bg-gray-100'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              {pushSubscribed
                ? <><BellOff className="w-3.5 h-3.5" /> {pushLoading ? 'Disabling…' : 'Disable mobile notifications'}</>
                : <><Smartphone className="w-3.5 h-3.5" /> {pushLoading ? 'Enabling…' : 'Enable mobile notifications'}</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
