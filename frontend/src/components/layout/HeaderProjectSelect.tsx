'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePropertyStore } from '@/store/propertyStore';
import { propertiesService } from '@/services/properties.service';
import { hasWidePropertyScope } from '@/lib/roles';
import { Building2, ChevronDown } from 'lucide-react';

/**
 * Global project scope for the dashboard header - drives the same Zustand selection
 * as accounting and other modules (via usePropertyStore).
 *
 * Always loads options from GET /properties, which the API scopes by the user's
 * assignments — same source as booking/leads dropdowns (avoids desync with
 * /users/:id/property-access and empty nested `property` payloads).
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
  const wideAccess = hasWidePropertyScope(userRoles, user?.propertyAccessMode);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    setListResolved(false);
    propertiesService
      .getProperties({ limit: 200 })
      .then((res: any) => {
        if (cancelled) return;
        const list = res?.data ?? [];
        const arr = Array.isArray(list) ? list : [];
        setProperties(
          arr.map((p: any) => ({
            id: p.id,
            name: p.name,
            location: p.location || p.city || '',
            type: p.propertyType || p.type || 'Property',
          })),
        );
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
  }, [user?.id, user?.propertyAccessMode, setProperties]);

  useEffect(() => {
    if (properties.length === 0 || wideAccess) return;
    if (selectedProperties.length === 0) {
      setSelectedProperties([properties[0].id]);
    }
  }, [properties, selectedProperties.length, wideAccess, setSelectedProperties]);

  useEffect(() => {
    if (wideAccess || properties.length === 0) return;
    const allowed = new Set(properties.map((p) => p.id));
    const next = selectedProperties.filter((id) => allowed.has(id));
    if (next.length === selectedProperties.length) return;
    setSelectedProperties(next.length > 0 ? next : [properties[0].id]);
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
        <span className="text-xs text-amber-800 truncate" title="Ask an admin to assign project access">
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
            if (wideAccess) {
              setSelectedProperties(v ? [v] : []);
              return;
            }
            // Scoped users: never leave “no project” — keep at least the first assignment
            if (!v && properties[0]) {
              setSelectedProperties([properties[0].id]);
              return;
            }
            setSelectedProperties(v ? [v] : properties[0] ? [properties[0].id] : []);
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
