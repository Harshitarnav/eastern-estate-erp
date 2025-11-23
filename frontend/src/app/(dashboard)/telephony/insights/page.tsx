"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  User,
  Phone,
  MapPin,
  DollarSign,
  Home,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import Link from "next/link";

interface HotLead {
  id: number;
  callSid: string;
  customerName: string | null;
  customerPhone: string;
  customerEmail: string | null;
  leadQualityScore: number;
  conversionProbability: number;
  summary: string;
  sentiment: string;
  nextBestAction: string;
  budgetMin: number | null;
  budgetMax: number | null;
  preferredLocation: string[] | null;
  bhkRequirement: string | null;
  createdAt: string;
}

export default function InsightsPage() {
  const [hotLeads, setHotLeads] = useState<HotLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHotLeads();
  }, []);

  const loadHotLeads = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/telephony/calls/insights/hot-leads?limit=100`,
        { headers }
      );

      setHotLeads(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load hot leads:", error);
      setLoading(false);
    }
  };

  const formatBudget = (amount: number): string => {
    return `₹${(amount / 100000).toFixed(2)}L`;
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
          <p className="text-gray-600">Loading AI insights...</p>
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
            AI Insights
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered lead analysis and recommendations
          </p>
        </div>
        <Button
          onClick={loadHotLeads}
          className="bg-gradient-to-r from-[#D4AF37] to-[#8B7355] text-white hover:opacity-90"
        >
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-[#D4AF37] shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Hot Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {hotLeads.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">High-value opportunities</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {hotLeads.length > 0
                ? Math.round(
                    hotLeads.reduce(
                      (sum, lead) => sum + lead.conversionProbability,
                      0
                    ) / hotLeads.length
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-gray-500 mt-1">For hot leads</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Lead Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {hotLeads.length > 0
                ? Math.round(
                    hotLeads.reduce((sum, lead) => sum + lead.leadQualityScore, 0) /
                      hotLeads.length
                  )
                : 0}
              /100
            </div>
            <p className="text-xs text-gray-500 mt-1">Quality score</p>
          </CardContent>
        </Card>
      </div>

      {/* Hot Leads List */}
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7355] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>🔥 Hot Leads</CardTitle>
              <p className="text-sm text-gray-500">
                {hotLeads.length} high-value opportunities identified by AI
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hotLeads.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No hot leads detected yet</p>
              <p className="text-sm text-gray-500 mt-1">
                AI will automatically identify high-quality leads from call
                analysis
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
                  <div className="p-6 border rounded-lg hover:border-[#D4AF37] hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-white to-[#D4AF37]/5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {lead.customerName || "Unknown Customer"}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#8B7355] text-white text-xs font-bold">
                              Score: {lead.leadQualityScore}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                              {lead.conversionProbability}% Likely
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                lead.sentiment === "POSITIVE"
                                  ? "bg-green-100 text-green-700"
                                  : lead.sentiment === "NEGATIVE"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {lead.sentiment}
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4">{lead.summary}</p>

                        {/* Lead Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {lead.customerPhone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-[#D4AF37]" />
                              <div>
                                <p className="text-xs text-gray-500">Phone</p>
                                <p className="text-sm font-medium">
                                  {lead.customerPhone}
                                </p>
                              </div>
                            </div>
                          )}

                          {lead.customerEmail && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-[#D4AF37]" />
                              <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="text-sm font-medium">
                                  {lead.customerEmail}
                                </p>
                              </div>
                            </div>
                          )}

                          {(lead.budgetMin || lead.budgetMax) && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-[#D4AF37]" />
                              <div>
                                <p className="text-xs text-gray-500">Budget</p>
                                <p className="text-sm font-medium">
                                  {lead.budgetMin && formatBudget(lead.budgetMin)}
                                  {lead.budgetMin && lead.budgetMax && " - "}
                                  {lead.budgetMax && formatBudget(lead.budgetMax)}
                                </p>
                              </div>
                            </div>
                          )}

                          {lead.bhkRequirement && (
                            <div className="flex items-center gap-2">
                              <Home className="w-4 h-4 text-[#D4AF37]" />
                              <div>
                                <p className="text-xs text-gray-500">BHK</p>
                                <p className="text-sm font-medium">
                                  {lead.bhkRequirement}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {lead.preferredLocation &&
                          lead.preferredLocation.length > 0 && (
                            <div className="flex items-start gap-2 mb-4">
                              <MapPin className="w-4 h-4 text-[#D4AF37] mt-1" />
                              <div>
                                <p className="text-xs text-gray-500">
                                  Preferred Locations
                                </p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {lead.preferredLocation.map((loc, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                                    >
                                      {loc}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{formatTimeAgo(lead.createdAt)}</span>
                        </div>
                      </div>

                      {/* Next Action Box */}
                      <div className="ml-6 min-w-[250px]">
                        <div className="p-4 bg-gradient-to-br from-[#D4AF37]/10 to-[#8B7355]/10 rounded-lg border-2 border-[#D4AF37]/30">
                          <p className="text-xs font-bold text-[#8B7355] mb-2 uppercase">
                            Recommended Action:
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
    </div>
  );
}

