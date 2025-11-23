"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Clock,
  User,
  MapPin,
  DollarSign,
  Home,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Play,
  Download,
  RefreshCw,
} from "lucide-react";
import axios from "axios";

interface CallDetails {
  id: number;
  callSid: string;
  propertyId: number;
  customerPhone: string;
  virtualNumber: string;
  direction: string;
  status: string;
  duration: number;
  startTime: string;
  endTime: string | null;
  recordingUrl: string | null;
  sentiment: string | null;
}

interface Transcription {
  id: number;
  callSid: string;
  transcriptText: string;
  duration: number;
  language: string;
  confidence: number;
  wordCount: number;
}

interface AIInsight {
  id: number;
  callSid: string;
  summary: string;
  sentiment: string;
  leadQualityScore: number;
  hotLead: boolean;
  conversionProbability: number;
  keyTopics: string[];
  painPoints: string[];
  objections: string[];
  nextBestAction: string;
  customerName: string | null;
  customerEmail: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  preferredLocation: string[] | null;
  bhkRequirement: string | null;
  purposeOfPurchase: string | null;
  timeline: string | null;
  financingNeeded: boolean | null;
  propertyTypes: string[] | null;
}

export default function CallDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const callSid = params.callSid as string;

  const [call, setCall] = useState<CallDetails | null>(null);
  const [transcription, setTranscription] = useState<Transcription | null>(null);
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reprocessing, setReprocessing] = useState(false);

  useEffect(() => {
    loadCallDetails();
  }, [callSid]);

  const loadCallDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Load call details
      const callRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/telephony/calls/${callSid}`,
        { headers }
      );
      setCall(callRes.data.data);

      // Load transcription
      try {
        const transcriptionRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/telephony/calls/${callSid}/transcription`,
          { headers }
        );
        setTranscription(transcriptionRes.data.data);
      } catch (error) {
        console.log("No transcription available");
      }

      // Load AI insights
      try {
        const insightsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/telephony/calls/${callSid}/insights`,
          { headers }
        );
        setInsights(insightsRes.data.data);
      } catch (error) {
        console.log("No insights available");
      }

      // Load recording URL
      try {
        const recordingRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/telephony/calls/${callSid}/recording`,
          { headers }
        );
        setRecordingUrl(recordingRes.data.data.url);
      } catch (error) {
        console.log("No recording available");
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to load call details:", error);
      setLoading(false);
    }
  };

  const reprocessCall = async () => {
    try {
      setReprocessing(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/telephony/calls/${callSid}/reprocess`,
        {},
        { headers }
      );

      alert("Call reprocessing initiated. Please refresh in a few minutes.");
      setReprocessing(false);
    } catch (error) {
      console.error("Failed to reprocess call:", error);
      alert("Failed to reprocess call");
      setReprocessing(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatBudget = (amount: number): string => {
    return `₹${(amount / 100000).toFixed(2)}L`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading call details...</p>
        </div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-gray-900 font-semibold">Call not found</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#8B7355] bg-clip-text text-transparent">
              Call Details
            </h1>
            <p className="text-gray-600 mt-1">{call.callSid}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={reprocessCall}
            disabled={reprocessing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${reprocessing ? "animate-spin" : ""}`} />
            {reprocessing ? "Reprocessing..." : "Reprocess"}
          </Button>
        </div>
      </div>

      {/* Call Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Info Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Call Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#D4AF37]" />
                <div>
                  <p className="text-sm text-gray-600">Customer Phone</p>
                  <p className="font-semibold">{call.customerPhone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#D4AF37]" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold">{formatDuration(call.duration)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#D4AF37]" />
                <div>
                  <p className="text-sm text-gray-600">Start Time</p>
                  <p className="font-semibold">
                    {new Date(call.startTime).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      call.status === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {call.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recording Card */}
          {recordingUrl && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Call Recording</CardTitle>
              </CardHeader>
              <CardContent>
                <audio controls className="w-full">
                  <source src={recordingUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => window.open(recordingUrl, "_blank")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Recording
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Transcription Card */}
          {transcription && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Transcription</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
                  <span>Language: {transcription.language}</span>
                  <span>Confidence: {Math.round(transcription.confidence * 100)}%</span>
                  <span>Words: {transcription.wordCount}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {transcription.transcriptText}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - AI Insights */}
        {insights && (
          <div className="space-y-6">
            {/* Hot Lead Badge */}
            {insights.hotLead && (
              <Card className="shadow-xl border-2 border-[#D4AF37]">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7355] flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#D4AF37]">🔥 Hot Lead</h3>
                      <p className="text-sm text-gray-600">High conversion potential</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Summary */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Summary</p>
                  <p className="text-gray-900">{insights.summary}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Lead Score</p>
                    <p className="text-2xl font-bold text-[#D4AF37]">
                      {insights.leadQualityScore}/100
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Conversion</p>
                    <p className="text-2xl font-bold text-green-600">
                      {insights.conversionProbability}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sentiment</p>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        insights.sentiment === "POSITIVE"
                          ? "bg-green-100 text-green-700"
                          : insights.sentiment === "NEGATIVE"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {insights.sentiment}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lead Information */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Lead Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.customerName && (
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold">{insights.customerName}</p>
                    </div>
                  </div>
                )}
                {insights.customerEmail && (
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{insights.customerEmail}</p>
                    </div>
                  </div>
                )}
                {(insights.budgetMin || insights.budgetMax) && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Budget</p>
                      <p className="font-semibold">
                        {insights.budgetMin && formatBudget(insights.budgetMin)}
                        {insights.budgetMin && insights.budgetMax && " - "}
                        {insights.budgetMax && formatBudget(insights.budgetMax)}
                      </p>
                    </div>
                  </div>
                )}
                {insights.preferredLocation && insights.preferredLocation.length > 0 && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Preferred Location</p>
                      <p className="font-semibold">
                        {insights.preferredLocation.join(", ")}
                      </p>
                    </div>
                  </div>
                )}
                {insights.bhkRequirement && (
                  <div className="flex items-center gap-3">
                    <Home className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">BHK Requirement</p>
                      <p className="font-semibold">{insights.bhkRequirement}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Action */}
            <Card className="shadow-lg border-l-4 border-l-[#D4AF37]">
              <CardHeader>
                <CardTitle className="text-[#8B7355]">Recommended Action</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 font-medium">{insights.nextBestAction}</p>
              </CardContent>
            </Card>

            {/* Topics & Insights */}
            {(insights.keyTopics.length > 0 ||
              insights.painPoints.length > 0 ||
              insights.objections.length > 0) && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Discussion Points</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {insights.keyTopics.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Key Topics</p>
                      <div className="flex flex-wrap gap-2">
                        {insights.keyTopics.map((topic, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {insights.painPoints.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Pain Points</p>
                      <ul className="list-disc list-inside space-y-1">
                        {insights.painPoints.map((point, i) => (
                          <li key={i} className="text-sm text-gray-900">
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {insights.objections.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Objections</p>
                      <ul className="list-disc list-inside space-y-1">
                        {insights.objections.map((objection, i) => (
                          <li key={i} className="text-sm text-red-600">
                            {objection}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

