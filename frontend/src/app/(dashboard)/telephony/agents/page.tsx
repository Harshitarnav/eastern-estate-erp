"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Users, CheckCircle, XCircle } from "lucide-react";

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#8B7355] bg-clip-text text-transparent">
          Agent Management
        </h1>
        <p className="text-gray-600 mt-1">
          Manage agent availability and performance
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="shadow-xl">
        <CardContent className="py-12">
          <div className="text-center">
            <Users className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Agent Management Coming Soon
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              This section will allow you to manage agent availability, view
              performance metrics, and configure call routing rules.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

