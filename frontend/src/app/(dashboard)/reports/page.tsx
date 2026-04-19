'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, TrendingUp, ArrowRight, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const REPORTS = [
  {
    id: 'outstanding',
    title: 'Outstanding Report',
    description: 'Unit-wise breakdown of amounts demanded vs paid. Identify overdue accounts instantly.',
    icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
    href: '/reports/outstanding',
    color: 'border-red-100 hover:border-red-300 hover:bg-red-50/30',
  },
  {
    id: 'collection',
    title: 'Collection Report',
    description: 'All payments received, grouped by property/tower with date range & method filters.',
    icon: <TrendingUp className="h-6 w-6 text-green-600" />,
    href: '/reports/collection',
    color: 'border-green-100 hover:border-green-300 hover:bg-green-50/30',
  },
  {
    id: 'inventory',
    title: 'Stock Inventory Report',
    description: 'Property/tower-wise flat availability - Available, Booked, Sold, On Hold. Filter by BHK type.',
    icon: <Package className="h-6 w-6 text-blue-600" />,
    href: '/reports/inventory',
    color: 'border-blue-100 hover:border-blue-300 hover:bg-blue-50/30',
  },
];

export default function ReportsIndexPage() {
  const router = useRouter();

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#7B1E12]">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Select a report to view and export data</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REPORTS.map(r => (
          <Card key={r.id}
            className={`cursor-pointer border-2 transition-all ${r.color}`}
            onClick={() => router.push(r.href)}>
            <CardContent className="p-5 flex items-start gap-4">
              <div className="mt-0.5 flex-shrink-0">{r.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800">{r.title}</p>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{r.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 mt-1 flex-shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
