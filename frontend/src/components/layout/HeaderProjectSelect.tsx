'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePropertyStore } from '@/store/propertyStore';
import { propertiesService } from '@/services/properties.service';
import apiService from '@/services/api';
import { seesAllAccountingProjects } from '@/lib/roles';
import { Building2, ChevronDown } from 'lucide-react';

/**
 * Global project scope for the dashboard header - drives the same Zustand selection
 * as accounting and other modules (via usePropertyStore).
 */
export function HeaderProjectSelect() {
  const { user } = useAuthStore();
  const {
    selectedProperties,
    properties,
    setSelectedProperties,
    setProperties,
  } = usePropertyStore();

  const [listResolved, setListResolved] = useState(false);

  const userRoles = user?.roles?.map((r: any) => (typeof r === 'string' ? r : r.name)) || [];
  const wideAccess = seesAllAccountingProjects(userRoles);

  useEffect(() => {
    if (!user?.id || !wideAccess) return;
    if (properties.length > 0) {
      setListResolved(true);
      return;
    }
    let cancelled = false;
    propertiesService
      .getProperties({ limit: 200 })
      .then((res: any) => {
        if (cancelled) return;
        const list = res?.data ?? res ?? [];
        const arr = Array.isArray(list) ? list : list.data ?? [];
        setProperties(
          arr.map((p: any) => ({
            id: p.id,
            name: p.name,
            location: p.location || p.city || '',
            type: p.propertyType || p.type || 'Property',
          })),
        );
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setListResolved(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, wideAccess, properties.length, setProperties]);

  useEffect(() => {
    if (!user?.id || wideAccess) return;
    let cancelled = false;
    apiService
      .get(`/users/${user.id}/property-access`)
      .then((res: any) => {
        if (cancelled) return;
        const items: any[] = Array.isArray(res) ? res : (res?.data ?? []);
        const mapped = items
          .filter((a: any) => a.property)
          .map((a: any) => ({
            id: a.property.id,
            name: a.property.name,
            location: a.property.city || '',
            type: 'Property',
          }));
        setProperties(mapped);
      })
      .catch(() => {
        if (!cancelled) setProperties([]);
      })
      .finally(() => {
        if (!cancelled) setListResolved(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, wideAccess, setProperties]);

  useEffect(() => {
    if (properties.length === 0 || wideAccess) return;
    if (selectedProperties.length === 0 && properties.length === 1) {
      setSelectedProperties([properties[0].id]);
    }
  }, [properties, selectedProperties, wideAccess, setSelectedProperties]);

  useEffect(() => {
    if (wideAccess || properties.length === 0) return;
    const allowed = new Set(properties.map((p) => p.id));
    const next = selectedProperties.filter((id) => allowed.has(id));
    if (next.length === selectedProperties.length) return;
    setSelectedProperties(
      next.length > 0 ? next : properties.length === 1 ? [properties[0].id] : [],
    );
  }, [properties, selectedProperties, wideAccess, setSelectedProperties]);

  if (!user?.id) return null;

  const selectedId = selectedProperties[0] ?? '';

  if (!listResolved) {
    return (
      <div className="flex items-center gap-1.5 min-w-0 flex-1 basis-0 sm:basis-auto sm:flex-initial sm:max-w-[min(100%,20rem)]">
        <Building2 className="h-3.5 w-3.5 shrink-0 hidden sm:block text-gray-400" />
        <span className="text-xs text-gray-500 truncate">Loading projects…</span>
      </div>
    );
  }

  if (!wideAccess && properties.length === 0) {
    return (
      <div className="flex items-center gap-1.5 min-w-0 flex-1 basis-0 sm:max-w-[min(100%,20rem)]">
        <Building2 className="h-3.5 w-3.5 shrink-0 hidden sm:block text-amber-600" />
        <span className="text-xs text-amber-800 truncate" title="Ask an admin to assign property access">
          No project assigned - contact admin
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 min-w-0 flex-1 basis-0 sm:basis-auto sm:flex-initial sm:max-w-[min(100%,20rem)]">
      <Building2 className="h-3.5 w-3.5 shrink-0 hidden sm:block" style={{ color: '#7B1E12' }} />
      <div className="relative min-w-0 flex-1 sm:flex-initial sm:min-w-[8rem]">
        <select
          value={wideAccess && !selectedId ? '' : selectedId}
          onChange={(e) => {
            const v = e.target.value;
            setSelectedProperties(v ? [v] : []);
          }}
          aria-label="Project scope"
          className="w-full appearance-none pl-2 sm:pl-3 pr-7 py-1.5 text-xs sm:text-sm font-medium rounded-lg border bg-[#FEF9F0] truncate"
          style={{ borderColor: '#F3E3C1', color: '#7B1E12' }}
        >
          {wideAccess && <option value="">All projects</option>}
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
      </div>
    </div>
  );
}
