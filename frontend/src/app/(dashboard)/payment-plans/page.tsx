'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, FileText, Edit, Trash2, RefreshCw, X } from 'lucide-react';
import { paymentPlansService, PaymentPlanTemplate, FlatPaymentPlan, PaymentMilestoneDto } from '@/services/payment-plans.service';
import { flatsService } from '@/services/flats.service';
import { propertiesService } from '@/services/properties.service';
import { towersService } from '@/services/towers.service';
import { bookingsService } from '@/services/bookings.service';
import { customersService } from '@/services/customers.service';
import { toast } from 'sonner';

// Use PaymentMilestoneDto from service instead of local interface
type Milestone = PaymentMilestoneDto;

export default function PaymentPlansPage() {
  const [templates, setTemplates] = useState<PaymentPlanTemplate[]>([]);
  const [flatPaymentPlans, setFlatPaymentPlans] = useState<FlatPaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'templates' | 'flat-plans'>('templates');

  // Template Dialog State
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PaymentPlanTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateType, setTemplateType] = useState<'CONSTRUCTION_LINKED' | 'TIME_LINKED' | 'DOWN_PAYMENT'>('CONSTRUCTION_LINKED');
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  // Flat Payment Plan Dialog State
  const [createPlanDialogOpen, setCreatePlanDialogOpen] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [towers, setTowers] = useState<any[]>([]);
  const [flats, setFlats] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedTower, setSelectedTower] = useState('');
  const [selectedFlat, setSelectedFlat] = useState('');
  const [selectedBooking, setSelectedBooking] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  
  const [loadingTowers, setLoadingTowers] = useState(false);
  const [loadingFlats, setLoadingFlats] = useState(false);

  const constructionPhases = ['FOUNDATION', 'STRUCTURE', 'MEP', 'FINISHING', 'HANDOVER'];

  useEffect(() => {
    loadData();
  }, []);

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

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesData, plansData, propertiesData, bookingsData, customersData] = await Promise.all([
        paymentPlansService.getPaymentPlanTemplates().catch(() => []),
        paymentPlansService.getFlatPaymentPlans().catch(() => []),
        propertiesService.getProperties().catch(() => []),
        bookingsService.getBookings().catch(() => []),
        customersService.getCustomers().catch(() => []),
      ]);
      setTemplates(Array.isArray(templatesData) ? templatesData : []);
      setFlatPaymentPlans(Array.isArray(plansData) ? plansData : []);
      
      // Handle paginated response
      const propertiesArray = Array.isArray(propertiesData) ? propertiesData : (propertiesData?.data || []);
      setProperties(propertiesArray);
      
      const bookingsArray = Array.isArray(bookingsData) ? bookingsData : (bookingsData?.data || []);
      setBookings(bookingsArray);
      
      const customersArray = Array.isArray(customersData) ? customersData : (customersData?.data || []);
      setCustomers(customersArray);
    } catch (error) {
      toast.error('Failed to load payment plans data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadTowers = async (propertyId: string) => {
    try {
      setLoadingTowers(true);
      const towersData = await towersService.getTowersByProperty(propertyId);
      setTowers(Array.isArray(towersData) ? towersData : []);
    } catch (error) {
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
      setFlats(Array.isArray(flatsData) ? flatsData : []);
    } catch (error) {
      console.error('Error loading flats:', error);
      setFlats([]);
    } finally {
      setLoadingFlats(false);
    }
  };

  const openCreateTemplateDialog = () => {
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateDescription('');
    setTemplateType('CONSTRUCTION_LINKED');
    setMilestones([
      {
        sequence: 1,
        name: 'Booking Amount',
        description: 'Initial booking payment',
        paymentPercentage: 10,
        constructionPhase: null,
        phasePercentage: null,
      },
    ]);
    setTemplateDialogOpen(true);
  };

  const openEditTemplateDialog = (template: PaymentPlanTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateDescription(template.description || '');
    setTemplateType(template.type);
    setMilestones(template.milestones);
    setTemplateDialogOpen(true);
  };

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        sequence: milestones.length + 1,
        name: '',
        description: '',
        paymentPercentage: 0,
        constructionPhase: null,
        phasePercentage: null,
      },
    ]);
  };

  const updateMilestone = (index: number, field: string, value: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const removeMilestone = (index: number) => {
    const updated = milestones.filter((_, i) => i !== index);
    // Re-sequence
    updated.forEach((m, i) => {
      m.sequence = i + 1;
    });
    setMilestones(updated);
  };

  const handleSaveTemplate = async () => {
    if (!templateName || milestones.length === 0) {
      toast.error('Please provide template name and at least one milestone');
      return;
    }

    const totalPercentage = milestones.reduce((sum, m) => sum + m.paymentPercentage, 0);
    if (totalPercentage !== 100) {
      toast.error(`Total payment percentage must be 100% (currently ${totalPercentage}%)`);
      return;
    }

    try {
      const templateData = {
        name: templateName,
        description: templateDescription,
        type: templateType,
        milestones: milestones,
        isActive: true,
        isDefault: false,
      };

      if (editingTemplate) {
        await paymentPlansService.updatePaymentPlanTemplate(editingTemplate.id, templateData);
        toast.success('Payment plan template updated successfully');
      } else {
        await paymentPlansService.createPaymentPlanTemplate(templateData);
        toast.success('Payment plan template created successfully');
      }

      setTemplateDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save template');
      console.error(error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await paymentPlansService.deletePaymentPlanTemplate(templateId);
      toast.success('Template deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete template');
      console.error(error);
    }
  };

  const handleCreateFlatPaymentPlan = async () => {
    if (!selectedFlat || !selectedBooking || !selectedCustomer || !selectedTemplate || !totalAmount) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await paymentPlansService.createFlatPaymentPlan({
        flatId: selectedFlat,
        bookingId: selectedBooking,
        customerId: selectedCustomer,
        paymentPlanTemplateId: selectedTemplate,
        totalAmount: parseFloat(totalAmount),
      });
      toast.success('Flat payment plan created successfully');
      setCreatePlanDialogOpen(false);
      resetCreatePlanForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create flat payment plan');
      console.error(error);
    }
  };

  const resetCreatePlanForm = () => {
    setSelectedProperty('');
    setSelectedTower('');
    setSelectedFlat('');
    setSelectedBooking('');
    setSelectedCustomer('');
    setSelectedTemplate('');
    setTotalAmount('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500';
      case 'COMPLETED':
        return 'bg-blue-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading payment plans...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Plans</h1>
          <p className="text-muted-foreground">
            Manage payment plan templates and flat payment schedules
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'templates' && (
            <Button onClick={openCreateTemplateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          )}
          {activeTab === 'flat-plans' && (
            <Dialog open={createPlanDialogOpen} onOpenChange={setCreatePlanDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Link Flat to Payment Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Link Flat to Payment Plan</DialogTitle>
                  <DialogDescription>
                    Assign a payment plan to a flat based on a template
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Property Selection */}
                  <div className="grid gap-2">
                    <Label>Property *</Label>
                    <div className="flex gap-2">
                      <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent>
                          {properties.map((property) => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={loadData}
                        title="Refresh"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Tower Selection */}
                  <div className="grid gap-2">
                    <Label>Tower *</Label>
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
                              : "Select tower"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {towers.map((tower) => (
                          <SelectItem key={tower.id} value={tower.id}>
                            {tower.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Flat Selection */}
                  <div className="grid gap-2">
                    <Label>Flat *</Label>
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
                              : "Select flat"
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
                  </div>

                  {/* Booking Selection */}
                  <div className="grid gap-2">
                    <Label>Booking *</Label>
                    <Select value={selectedBooking} onValueChange={setSelectedBooking}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select booking" />
                      </SelectTrigger>
                      <SelectContent>
                        {bookings.map((booking) => (
                          <SelectItem key={booking.id} value={booking.id}>
                            {booking.bookingNumber} - {booking.customer?.fullName || 'N/A'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Customer Selection */}
                  <div className="grid gap-2">
                    <Label>Customer *</Label>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.fullName} ({customer.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Template Selection */}
                  <div className="grid gap-2">
                    <Label>Payment Plan Template *</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.filter(t => t.isActive).map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} {template.isDefault && '(Default)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Total Amount */}
                  <div className="grid gap-2">
                    <Label>Total Amount (₹) *</Label>
                    <Input
                      type="number"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      placeholder="Enter total amount"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCreatePlanDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFlatPaymentPlan}>
                    Create Payment Plan
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Template Create/Edit Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Payment Plan Template' : 'Create Payment Plan Template'}
            </DialogTitle>
            <DialogDescription>
              Define milestones and payment percentages for this plan
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Template Name *</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Construction Linked Plan"
              />
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Brief description of this payment plan"
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label>Plan Type *</Label>
              <Select 
                value={templateType} 
                onValueChange={(value) => setTemplateType(value as 'CONSTRUCTION_LINKED' | 'TIME_LINKED' | 'DOWN_PAYMENT')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONSTRUCTION_LINKED">Construction Linked</SelectItem>
                  <SelectItem value="TIME_LINKED">Time Linked</SelectItem>
                  <SelectItem value="DOWN_PAYMENT">Down Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Milestones</h4>
                <Button size="sm" onClick={addMilestone}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Milestone
                </Button>
              </div>

              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="grid gap-4">
                        <div className="flex justify-between items-center">
                          <h5 className="font-medium">Milestone {milestone.sequence}</h5>
                          {milestones.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMilestone(index)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label>Milestone Name *</Label>
                            <Input
                              value={milestone.name}
                              onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                              placeholder="e.g., Foundation Complete"
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label>Payment % *</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={milestone.paymentPercentage}
                              onChange={(e) =>
                                updateMilestone(index, 'paymentPercentage', parseFloat(e.target.value) || 0)
                              }
                            />
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label>Description</Label>
                          <Input
                            value={milestone.description}
                            onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                            placeholder="Brief description"
                          />
                        </div>

                        {templateType === 'CONSTRUCTION_LINKED' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label>Construction Phase</Label>
                              <Select
                                value={milestone.constructionPhase || ''}
                                onValueChange={(value) => updateMilestone(index, 'constructionPhase', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select phase" />
                                </SelectTrigger>
                                <SelectContent>
                                  {constructionPhases.map((phase) => (
                                    <SelectItem key={phase} value={phase}>
                                      {phase}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="grid gap-2">
                              <Label>Phase Progress % (Trigger)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={milestone.phasePercentage || 0}
                                onChange={(e) =>
                                  updateMilestone(index, 'phasePercentage', parseFloat(e.target.value) || 0)
                                }
                                placeholder="e.g., 100"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-4 p-3 bg-muted rounded">
                <p className="text-sm font-medium">
                  Total Payment Percentage:{' '}
                  <span className={milestones.reduce((sum, m) => sum + m.paymentPercentage, 0) === 100 ? 'text-green-600' : 'text-red-600'}>
                    {milestones.reduce((sum, m) => sum + m.paymentPercentage, 0)}%
                  </span>
                  {' '}(Must be 100%)
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          className={`pb-2 px-4 ${
            activeTab === 'templates'
              ? 'border-b-2 border-primary font-semibold'
              : 'text-muted-foreground'
          }`}
          onClick={() => setActiveTab('templates')}
        >
          Payment Plan Templates ({templates.length})
        </button>
        <button
          className={`pb-2 px-4 ${
            activeTab === 'flat-plans'
              ? 'border-b-2 border-primary font-semibold'
              : 'text-muted-foreground'
          }`}
          onClick={() => setActiveTab('flat-plans')}
        >
          Flat Payment Plans ({flatPaymentPlans.length})
        </button>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid gap-4">
          {templates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Templates Yet</h3>
                <p className="text-muted-foreground mb-4">Create your first payment plan template</p>
                <Button onClick={openCreateTemplateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {template.name}
                        {template.isDefault && (
                          <Badge variant="default">Default</Badge>
                        )}
                        {!template.isActive && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{template.type}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditTemplateDialog(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Milestones:</h4>
                    <div className="grid gap-2">
                      {template.milestones.map((milestone) => (
                        <div
                          key={milestone.sequence}
                          className="flex items-center justify-between p-3 border rounded"
                        >
                          <div>
                            <div className="font-medium">
                              {milestone.sequence}. {milestone.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {milestone.description}
                            </div>
                            {milestone.constructionPhase && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Phase: {milestone.constructionPhase} ({milestone.phasePercentage}%)
                              </div>
                            )}
                          </div>
                          <Badge variant="secondary">
                            {milestone.paymentPercentage}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Flat Plans Tab */}
      {activeTab === 'flat-plans' && (
        <Card>
          <CardHeader>
            <CardTitle>Active Flat Payment Plans</CardTitle>
            <CardDescription>
              Track payment milestones for individual flats
            </CardDescription>
          </CardHeader>
          <CardContent>
            {flatPaymentPlans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Flat Payment Plans</h3>
                <p className="text-muted-foreground mb-4">Link a flat to a payment plan to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Tower</TableHead>
                    <TableHead>Flat</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Paid Amount</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flatPaymentPlans.map((plan) => {
                    const completedCount = plan.milestones.filter(
                      (m) => m.status === 'PAID'
                    ).length;
                    const progress = (completedCount / plan.milestones.length) * 100;

                    return (
                      <TableRow key={plan.id}>
                        <TableCell>
                          {plan.flat?.property?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {plan.flat?.tower?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {plan.flat?.flatNumber || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {plan.customer?.fullName || 'N/A'}
                        </TableCell>
                        <TableCell>
                          ₹{plan.totalAmount.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell>
                          ₹{plan.paidAmount.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell>
                          ₹{plan.balanceAmount.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {completedCount}/{plan.milestones.length}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(plan.status)}>
                            {plan.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              window.location.href = `/payment-plans/${plan.id}`;
                            }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
