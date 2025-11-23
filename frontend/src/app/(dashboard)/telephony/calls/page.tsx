"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import Link from "next/link";

interface Call {
  id: number;
  callSid: string;
  propertyId: number;
  customerPhone: string;
  virtualNumber: string;
  direction: "INBOUND" | "OUTBOUND";
  status: string;
  duration: number;
  startTime: string;
  endTime: string | null;
  agentId: number | null;
  sentiment: string | null;
  recordingUrl: string | null;
}

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 50;

  useEffect(() => {
    loadCalls();
  }, [page, statusFilter, directionFilter]);

  const loadCalls = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const params: any = {
        limit,
        offset: page * limit,
      };

      if (statusFilter !== "all") params.status = statusFilter;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/telephony/calls`,
        { headers, params }
      );

      let callsData = response.data.data || [];
      
      // Filter by direction on client side
      if (directionFilter !== "all") {
        callsData = callsData.filter(
          (call: Call) => call.direction === directionFilter
        );
      }

      // Filter by search query
      if (searchQuery) {
        callsData = callsData.filter(
          (call: Call) =>
            call.customerPhone.includes(searchQuery) ||
            call.callSid.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setCalls(callsData);
      setTotal(response.data.meta?.total || callsData.length);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load calls:", error);
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "missed":
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "in_progress":
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: "bg-green-100 text-green-700",
      missed: "bg-red-100 text-red-700",
      failed: "bg-red-100 text-red-700",
      in_progress: "bg-blue-100 text-blue-700",
      queued: "bg-yellow-100 text-yellow-700",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status.toLowerCase()] || "bg-gray-100 text-gray-700"
        }`}
      >
        {status}
      </span>
    );
  };

  const getSentimentBadge = (sentiment: string | null) => {
    if (!sentiment) return null;

    const styles: Record<string, string> = {
      POSITIVE: "bg-green-100 text-green-700",
      NEUTRAL: "bg-gray-100 text-gray-700",
      NEGATIVE: "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[sentiment] || "bg-gray-100 text-gray-700"
        }`}
      >
        {sentiment}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#8B7355] bg-clip-text text-transparent">
            Call History
          </h1>
          <p className="text-gray-600 mt-1">View and manage all calls</p>
        </div>
        <Button
          onClick={() => loadCalls()}
          className="bg-gradient-to-r from-[#D4AF37] to-[#8B7355] text-white hover:opacity-90"
        >
          <Download className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by phone or Call SID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadCalls()}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="MISSED">Missed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              </SelectContent>
            </Select>

            <Select value={directionFilter} onValueChange={setDirectionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Directions</SelectItem>
                <SelectItem value="INBOUND">Inbound</SelectItem>
                <SelectItem value="OUTBOUND">Outbound</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={loadCalls} className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calls Table */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>
            {total} Call{total !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading calls...</p>
            </div>
          ) : calls.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No calls found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Direction
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Date & Time
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Duration
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Sentiment
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {calls.map((call) => (
                    <tr
                      key={call.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {call.direction === "INBOUND" ? (
                            <PhoneIncoming className="w-4 h-4 text-green-500" />
                          ) : (
                            <PhoneOutgoing className="w-4 h-4 text-blue-500" />
                          )}
                          <span className="text-sm font-medium">
                            {call.direction}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {call.customerPhone}
                          </p>
                          <p className="text-xs text-gray-500">
                            {call.callSid.substring(0, 12)}...
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {formatDateTime(call.startTime)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-gray-900">
                          {formatDuration(call.duration)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(call.status)}
                          {getStatusBadge(call.status)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getSentimentBadge(call.sentiment)}
                      </td>
                      <td className="py-4 px-4">
                        <Link href={`/telephony/calls/${call.callSid}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && calls.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600">
                Showing {page * limit + 1} to{" "}
                {Math.min((page + 1) * limit, total)} of {total} calls
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={(page + 1) * limit >= total}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

