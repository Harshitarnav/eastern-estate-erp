'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';
import { HardHat, Camera, TrendingUp, Building2 } from 'lucide-react';

function fmtDate(d: string | null) {
  if (!d) return '–';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Progress</span><span className="font-bold text-[#A8211B]">{pct.toFixed(0)}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#A8211B] to-[#e05a53] rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function PortalConstructionPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.get('/customer-portal/construction')
      .then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="h-28 bg-gray-200 rounded-2xl" />
        {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
      </div>
    );
  }

  const { projects = [], updates = [], bookings = [] } = data || {};

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Construction Updates</h1>

      {/* No data */}
      {projects.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <HardHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Construction updates will appear here once work starts on your property</p>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide">Projects</h2>
          {projects.map((proj: any) => (
            <div key={proj.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#A8211B]/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-[#A8211B]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{proj.projectName || proj.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Status: <span className="font-medium text-gray-600">{proj.status?.replace(/_/g, ' ')}</span>
                    {proj.expectedCompletionDate && (
                      <> · Expected: {fmtDate(proj.expectedCompletionDate)}</>
                    )}
                  </p>
                </div>
              </div>
              {proj.overallProgress != null && <ProgressBar value={proj.overallProgress} />}
            </div>
          ))}
        </div>
      )}

      {/* Progress Logs */}
      {updates.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide">Recent Site Updates</h2>
          {updates.map((log: any) => {
            const photos: any[] = Array.isArray(log.photos) ? log.photos : [];
            return (
              <div key={log.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {log.workType?.replace(/_/g, ' ') || 'Site Update'}
                      </p>
                      <p className="text-xs text-gray-400">{fmtDate(log.logDate)}</p>
                    </div>
                    {log.progressPercentage != null && (
                      <span className="text-xs font-bold bg-[#A8211B]/10 text-[#A8211B] px-2 py-1 rounded-lg shrink-0">
                        {Number(log.progressPercentage).toFixed(0)}%
                      </span>
                    )}
                  </div>
                  {log.description && (
                    <p className="text-sm text-gray-600 leading-relaxed">{log.description}</p>
                  )}
                </div>

                {/* Photos */}
                {photos.length > 0 && (
                  <div className="px-4 pb-4">
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                      <Camera className="w-3 h-3" /> {photos.length} photo{photos.length > 1 ? 's' : ''}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {photos.slice(0, 6).map((photo: any, i: number) => {
                        const url = typeof photo === 'string' ? photo : photo?.url;
                        return url ? (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                            <img src={url} alt={`Site photo ${i + 1}`}
                              className="w-full h-20 object-cover rounded-lg border border-gray-100 hover:opacity-90 transition" />
                          </a>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {projects.length > 0 && updates.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No progress logs yet for your property</p>
        </div>
      )}
    </div>
  );
}
