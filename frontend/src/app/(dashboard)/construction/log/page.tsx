'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Building2, Home, Layers, Loader2, Search, Hammer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { propertiesService, type Property } from '@/services/properties.service';
import { towersService, type Tower } from '@/services/towers.service';
import { flatsService, type Flat } from '@/services/flats.service';
import { usePropertyStore } from '@/store/propertyStore';

function LogLauncherInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { selectedProperties } = usePropertyStore();

  const [properties, setProperties] = useState<Property[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);

  const [propertyId, setPropertyId] = useState<string>('');
  const [towerId, setTowerId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loadingProps, setLoadingProps] = useState(true);
  const [loadingTowers, setLoadingTowers] = useState(false);
  const [loadingFlats, setLoadingFlats] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoadingProps(true);
        const res: any = await propertiesService.getProperties();
        const list: Property[] = Array.isArray(res) ? res : res?.data || [];
        setProperties(list);
        const preset =
          params?.get('property') ||
          (selectedProperties.length === 1 ? selectedProperties[0] : '') ||
          list[0]?.id ||
          '';
        setPropertyId(preset);
      } finally {
        setLoadingProps(false);
      }
    })();
  }, [params, selectedProperties]);

  useEffect(() => {
    if (!propertyId) {
      setTowers([]);
      setTowerId('');
      return;
    }
    (async () => {
      try {
        setLoadingTowers(true);
        const list = await towersService.getTowersByProperty(propertyId);
        setTowers(Array.isArray(list) ? list : []);
        const preset = params?.get('tower') || '';
        setTowerId(preset && list?.some((t) => t.id === preset) ? preset : '');
      } finally {
        setLoadingTowers(false);
      }
    })();
  }, [propertyId, params]);

  useEffect(() => {
    if (!towerId) {
      setFlats([]);
      return;
    }
    (async () => {
      try {
        setLoadingFlats(true);
        const list = await flatsService.getFlatsByTower(towerId);
        setFlats(Array.isArray(list) ? list : []);
      } finally {
        setLoadingFlats(false);
      }
    })();
  }, [towerId]);

  const filteredFlats = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return flats;
    return flats.filter(
      (f) =>
        f.flatNumber.toLowerCase().includes(q) ||
        (f.name || '').toLowerCase().includes(q) ||
        (f.type || '').toLowerCase().includes(q),
    );
  }, [flats, search]);

  const goToFlat = (flatId: string) => {
    router.push(`/construction/flats/${flatId}/log`);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/construction" className="hover:underline">Construction</Link>
          <span>·</span>
          <span>Log flat progress</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Log flat progress</h1>
        <p className="text-sm text-muted-foreground">
          Pick a flat to log its phase progress. Hitting a milestone threshold automatically raises a Demand Draft.
        </p>
      </header>

      <Card>
        <CardContent className="space-y-4 p-4 md:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" /> Project
              </Label>
              <Select value={propertyId} onValueChange={setPropertyId} disabled={loadingProps}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingProps ? 'Loading...' : 'Choose project'} />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Layers className="h-4 w-4" /> Tower
              </Label>
              <Select
                value={towerId}
                onValueChange={setTowerId}
                disabled={!propertyId || loadingTowers}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !propertyId
                        ? 'Choose project first'
                        : loadingTowers
                        ? 'Loading...'
                        : towers.length
                        ? 'Choose tower'
                        : 'No towers'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {towers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                      {t.towerNumber ? ` (${t.towerNumber})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Search className="h-4 w-4" /> Search flat
            </Label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Flat number, name, type..."
              disabled={!towerId}
            />
          </div>
        </CardContent>
      </Card>

      <section>
        {!towerId ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Pick a project and tower above to see flats.
            </CardContent>
          </Card>
        ) : loadingFlats ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading flats...
          </div>
        ) : filteredFlats.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              {search ? 'No flats match your search.' : 'No flats in this tower.'}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {filteredFlats.map((f) => (
              <button
                key={f.id}
                onClick={() => goToFlat(f.id)}
                className="group text-left rounded-lg border bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors p-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ background: '#FDF4E7', color: '#A8211B' }}
                  >
                    <Home className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{f.flatNumber}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {[f.type?.replace('_', ' '), `Floor ${f.floor}`, f.status]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                    {typeof f.constructionProgress === 'number' && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Hammer className="h-3 w-3" />
                        <span>
                          {f.constructionStage
                            ? `${f.constructionStage.replace('_', ' ')} · `
                            : ''}
                          {Math.round(f.constructionProgress || 0)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0" />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function LogLauncherPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading...
        </div>
      }
    >
      <LogLauncherInner />
    </Suspense>
  );
}
