'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  CheckCircle,
  Clock,
  Send,
  FileText,
  AlertTriangle,
  Loader2,
  Building2,
  Eye,
  TrendingUp,
  Calendar,
  DollarSign,
  Hammer,
  Filter,
} from 'lucide-react';
import { paymentPlansService, FlatPaymentPlan } from '@/services/payment-plans.service';
import { demandDraftsService } from '@/services/demand-drafts.service';
import { constructionMilestonesService } from '@/services/construction-milestones.service';
import { propertiesService } from '@/services/properties.service';
import { apiService } from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { isAdminRole } from '@/lib/roles';

interface ConstructionProgress {
  id: string;
  flatId: string;
  phase: string;
  phaseProgress: number;
  overallProgress: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface MilestoneWithProgress {
  flatPaymentPlanId: string;
  flatId: string;
  flatNumber: string;
  customerName: string;
  property: string;
  propertyId: string;
  tower: string;
  towerId: string;
  milestone: any;
  constructionProgress: ConstructionProgress | null;
  progressPercentage: number;
  phaseMatches: boolean;
}

export default function ConstructionMilestonesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [flatPaymentPlans, setFlatPaymentPlans] = useState<FlatPaymentPlan[]>([]);
  const [demandDrafts, setDemandDrafts] = useState<any[]>([]);
  const [constructionProgressData, setConstructionProgressData] = useState<Record<string, ConstructionProgress[]>>({});
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneWithProgress | null>(null);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);

  // Check if user is admin
  const userRoles = user?.roles?.map((r: any) => typeof r === 'string' ? r : r.name) || [];
  const isAdmin = isAdminRole(userRoles);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, draftsData, propertiesData] = await Promise.all([
        paymentPlansService.getFlatPaymentPlans().catch(() => []),
        demandDraftsService.getDemandDrafts().catch(() => []),
        propertiesService.getProperties().catch(() => ({ data: [] })),
      ]);
      setFlatPaymentPlans(Array.isArray(plansData) ? plansData : []);
      setDemandDrafts(Array.isArray(draftsData) ? draftsData : []);
      setProperties(Array.isArray(propertiesData?.data) ? propertiesData.data : []);

      // Load construction progress for all flats
      const progressMap: Record<string, ConstructionProgress[]> = {};
      for (const plan of (Array.isArray(plansData) ? plansData : [])) {
        if (plan.flat?.id) {
          try {
            const progress = await apiService.get(`/construction/flat-progress/flat/${plan.flat.id}`);
            progressMap[plan.flat.id] = Array.isArray(progress) ? progress : [];
          } catch (error) {
            console.error(`Failed to load progress for flat ${plan.flat.id}:`, error);
            progressMap[plan.flat.id] = [];
          }
        }
      }
      setConstructionProgressData(progressMap);
    } catch (error) {
      toast.error('Failed to load construction milestones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getLatestProgressForPhase = (flatId: string, phase: string): ConstructionProgress | null => {
    const progressList = constructionProgressData[flatId] || [];
    const phaseProgress = progressList.filter(p => p.phase === phase);
    if (phaseProgress.length === 0) return null;
    
    // Return the most recent one
    return phaseProgress.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  };

  const getMilestonesWithProgress = (): MilestoneWithProgress[] => {
    const cards: MilestoneWithProgress[] = [];

    flatPaymentPlans
      .filter((plan) => plan.status === 'ACTIVE')
      .filter((plan) => {
        // Filter by selected property if not 'all'
        if (selectedProperty === 'all') return true;
        return plan.flat?.property?.id === selectedProperty;
      })
      .forEach((plan) => {
        plan.milestones.forEach((milestone) => {
          const flatId = plan.flat?.id || '';
          const phase = milestone.constructionPhase || '';
          const latestProgress = phase ? getLatestProgressForPhase(flatId, phase) : null;
          const progressPercentage = latestProgress?.phaseProgress || 0;
          const phaseMatches = phase === (latestProgress?.phase || '');
          
          cards.push({
            flatPaymentPlanId: plan.id,
            flatId: flatId,
            flatNumber: plan.flat?.flatNumber || 'N/A',
            customerName: plan.customer?.fullName || 'N/A',
            property: plan.flat?.property?.name || 'N/A',
            propertyId: plan.flat?.property?.id || '',
            tower: plan.flat?.tower?.name || 'N/A',
            towerId: plan.flat?.tower?.id || '',
            milestone,
            constructionProgress: latestProgress,
            progressPercentage,
            phaseMatches,
          });
        });
      });

    return cards;
  };

  // Group milestones by property for admin view
  const getMilestonesByProperty = () => {
    const allMilestones = getMilestonesWithProgress();
    const grouped = new Map<string, MilestoneWithProgress[]>();
    
    allMilestones.forEach(milestone => {
      const propertyId = milestone.propertyId;
      if (!grouped.has(propertyId)) {
        grouped.set(propertyId, []);
      }
      grouped.get(propertyId)!.push(milestone);
    });
    
    return grouped;
  };

  const allMilestones = getMilestonesWithProgress();
  
  // Categorize milestones
  const pendingMilestones = allMilestones.filter(m => 
    m.milestone.status === 'PENDING'
  );
  
  // Milestones with construction phase that are ready
  const readyToTrigger = pendingMilestones.filter(m => 
    m.milestone.constructionPhase && m.progressPercentage >= (m.milestone.phasePercentage || 100)
  );
  
  // Milestones with construction phase that are in progress
  const inProgress = pendingMilestones.filter(m => 
    m.milestone.constructionPhase && m.progressPercentage > 0 && m.progressPercentage < (m.milestone.phasePercentage || 100)
  );
  
  // Milestones without construction phase OR with 0 progress
  const notStarted = pendingMilestones.filter(m => 
    !m.milestone.constructionPhase || m.progressPercentage === 0
  );
  
  const triggeredMilestones = allMilestones.filter(m => 
    m.milestone.status === 'TRIGGERED'
  );
  
  const completedMilestones = allMilestones.filter(m => 
    m.milestone.status === 'PAID'
  );

  const pendingReviewDrafts = demandDrafts.filter((d) => d.requiresReview && d.status === 'DRAFT');
  const readyToSendDrafts = demandDrafts.filter((d) => d.status === 'READY');

  const handleApproveDraft = async (draftId: string) => {
    setActionLoading(draftId);
    try {
      await demandDraftsService.approveDemandDraft(draftId);
      toast.success('Demand draft approved successfully');
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve demand draft');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendDraft = async (draftId: string) => {
    setActionLoading(draftId);
    try {
      await demandDraftsService.sendDemandDraft(draftId, `https://example.com/drafts/${draftId}.pdf`);
      toast.success('Demand draft sent successfully');
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send demand draft');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const viewProgressDetails = (milestone: MilestoneWithProgress) => {
    setSelectedMilestone(milestone);
    setProgressDialogOpen(true);
  };

  const navigateToFlat = (flatId: string) => {
    if (flatId) {
      router.push(`/flats/${flatId}`);
    }
  };

  const navigateToProgressLog = (propertyId: string, towerId: string, flatId: string) => {
    router.push(`/construction-progress-simple?property=${propertyId}&tower=${towerId}&flat=${flatId}`);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING': 'bg-yellow-500',
      'TRIGGERED': 'bg-blue-500',
      'PAID': 'bg-green-500',
      'OVERDUE': 'bg-red-500',
      'WAIVED': 'bg-gray-500',
    };
    return <Badge className={colors[status] || 'bg-gray-500'}>{status}</Badge>;
  };

  const getProgressColor = (percentage: number, required: number) => {
    if (percentage >= required) return 'bg-green-500';
    if (percentage >= required * 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-lg">Loading construction milestones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Construction Milestones</h1>
          <p className="text-muted-foreground">
            Track construction progress, trigger payment demands, and monitor milestones
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && properties.length > 0 && (
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger className="w-[250px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button onClick={() => router.push('/construction-progress-simple')}>
            <Hammer className="mr-2 h-4 w-4" />
            Log Progress
          </Button>
        </div>
      </div>

      {/* Property Summary for Admin */}
      {isAdmin && selectedProperty === 'all' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from(getMilestonesByProperty().entries()).map(([propertyId, milestones]) => {
            const property = properties.find(p => p.id === propertyId);
            if (!property) return null;
            
            const pending = milestones.filter(m => m.milestone.status === 'PENDING').length;
            const completed = milestones.filter(m => m.milestone.status === 'PAID').length;
            
            return (
              <Card key={propertyId} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedProperty(propertyId)}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{property.name}</CardTitle>
                  <CardDescription className="text-sm">{property.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-semibold">{milestones.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pending:</span>
                    <span className="font-semibold text-yellow-600">{pending}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completed:</span>
                    <span className="font-semibold text-green-600">{completed}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Milestones</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allMilestones.length}</div>
            <p className="text-xs text-muted-foreground">Across all flats</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Started</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{notStarted.length}</div>
            <p className="text-xs text-muted-foreground">Pending start</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Trigger</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{readyToTrigger.length}</div>
            <p className="text-xs text-muted-foreground">Construction complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{inProgress.length}</div>
            <p className="text-xs text-muted-foreground">Under construction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awaiting Payment</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{triggeredMilestones.length}</div>
            <p className="text-xs text-muted-foreground">Demands sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedMilestones.length}</div>
            <p className="text-xs text-muted-foreground">Paid milestones</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="not-started" className="space-y-4">
        <TabsList>
          <TabsTrigger value="not-started">Not Started ({notStarted.length})</TabsTrigger>
          <TabsTrigger value="ready">Ready to Trigger ({readyToTrigger.length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({inProgress.length})</TabsTrigger>
          <TabsTrigger value="triggered">Awaiting Payment ({triggeredMilestones.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedMilestones.length})</TabsTrigger>
          <TabsTrigger value="drafts">Demand Drafts ({pendingReviewDrafts.length + readyToSendDrafts.length})</TabsTrigger>
        </TabsList>

        {/* Not Started Tab */}
        <TabsContent value="not-started">
          <Card>
            <CardHeader>
              <CardTitle>Not Started Milestones</CardTitle>
              <CardDescription>
                Milestones without construction tracking or pending construction start
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notStarted.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  All milestones have construction tracking
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Tower</TableHead>
                      <TableHead>Flat</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Milestone</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notStarted.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.property}</TableCell>
                        <TableCell>{item.tower}</TableCell>
                        <TableCell>
                          <Button
                            variant="link"
                            onClick={() => navigateToFlat(item.flatId)}
                            className="p-0 h-auto font-normal"
                          >
                            {item.flatNumber}
                          </Button>
                        </TableCell>
                        <TableCell>{item.customerName}</TableCell>
                        <TableCell>
                          <div className="font-medium">{item.milestone.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.milestone.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.milestone.constructionPhase ? (
                            <Badge variant="outline">{item.milestone.constructionPhase}</Badge>
                          ) : (
                            <Badge variant="secondary">No Phase</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{item.milestone.amount?.toLocaleString('en-IN') || 'TBD'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewProgressDetails(item)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigateToProgressLog(item.propertyId, item.towerId, item.flatId)}
                            >
                              <Hammer className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ready to Trigger Tab */}
        <TabsContent value="ready">
          <Card>
            <CardHeader>
              <CardTitle>Ready to Trigger Payment Demands</CardTitle>
              <CardDescription>
                These milestones have reached the required construction progress and are ready for payment demand
              </CardDescription>
            </CardHeader>
            <CardContent>
              {readyToTrigger.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No milestones ready to trigger at this time
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Tower</TableHead>
                      <TableHead>Flat</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Milestone</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {readyToTrigger.map((item, index) => (
                      <TableRow key={index} className="bg-green-50">
                        <TableCell>{item.property}</TableCell>
                        <TableCell>{item.tower}</TableCell>
                        <TableCell>
                          <Button
                            variant="link"
                            onClick={() => navigateToFlat(item.flatId)}
                            className="p-0 h-auto font-normal"
                          >
                            {item.flatNumber}
                          </Button>
                        </TableCell>
                        <TableCell>{item.customerName}</TableCell>
                        <TableCell>
                          <div className="font-medium">{item.milestone.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.milestone.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.milestone.constructionPhase}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getProgressColor(item.progressPercentage, item.milestone.phasePercentage)}`}
                                style={{ width: `${Math.min(item.progressPercentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-green-600">
                              {item.progressPercentage}%
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Required: {item.milestone.phasePercentage}%
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{item.milestone.amount?.toLocaleString('en-IN') || 'TBD'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewProgressDetails(item)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigateToProgressLog(item.propertyId, item.towerId, item.flatId)}
                            >
                              <Hammer className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* In Progress Tab */}
        <TabsContent value="in-progress">
          <Card>
            <CardHeader>
              <CardTitle>Milestones In Progress</CardTitle>
              <CardDescription>
                Construction is underway for these milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inProgress.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No milestones currently in progress
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Tower</TableHead>
                      <TableHead>Flat</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Milestone</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inProgress.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.property}</TableCell>
                        <TableCell>{item.tower}</TableCell>
                        <TableCell>
                          <Button
                            variant="link"
                            onClick={() => navigateToFlat(item.flatId)}
                            className="p-0 h-auto font-normal"
                          >
                            {item.flatNumber}
                          </Button>
                        </TableCell>
                        <TableCell>{item.customerName}</TableCell>
                        <TableCell>
                          <div className="font-medium">{item.milestone.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.milestone.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.milestone.constructionPhase}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getProgressColor(item.progressPercentage, item.milestone.phasePercentage)}`}
                                style={{ width: `${item.progressPercentage}%` }}
                              />
                            </div>
                            <span className="text-sm">
                              {item.progressPercentage}%
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Target: {item.milestone.phasePercentage}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewProgressDetails(item)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigateToProgressLog(item.propertyId, item.towerId, item.flatId)}
                            >
                              <Hammer className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Triggered/Awaiting Payment Tab */}
        <TabsContent value="triggered">
          <Card>
            <CardHeader>
              <CardTitle>Awaiting Payment</CardTitle>
              <CardDescription>
                Demand drafts sent, waiting for payment confirmation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {triggeredMilestones.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No milestones awaiting payment
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Tower</TableHead>
                      <TableHead>Flat</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Milestone</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {triggeredMilestones.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.property}</TableCell>
                        <TableCell>{item.tower}</TableCell>
                        <TableCell>
                          <Button
                            variant="link"
                            onClick={() => navigateToFlat(item.flatId)}
                            className="p-0 h-auto font-normal"
                          >
                            {item.flatNumber}
                          </Button>
                        </TableCell>
                        <TableCell>{item.customerName}</TableCell>
                        <TableCell>{item.milestone.name}</TableCell>
                        <TableCell className="font-medium">
                          ₹{item.milestone.amount?.toLocaleString('en-IN') || 'TBD'}
                        </TableCell>
                        <TableCell>
                          {item.milestone.dueDate
                            ? new Date(item.milestone.dueDate).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>{getStatusBadge(item.milestone.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigateToFlat(item.flatId)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Milestones</CardTitle>
              <CardDescription>
                Successfully paid milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completedMilestones.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No completed milestones yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Tower</TableHead>
                      <TableHead>Flat</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Milestone</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedMilestones.map((item, index) => (
                      <TableRow key={index} className="bg-green-50">
                        <TableCell>{item.property}</TableCell>
                        <TableCell>{item.tower}</TableCell>
                        <TableCell>
                          <Button
                            variant="link"
                            onClick={() => navigateToFlat(item.flatId)}
                            className="p-0 h-auto font-normal"
                          >
                            {item.flatNumber}
                          </Button>
                        </TableCell>
                        <TableCell>{item.customerName}</TableCell>
                        <TableCell>{item.milestone.name}</TableCell>
                        <TableCell className="font-medium">
                          ₹{item.milestone.amount?.toLocaleString('en-IN') || 'TBD'}
                        </TableCell>
                        <TableCell>{getStatusBadge(item.milestone.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigateToFlat(item.flatId)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demand Drafts Tab */}
        <TabsContent value="drafts">
          <div className="space-y-4">
            {/* Pending Review Drafts */}
            {pendingReviewDrafts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Demand Drafts Pending Review</CardTitle>
                  <CardDescription>
                    Review and approve auto-generated demand drafts before sending
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Draft ID</TableHead>
                        <TableHead>Flat</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Milestone</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Generated At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingReviewDrafts.map((draft) => (
                        <TableRow key={draft.id}>
                          <TableCell className="font-mono text-xs">{draft.id.substring(0, 8)}</TableCell>
                          <TableCell>{draft.flatId}</TableCell>
                          <TableCell>{draft.customerId}</TableCell>
                          <TableCell>{draft.milestoneId}</TableCell>
                          <TableCell className="font-medium">₹{draft.amount?.toLocaleString('en-IN')}</TableCell>
                          <TableCell>
                            {draft.generatedAt
                              ? new Date(draft.generatedAt).toLocaleString()
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/demand-drafts/${draft.id}`, '_blank')}
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                Preview
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleApproveDraft(draft.id)}
                                disabled={actionLoading === draft.id}
                              >
                                {actionLoading === draft.id ? (
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                )}
                                Approve
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Ready to Send Drafts */}
            {readyToSendDrafts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Ready to Send</CardTitle>
                  <CardDescription>
                    Approved demand drafts ready to be sent to customers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Draft ID</TableHead>
                        <TableHead>Flat</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Milestone</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Reviewed At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {readyToSendDrafts.map((draft) => (
                        <TableRow key={draft.id}>
                          <TableCell className="font-mono text-xs">{draft.id.substring(0, 8)}</TableCell>
                          <TableCell>{draft.flatId}</TableCell>
                          <TableCell>{draft.customerId}</TableCell>
                          <TableCell>{draft.milestoneId}</TableCell>
                          <TableCell className="font-medium">₹{draft.amount?.toLocaleString('en-IN')}</TableCell>
                          <TableCell>
                            {draft.reviewedAt
                              ? new Date(draft.reviewedAt).toLocaleString()
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => handleSendDraft(draft.id)}
                              disabled={actionLoading === draft.id}
                            >
                              {actionLoading === draft.id ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Send className="h-3 w-3 mr-1" />
                              )}
                              Send Now
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {pendingReviewDrafts.length === 0 && readyToSendDrafts.length === 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>All caught up!</AlertTitle>
                <AlertDescription>
                  There are no pending demand drafts requiring attention at this time.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Progress Details Dialog */}
      <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Construction Progress Details</DialogTitle>
            <DialogDescription>
              Detailed progress information for this milestone
            </DialogDescription>
          </DialogHeader>
          {selectedMilestone && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Property</Label>
                  <div className="font-medium">{selectedMilestone.property}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Tower</Label>
                  <div className="font-medium">{selectedMilestone.tower}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Flat</Label>
                  <div className="font-medium">{selectedMilestone.flatNumber}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Customer</Label>
                  <div className="font-medium">{selectedMilestone.customerName}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Milestone</h4>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm text-muted-foreground">Name</Label>
                    <div className="font-medium">{selectedMilestone.milestone.name}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Description</Label>
                    <div>{selectedMilestone.milestone.description}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Construction Phase</Label>
                      <div>
                        <Badge variant="outline">{selectedMilestone.milestone.constructionPhase}</Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Required Progress</Label>
                      <div className="font-medium">{selectedMilestone.milestone.phasePercentage}%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Current Progress</h4>
                {selectedMilestone.constructionProgress ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Phase Progress</Label>
                        <div className="font-medium text-lg">{selectedMilestone.progressPercentage}%</div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Overall Progress</Label>
                        <div className="font-medium text-lg">
                          {selectedMilestone.constructionProgress.overallProgress}%
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Status</Label>
                      <div>
                        <Badge>{selectedMilestone.constructionProgress.status}</Badge>
                      </div>
                    </div>
                    {selectedMilestone.constructionProgress.notes && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Notes</Label>
                        <div className="text-sm">{selectedMilestone.constructionProgress.notes}</div>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm text-muted-foreground">Last Updated</Label>
                      <div className="text-sm">
                        {new Date(selectedMilestone.constructionProgress.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>No Progress Logged</AlertTitle>
                    <AlertDescription>
                      No construction progress has been logged for this phase yet.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => navigateToFlat(selectedMilestone.flatId)}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  View Flat Details
                </Button>
                <Button
                  onClick={() => {
                    navigateToProgressLog(
                      selectedMilestone.propertyId,
                      selectedMilestone.towerId,
                      selectedMilestone.flatId
                    );
                    setProgressDialogOpen(false);
                  }}
                >
                  <Hammer className="mr-2 h-4 w-4" />
                  Log Progress
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
