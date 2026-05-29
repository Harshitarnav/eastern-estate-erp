'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Monitor, Smartphone, Globe, LogOut, RefreshCw, Loader2,
  Clock, User as UserIcon, Wifi,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { sessionsService, ActiveSession } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';

const fmtDate = (s: string) =>
  new Date(s).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const getDeviceIcon = (userAgent: string) => {
  if (!userAgent) return <Globe className="w-4 h-4" />;
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone'))
    return <Smartphone className="w-4 h-4" />;
  return <Monitor className="w-4 h-4" />;
};

const parseDevice = (userAgent: string) => {
  if (!userAgent) return 'Unknown device';
  if (userAgent.toLowerCase().includes('postman')) return 'Postman / API client';
  const browser = userAgent.match(/(chrome|firefox|safari|edge|opera)/i)?.[1] ?? 'Browser';
  const os = userAgent.match(/(windows|mac|linux|android|iphone|ipad)/i)?.[1] ?? 'Unknown OS';
  return `${browser} on ${os}`;
};

export default function ActiveSessionsPage() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState<string | null>(null);

  const isSuperAdmin = user?.roles?.some((r: any) => r.name === 'super_admin');
  const isAdmin = user?.roles?.some((r: any) => r.name === 'admin');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sessionsService.getActiveSessions();
      setSessions(data);
    } catch {
      toast.error('Failed to load active sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleForceLogout = async (session: ActiveSession) => {
    if (!confirm(`Force-logout ${session.firstName} ${session.lastName} (${session.email})? They will be signed out of all devices immediately.`))
      return;

    setLoggingOut(session.userId);
    try {
      await sessionsService.forceLogout(session.userId);
      toast.success(`${session.firstName} ${session.lastName} has been logged out`);
      setSessions((prev) => prev.filter((s) => s.userId !== session.userId));
    } catch {
      toast.error('Failed to force logout');
    } finally {
      setLoggingOut(null);
    }
  };

  if (!isSuperAdmin && !isAdmin) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        You don't have permission to view active sessions.
      </div>
    );
  }

  // Group sessions by user
  const byUser = sessions.reduce<Record<string, ActiveSession[]>>((acc, s) => {
    if (!acc[s.userId]) acc[s.userId] = [];
    acc[s.userId].push(s);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Sessions</h1>
          <p className="text-sm text-gray-500 mt-1">
            {sessions.length} active session{sessions.length !== 1 ? 's' : ''} across{' '}
            {Object.keys(byUser).length} user{Object.keys(byUser).length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Wifi className="w-8 h-8 mb-2" />
            <p>No active sessions found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(byUser).map(([userId, userSessions]) => {
            const s = userSessions[0];
            const isCurrentUser = userId === user?.id;
            return (
              <Card key={userId} className={isCurrentUser ? 'border-blue-200 bg-blue-50/30' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 uppercase">
                        {s.firstName?.[0]}{s.lastName?.[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {s.firstName} {s.lastName}
                          </span>
                          {isCurrentUser && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs">You</Badge>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">{s.email}</span>
                      </div>
                    </div>

                    {!isCurrentUser && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleForceLogout(s)}
                        disabled={loggingOut === userId}
                      >
                        {loggingOut === userId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <LogOut className="w-4 h-4 mr-1" />
                            Force Logout
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="mt-3 space-y-2">
                    {userSessions.map((session) => (
                      <div
                        key={session.sessionId}
                        className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2"
                      >
                        <span className="flex items-center gap-1.5">
                          {getDeviceIcon(session.userAgent)}
                          {parseDevice(session.userAgent)}
                        </span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <Globe className="w-3 h-3" />
                          {session.ipAddress || 'Unknown IP'}
                        </span>
                        <span className="flex items-center gap-1 text-gray-400 ml-auto">
                          <Clock className="w-3 h-3" />
                          Logged in {fmtDate(session.loginAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
