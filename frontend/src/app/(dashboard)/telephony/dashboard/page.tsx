"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Users, Clock, TrendingUp, AlertCircle, PhoneCall, PhoneOff, CheckCircle } from "lucide-react";
import axios from "axios";
import Link from "next/link";

interface CallStats {
  totalCalls: number;
  completedCalls: number;
  missedCalls: number;
  failedCalls: number;
  avgDuration: number;
  totalDuration: number;
}

interface AgentStats {
  employeeId: number;
  employeeName: string;
  isAvailable: boolean;
  status: string;
  currentCalls: number;
  totalCallsToday: number;
  successRate: number;
}

interface QueueStats {
  totalWaiting: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  avgWaitSeconds: number;
  maxWaitSeconds: number;
}

interface HotLead {
  id: number;
  callSid: string;
  customerName: string;
  customerPhone: string;
  leadQualityScore: number;
  conversionProbability: number;
  summary: string;
  nextBestAction: string;
  createdAt: string;
}

export default function TelephonyDashboard() {
  const [callStats, setCallStats] = useState<CallStats | null>(null);
  const [hotLeads, setHotLeads] = useState<HotLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Load call statistics
      const statsRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/telephony/calls/stats/summary`,
        { headers }
      );
      setCallStats(statsRes.data.data);

      // Load hot leads
      const leadsRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/telephony/calls/insights/hot-leads?limit=10`,
        { headers }
      );
      setHotLeads(leadsRes.data.data || []);

      setLoading(false);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#8B7355] bg-clip-text text-transparent">
            Telephony Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Real-time call management and AI insights</p>
        </div>
        <div className="flex gap-3">
          <Link href="/telephony/calls">
            <Button className="bg-gradient-to-r from-[#D4AF37] to-[#8B7355] text-white hover:opacity-90">
              <Phone className="w-4 h-4 mr-2" />
              View All Calls
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Calls */}
        <Card className="border-l-4 border-l-[#D4AF37] shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Calls
            </CardTitle>
            <PhoneCall className="w-5 h-5 text-[#D4AF37]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {callStats?.totalCalls || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        {/* Completed Calls */}
        <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Completed
            </CardTitle>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {callStats?.completedCalls || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {callStats?.totalCalls
                ? Math.round((callStats.completedCalls / callStats.totalCalls) * 100)
                : 0}
              % success rate
            </p>
          </CardContent>
        </Card>

        {/* Missed Calls */}
        <Card className="border-l-4 border-l-red-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Missed Calls
            </CardTitle>
            <PhoneOff className="w-5 h-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {callStats?.missedCalls || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Requires follow-up</p>
          </CardContent>
        </Card>

        {/* Avg Duration */}
        <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Duration
            </CardTitle>
            <Clock className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {formatDuration(callStats?.avgDuration || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Per call</p>
          </CardContent>
        </Card>
      </div>

      {/* Hot Leads Section */}
      <Card className="shadow-xl border-2 border-[#D4AF37]/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7355] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">🔥 Hot Leads</CardTitle>
                <p className="text-sm text-gray-500">AI-identified high-value opportunities</p>
              </div>
            </div>
            <Link href="/telephony/insights">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {hotLeads.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No hot leads detected yet</p>
              <p className="text-sm text-gray-500 mt-1">
                AI will identify high-quality leads automatically
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {hotLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/telephony/calls/${lead.callSid}`}
                  className="block"
                >
                  <div className="p-4 border rounded-lg hover:border-[#D4AF37] hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {lead.customerName || "Unknown Customer"}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                              Score: {lead.leadQualityScore}
                            </span>
                            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                              {lead.conversionProbability}% likely
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{lead.summary}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {lead.customerPhone}
                          </span>
                          <span>{formatTimeAgo(lead.createdAt)}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="px-3 py-2 bg-gradient-to-r from-[#D4AF37]/10 to-[#8B7355]/10 rounded-lg border border-[#D4AF37]/30">
                          <p className="text-xs font-medium text-[#8B7355] mb-1">
                            Next Action:
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {lead.nextBestAction}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/telephony/calls">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5"
              >
                <Phone className="w-6 h-6 text-[#D4AF37]" />
                <span>View All Calls</span>
              </Button>
            </Link>
            <Link href="/telephony/agents">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5"
              >
                <Users className="w-6 h-6 text-[#D4AF37]" />
                <span>Manage Agents</span>
              </Button>
            </Link>
            <Link href="/telephony/insights">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5"
              >
                <TrendingUp className="w-6 h-6 text-[#D4AF37]" />
                <span>AI Insights</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

