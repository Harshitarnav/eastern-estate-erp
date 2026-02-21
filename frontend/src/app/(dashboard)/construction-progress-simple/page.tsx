'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building2, TrendingUp, Save, Loader2, X, RefreshCw } from 'lucide-react';
import { flatsService } from '@/services/flats.service';
import { propertiesService } from '@/services/properties.service';
import { towersService } from '@/services/towers.service';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

interface Property {
  id: string;
  name: string;
  propertyCode?: string;
}

interface Tower {
  id: string;
  name: string;
  towerNumber?: string;
  propertyId: string;
}

interface Flat {
  id: string;
  flatNumber: string;
  propertyId?: string;
  towerId?: string;
  property?: { id: string; name: string };
  tower?: { id: string; name: string };
  status: string;
}

interface ConstructionProgress {
  id?: string;
  flatId: string;
  phase: string;
  phaseProgress: number;
  overallProgress: number;
  status: string;
  notes?: string;
}

const phases = [
  { value: 'FOUNDATION', label: 'Foundation' },
  { value: 'STRUCTURE', label: 'Structure' },
  { value: 'MEP', label: 'MEP (Mechanical, Electrical, Plumbing)' },
  { value: 'FINISHING', label: 'Finishing' },
  { value: 'HANDOVER', label: 'Handover' },
];

const statuses = [
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ON_HOLD', label: 'On Hold' },
];

function ConstructionProgressSimplePageContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedTower, setSelectedTower] = useState('');
  const [selectedFlat, setSelectedFlat] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [loadingTowers, setLoadingTowers] = useState(false);
  const [loadingFlats, setLoadingFlats] = useState(false);
  const [saving, setSaving] = useState(false);

  // Progress form state
  const [phase, setPhase] = useState('FOUNDATION');
  const [phaseProgress, setPhaseProgress] = useState('0');
  const [overallProgress, setOverallProgress] = useState('0');
  const [status, setStatus] = useState('NOT_STARTED');
  const [notes, setNotes] = useState('');

  // Progress history
  const [progressHistory, setProgressHistory] = useState<ConstructionProgress[]>([]);

  // Load properties on mount
  useEffect(() => {
    loadProperties();
  }, []);

  // Handle URL parameters for pre-selection
  useEffect(() => {
    if (properties.length > 0) {
      const propertyParam = searchParams?.get('property');
      if (propertyParam && properties.some(p => p.id === propertyParam)) {
        setSelectedProperty(propertyParam);
      }
    }
  }, [properties, searchParams]);

  useEffect(() => {
    if (towers.length > 0 && selectedProperty) {
      const towerParam = searchParams?.get('tower');
      if (towerParam && towers.some(t => t.id === towerParam)) {
        setSelectedTower(towerParam);
      }
    }
  }, [towers, selectedProperty, searchParams]);

  useEffect(() => {
    if (flats.length > 0 && selectedTower) {
      const flatParam = searchParams?.get('flat');
      if (flatParam && flats.some(f => f.id === flatParam)) {
        setSelectedFlat(flatParam);
      }
    }
  }, [flats, selectedTower, searchParams]);

  // Load towers when property is selected
  useEffect(() => {
    if (selectedProperty) {
      loadTowers(selectedProperty);
      setSelectedTower('');
      setSelectedFlat('');
      setFlats([]);
    } else {
      setTowers([]);
      setSelectedTower('');
      setSelectedFlat('');
      setFlats([]);
    }
  }, [selectedProperty]);

  // Load flats when tower is selected
  useEffect(() => {
    if (selectedTower) {
      loadFlats(selectedTower);
      setSelectedFlat('');
    } else {
      setFlats([]);
      setSelectedFlat('');
    }
  }, [selectedTower]);

  // Load progress history when flat is selected
  useEffect(() => {
    if (selectedFlat) {
      loadProgressHistory(selectedFlat);
    } else {
      setProgressHistory([]);
    }
  }, [selectedFlat]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await propertiesService.getProperties();
      console.log('Properties loaded:', response);
      
      // Handle both array response and paginated response
      const propertiesData = Array.isArray(response) ? response : (response?.data || []);
      setProperties(propertiesData);
      
      if (propertiesData.length === 0) {
        toast.info('No properties found. Please create a property first.');
      }
    } catch (error: any) {
      toast.error('Failed to load properties');
      console.error('Error loading properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTowers = async (propertyId: string) => {
    try {
      setLoadingTowers(true);
      const towersData = await towersService.getTowersByProperty(propertyId);
      console.log('Towers loaded for property:', propertyId, towersData);
      
      setTowers(Array.isArray(towersData) ? towersData : []);
      
      if (towersData.length === 0) {
        toast.info('No towers found for this property.');
      }
    } catch (error: any) {
      toast.error('Failed to load towers');
      console.error('Error loading towers:', error);
      setTowers([]);
    } finally {
      setLoadingTowers(false);
    }
  };

  const loadFlats = async (towerId: string) => {
    try {
      setLoadingFlats(true);
      const flatsData = await flatsService.getFlatsByTower(towerId);
      console.log('Flats loaded for tower:', towerId, flatsData);
      
      setFlats(Array.isArray(flatsData) ? flatsData : []);
      
      if (flatsData.length === 0) {
        toast.info('No flats found for this tower.');
      }
    } catch (error: any) {
      toast.error('Failed to load flats');
      console.error('Error loading flats:', error);
      setFlats([]);
    } finally {
      setLoadingFlats(false);
    }
  };

  const loadProgressHistory = async (flatId: string) => {
    try {
      const history = await apiService.get(`/construction/flat-progress/flat/${flatId}`);
      console.log('Progress history loaded for flat:', flatId, history);
      setProgressHistory(Array.isArray(history) ? history : []);
    } catch (error) {
      console.error('Failed to load progress history:', error);
      setProgressHistory([]);
    }
  };

  const handleSaveProgress = async () => {
    if (!selectedFlat) {
      toast.error('Please select a flat');
      return;
    }

    if (!phase) {
      toast.error('Please select a phase');
      return;
    }

    try {
      setSaving(true);

      const progressData = {
        flatId: selectedFlat,
        phase,
        phaseProgress: parseFloat(phaseProgress),
        overallProgress: parseFloat(overallProgress),
        status,
        notes: notes || null,
      };

      await apiService.post('/construction/flat-progress', progressData);
      
      toast.success('Construction progress saved successfully');
      
      // Reset form
      setPhase('FOUNDATION');
      setPhaseProgress('0');
      setOverallProgress('0');
      setStatus('NOT_STARTED');
      setNotes('');
      
      // Reload history
      await loadProgressHistory(selectedFlat);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save progress');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500';
      case 'ON_HOLD':
        return 'bg-yellow-500';
      case 'NOT_STARTED':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Construction Progress</h1>
        <p className="text-muted-foreground">
          Log and track construction progress for individual flats
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Log Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Log Progress
            </CardTitle>
            <CardDescription>
              Select a flat and record construction progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Property Selection */}
            <div className="space-y-2">
              <Label>Select Property *</Label>
              <div className="flex gap-2">
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name} {property.propertyCode ? `(${property.propertyCode})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={loadProperties}
                  title="Refresh properties"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              {properties.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground">
                  No properties found. Please create a property first.
                </p>
              )}
            </div>

            {/* Tower Selection */}
            <div className="space-y-2">
              <Label>Select Tower *</Label>
              <Select 
                value={selectedTower} 
                onValueChange={setSelectedTower}
                disabled={!selectedProperty || loadingTowers}
              >
                <SelectTrigger>
                  <SelectValue 
                    placeholder={
                      !selectedProperty 
                        ? "Select a property first" 
                        : loadingTowers 
                        ? "Loading towers..." 
                        : "Choose tower"
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {towers.map((tower) => (
                    <SelectItem key={tower.id} value={tower.id}>
                      {tower.name} {tower.towerNumber ? `(${tower.towerNumber})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProperty && towers.length === 0 && !loadingTowers && (
                <p className="text-sm text-muted-foreground">
                  No towers found for this property.
                </p>
              )}
            </div>

            {/* Flat Selection */}
            <div className="space-y-2">
              <Label>Select Flat *</Label>
              <Select 
                value={selectedFlat} 
                onValueChange={setSelectedFlat}
                disabled={!selectedTower || loadingFlats}
              >
                <SelectTrigger>
                  <SelectValue 
                    placeholder={
                      !selectedTower 
                        ? "Select a tower first" 
                        : loadingFlats 
                        ? "Loading flats..." 
                        : "Choose flat"
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {flats.map((flat) => (
                    <SelectItem key={flat.id} value={flat.id}>
                      {flat.flatNumber} - {flat.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTower && flats.length === 0 && !loadingFlats && (
                <p className="text-sm text-muted-foreground">
                  No flats found for this tower.
                </p>
              )}
            </div>

            {/* Phase Selection */}
            <div className="space-y-2">
              <Label>Construction Phase *</Label>
              <Select value={phase} onValueChange={setPhase}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {phases.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phase Progress */}
            <div className="space-y-2">
              <Label>Phase Progress (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={phaseProgress}
                onChange={(e) => setPhaseProgress(e.target.value)}
                placeholder="0-100"
              />
            </div>

            {/* Overall Progress */}
            <div className="space-y-2">
              <Label>Overall Flat Progress (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={overallProgress}
                onChange={(e) => setOverallProgress(e.target.value)}
                placeholder="0-100"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status *</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes or comments"
              />
            </div>

            {/* Save Button */}
            <Button 
              onClick={handleSaveProgress} 
              disabled={saving || !selectedFlat}
              className="w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Progress
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Right Column - Progress History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progress History
            </CardTitle>
            <CardDescription>
              {selectedFlat
                ? `Showing progress for selected flat`
                : 'Select a flat to view history'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedFlat ? (
              <div className="text-center py-8 text-muted-foreground">
                Select a flat to view progress history
              </div>
            ) : progressHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No progress recorded yet for this flat
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phase</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Overall</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {progressHistory.map((prog, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {phases.find((p) => p.value === prog.phase)?.label || prog.phase}
                        </TableCell>
                        <TableCell>{prog.phaseProgress}%</TableCell>
                        <TableCell>{prog.overallProgress}%</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(prog.status)}>
                            {statuses.find((s) => s.value === prog.status)?.label || prog.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


export default function ConstructionProgressSimplePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <ConstructionProgressSimplePageContent />
    </Suspense>
  );
}

