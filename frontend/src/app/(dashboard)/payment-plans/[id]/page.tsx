'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  ArrowLeft,
  Building2,
  User,
  FileText,
  CheckCircle,
  Clock,
  Loader2,
  Eye,
} from 'lucide-react';
import { paymentPlansService, FlatPaymentPlan } from '@/services/payment-plans.service';
import { toast } from 'sonner';

export default function PaymentPlanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const planId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  const [plan, setPlan] = useState<FlatPaymentPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (planId) {
      loadPlan();
    }
  }, [planId]);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const data = await paymentPlansService.getFlatPaymentPlan(planId);
      setPlan(data);
    } catch (error: any) {
      toast.error('Failed to load payment plan');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500';
      case 'COMPLETED':
        return 'bg-blue-500';
      case 'CANCELLED':
        return 'bg-red-500';
      case 'PENDING':
        return 'bg-yellow-500';
      case 'PAID':
        return 'bg-green-600';
      case 'TRIGGERED':
        return 'bg-blue-600';
      case 'OVERDUE':
        return 'bg-red-600';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-lg">Loading payment plan...</span>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Payment Plan Not Found</h2>
        <Button onClick={() => router.push('/payment-plans')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payment Plans
        </Button>
      </div>
    );
  }

  const completedMilestones = plan.milestones.filter(m => m.status === 'PAID').length;
  const progressPercentage = (completedMilestones / plan.milestones.length) * 100;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/payment-plans')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment Plan Details</h1>
            <p className="text-muted-foreground">
              {plan.flat?.property?.name} - {plan.flat?.tower?.name} - {plan.flat?.flatNumber}
            </p>
          </div>
        </div>
        <Badge className={getStatusColor(plan.status)} variant="default">
          {plan.status}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{plan.totalAmount.toLocaleString('en-IN')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{plan.paidAmount.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">
              {completedMilestones} of {plan.milestones.length} milestones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Amount</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ₹{plan.balanceAmount.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">
              {plan.milestones.length - completedMilestones} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(progressPercentage)}%</div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-green-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property & Customer Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Property</div>
              <div className="font-medium">{plan.flat?.property?.name || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tower</div>
              <div className="font-medium">{plan.flat?.tower?.name || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Flat Number</div>
              <div className="font-medium">{plan.flat?.flatNumber || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Booking Number</div>
              <div className="font-medium">{plan.booking?.bookingNumber || 'N/A'}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/flats/${plan.flatId}`)}
              className="mt-2"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Flat Details
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="font-medium">{plan.customer?.fullName || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium">{plan.customer?.email || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Phone</div>
              <div className="font-medium">{plan.customer?.phoneNumber || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Payment Plan Template</div>
              <div className="font-medium">{plan.paymentPlanTemplate?.name || 'N/A'}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/customers/${plan.customerId}`)}
              className="mt-2"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Customer Details
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Milestones</CardTitle>
          <CardDescription>
            Track construction-linked payment milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Milestone</TableHead>
                <TableHead>Construction Phase</TableHead>
                <TableHead>Required Progress</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completed At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plan.milestones
                .sort((a, b) => a.sequence - b.sequence)
                .map((milestone) => (
                  <TableRow key={milestone.sequence}>
                    <TableCell className="font-medium">{milestone.sequence}</TableCell>
                    <TableCell>
                      <div className="font-medium">{milestone.name}</div>
                      {milestone.description && (
                        <div className="text-sm text-muted-foreground">
                          {milestone.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {milestone.constructionPhase ? (
                        <Badge variant="outline">{milestone.constructionPhase}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {milestone.phasePercentage ? (
                        <span className="font-medium">{milestone.phasePercentage}%</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{milestone.amount.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      {milestone.dueDate
                        ? new Date(milestone.dueDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(milestone.status)}>
                        {milestone.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {milestone.completedAt
                        ? new Date(milestone.completedAt).toLocaleString()
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Related Links */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => router.push('/construction-milestones')}
        >
          View Construction Milestones
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push('/construction-progress-simple')}
        >
          Log Construction Progress
        </Button>
      </div>
    </div>
  );
}
