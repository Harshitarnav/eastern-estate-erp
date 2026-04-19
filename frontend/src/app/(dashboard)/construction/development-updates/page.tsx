'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  Filter,
  Layers,
  Loader2,
  MapPin,
  Palette,
  Plus,
  Save,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { propertiesService, type Property } from '@/services/properties.service';
import { towersService, type Tower } from '@/services/towers.service';
import {
  developmentUpdatesService,
  SCOPE_LABEL,
  CATEGORY_LABEL,
  type DevelopmentUpdate,
  type DevelopmentUpdateScope,
  type DevelopmentUpdateCategory,
} from '@/services/development-updates.service';
import { usePropertyStore } from '@/store/propertyStore';

const SCOPES: DevelopmentUpdateScope[] = ['PROPERTY', 'TOWER', 'COMMON_AREA'];
const CATEGORIES: DevelopmentUpdateCategory[] = [
  'BEAUTIFICATION',
  'LIFT',
  'HALLWAY_LOBBY',
  'LANDSCAPING',
  'FACADE_PAINT',
  'AMENITY',
  'SECURITY_GATES',
  'UTILITIES_EXTERNAL',
  'SIGNAGE',
  'CLEANING',
  'SAFETY',
  'OTHER',
];

function DevelopmentUpdatesInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { selectedProperties } = usePropertyStore();

  // Filters
  const [properties, setProperties] = useState<Property[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [filterPropertyId, setFilterPropertyId] = useState('');
  const [filterTowerId, setFilterTowerId] = useState('');
  const [filterScope, setFilterScope] = useState<DevelopmentUpdateScope | ''>('');
  const [filterCategory, setFilterCategory] = useState<DevelopmentUpdateCategory | ''>('');

  // Data
  const [items, setItems] = useState<DevelopmentUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(params?.get('new') === '1');
  const [fProperty, setFProperty] = useState('');
  const [fTower, setFTower] = useState('');
  const [fScope, setFScope] = useState<DevelopmentUpdateScope>('PROPERTY');
  const [fCategory, setFCategory] = useState<DevelopmentUpdateCategory>('BEAUTIFICATION');
  const [fCommonLabel, setFCommonLabel] = useState('');
  const [fTitle, setFTitle] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fDate, setFDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [fImages, setFImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fTowers, setFTowers] = useState<Tower[]>([]);

  // Load properties
  useEffect(() => {
    (async () => {
      try {
        const res: any = await propertiesService.getProperties();
        const list: Property[] = Array.isArray(res) ? res : res?.data || [];
        setProperties(list);
        const preset =
          (selectedProperties.length === 1 ? selectedProperties[0] : '') ||
          list[0]?.id ||
          '';
        setFilterPropertyId(preset);
        setFProperty(preset);
      } catch {
        setProperties([]);
      }
    })();
  }, [selectedProperties]);

  // Load filter towers when filter property changes
  useEffect(() => {
    if (!filterPropertyId) {
      setTowers([]);
      setFilterTowerId('');
      return;
    }
    (async () => {
      const list = await towersService.getTowersByProperty(filterPropertyId);
      setTowers(Array.isArray(list) ? list : []);
    })();
  }, [filterPropertyId]);

  // Load form towers when form property changes
  useEffect(() => {
    if (!fProperty) {
      setFTowers([]);
      setFTower('');
      return;
    }
    (async () => {
      const list = await towersService.getTowersByProperty(fProperty);
      setFTowers(Array.isArray(list) ? list : []);
    })();
  }, [fProperty]);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const list = await developmentUpdatesService.list({
        propertyId: filterPropertyId || undefined,
        towerId: filterTowerId || undefined,
        scopeType: filterScope || undefined,
        category: filterCategory || undefined,
        limit: 100,
      });
      setItems(Array.isArray(list) ? list : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filterPropertyId, filterTowerId, filterScope, filterCategory]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      setUploading(true);
      const res = await developmentUpdatesService.uploadImages(Array.from(files));
      setFImages((prev) => [...prev, ...(res?.urls || [])]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not upload images');
    } finally {
      setUploading(false);
    }
  }, []);

  const resetForm = () => {
    setFTitle('');
    setFDesc('');
    setFImages([]);
    setFTower('');
    setFCommonLabel('');
    setFCategory('BEAUTIFICATION');
    setFScope('PROPERTY');
    setFDate(new Date().toISOString().slice(0, 10));
  };

  const handleSave = async () => {
    if (!fProperty) {
      toast.error('Select a project first');
      return;
    }
    if (!fTitle.trim()) {
      toast.error('Add a short title');
      return;
    }
    if (!fDesc.trim()) {
      toast.error('Add a description');
      return;
    }
    if (fScope === 'TOWER' && !fTower) {
      toast.error('Pick a tower for tower-scoped updates');
      return;
    }
    if (fScope === 'COMMON_AREA' && !fCommonLabel.trim()) {
      toast.error('Name the common area (e.g. Clubhouse, Main Gate)');
      return;
    }

    try {
      setSaving(true);
      await developmentUpdatesService.create({
        propertyId: fProperty,
        towerId: fScope === 'TOWER' ? fTower : undefined,
        scopeType: fScope,
        category: fCategory,
        commonAreaLabel: fScope === 'COMMON_AREA' ? fCommonLabel.trim() : undefined,
        updateDate: fDate,
        updateTitle: fTitle.trim(),
        updateDescription: fDesc.trim(),
        images: fImages,
      });
      toast.success('Development update logged');
      resetForm();
      setShowForm(false);
      await reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to log update');
    } finally {
      setSaving(false);
    }
  };

  const scopeBadge = (u: DevelopmentUpdate) => {
    if (!u.scopeType) return null;
    const color =
      u.scopeType === 'PROPERTY'
        ? 'bg-purple-100 text-purple-700'
        : u.scopeType === 'TOWER'
        ? 'bg-blue-100 text-blue-700'
        : 'bg-amber-100 text-amber-700';
    return <Badge className={`${color} border-0 font-medium`}>{SCOPE_LABEL[u.scopeType]}</Badge>;
  };

  const groupedByDate = useMemo(() => {
    const groups: Record<string, DevelopmentUpdate[]> = {};
    items.forEach((u) => {
      const key = (u.updateDate || '').slice(0, 10);
      if (!groups[key]) groups[key] = [];
      groups[key].push(u);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [items]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 p-4 md:p-6">
      <header className="space-y-1">
        <div className="text-sm text-muted-foreground">
          <Link href="/construction" className="hover:underline">Construction</Link> · Development updates
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Palette className="h-6 w-6" style={{ color: '#A8211B' }} />
              Development updates
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Log tower-wide, common-area, and beautification updates. These do not raise demand drafts.
            </p>
          </div>
          <Button
            onClick={() => setShowForm((s) => !s)}
            style={{ background: '#A8211B', color: 'white' }}
          >
            {showForm ? (
              <>
                <X className="h-4 w-4 mr-1" /> Close
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" /> New update
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Filter className="h-4 w-4" /> Filters
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <Select value={filterPropertyId} onValueChange={setFilterPropertyId}>
              <SelectTrigger>
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterTowerId || '__all__'} onValueChange={(v) => setFilterTowerId(v === '__all__' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="All towers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All towers</SelectItem>
                {towers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterScope || '__all__'}
              onValueChange={(v) => setFilterScope(v === '__all__' ? '' : (v as DevelopmentUpdateScope))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All scopes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All scopes</SelectItem>
                {SCOPES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {SCOPE_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterCategory || '__all__'}
              onValueChange={(v) =>
                setFilterCategory(v === '__all__' ? '' : (v as DevelopmentUpdateCategory))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_LABEL[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* New update form */}
      {showForm && (
        <Card>
          <CardContent className="space-y-4 p-4 md:p-6">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Project</Label>
                <Select value={fProperty} onValueChange={setFProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose project" />
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
                <Label>Scope</Label>
                <Select value={fScope} onValueChange={(v) => setFScope(v as DevelopmentUpdateScope)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCOPES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {SCOPE_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {fScope === 'TOWER' && (
              <div className="space-y-1.5">
                <Label>Tower</Label>
                <Select value={fTower} onValueChange={setFTower} disabled={!fTowers.length}>
                  <SelectTrigger>
                    <SelectValue placeholder={fTowers.length ? 'Choose tower' : 'No towers'} />
                  </SelectTrigger>
                  <SelectContent>
                    {fTowers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                        {t.towerNumber ? ` (${t.towerNumber})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {fScope === 'COMMON_AREA' && (
              <div className="space-y-1.5">
                <Label>Area name</Label>
                <Input
                  value={fCommonLabel}
                  onChange={(e) => setFCommonLabel(e.target.value)}
                  placeholder="Clubhouse / Main gate / Pool / Garden etc."
                />
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={fCategory}
                  onValueChange={(v) => setFCategory(v as DevelopmentUpdateCategory)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CATEGORY_LABEL[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={fTitle}
                onChange={(e) => setFTitle(e.target.value)}
                placeholder="Eg. Lobby marble polishing started, Pool tiling complete..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={fDesc}
                onChange={(e) => setFDesc(e.target.value)}
                rows={4}
                placeholder="What changed on site today?"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Photos</Label>
                <span className="text-xs text-muted-foreground">Up to 10</span>
              </div>
              <label
                className={`flex items-center justify-center gap-2 rounded-md border-2 border-dashed h-24 cursor-pointer hover:bg-gray-50 transition ${
                  uploading ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Camera className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Tap to add photos</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />
              </label>
              {fImages.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {fImages.map((u) => (
                    <div key={u} className="relative group aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u} alt="" className="h-full w-full object-cover rounded-md border" />
                      <button
                        type="button"
                        onClick={() => setFImages((prev) => prev.filter((x) => x !== u))}
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                style={{ background: '#A8211B', color: 'white' }}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Log update
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feed */}
      <section className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading updates...
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              No updates logged yet. Use <strong>New update</strong> above to log the first one.
            </CardContent>
          </Card>
        ) : (
          groupedByDate.map(([date, rows]) => (
            <div key={date} className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                <Calendar className="h-3 w-3" />
                {new Date(date).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>

              {rows.map((u) => (
                <Card key={u.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          {scopeBadge(u)}
                          {u.category && (
                            <Badge variant="outline" className="font-medium">
                              {CATEGORY_LABEL[u.category]}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold leading-tight">{u.updateTitle}</h3>
                        <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2">
                          {u.property?.name && (
                            <span className="inline-flex items-center gap-1">
                              <Building2 className="h-3 w-3" /> {u.property.name}
                            </span>
                          )}
                          {u.tower?.name && (
                            <span className="inline-flex items-center gap-1">
                              <Layers className="h-3 w-3" /> {u.tower.name}
                            </span>
                          )}
                          {u.commonAreaLabel && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {u.commonAreaLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {u.updateDescription}
                    </p>

                    {Array.isArray(u.images) && u.images.length > 0 && (
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 pt-1">
                        {u.images.slice(0, 10).map((url) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="block aspect-square"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt=""
                              className="h-full w-full object-cover rounded-md border hover:opacity-90 transition"
                            />
                          </a>
                        ))}
                      </div>
                    )}

                    {u.creator && (
                      <div className="text-[11px] text-muted-foreground pt-1 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3" />
                        Logged by {[u.creator.firstName, u.creator.lastName].filter(Boolean).join(' ') ||
                          u.creator.email ||
                          'team member'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default function DevelopmentUpdatesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading...
        </div>
      }
    >
      <DevelopmentUpdatesInner />
    </Suspense>
  );
}
