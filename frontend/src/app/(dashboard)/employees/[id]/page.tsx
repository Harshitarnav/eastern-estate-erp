'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  User,
  FileText,
  Award,
  TrendingUp,
  Shield,
  Heart,
  CreditCard,
  AlertCircle,
  Star,
  BookOpen,
  MessageSquare,
  Home,
  Hash,
  Pencil,
  Check,
  X as XIcon,
  StickyNote,
  Trash2,
} from 'lucide-react';
import { employeesService, Employee } from '@/services/employees.service';
import { rolesService } from '@/services/roles.service';
import DocumentsPanel from '@/components/documents/DocumentsPanel';
import { DocumentEntityType } from '@/services/documents.service';
import { api } from '@/services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return '#10B981';
    case 'ON_LEAVE': return '#F59E0B';
    case 'SUSPENDED': return '#EF4444';
    case 'TERMINATED': return '#DC2626';
    case 'RESIGNED': return '#6B7280';
    default: return '#6B7280';
  }
};

const getDepartmentColor = (department: string) => {
  const colors: Record<string, string> = {
    MANAGEMENT: '#9333EA',
    SALES: '#10B981',
    MARKETING: '#F59E0B',
    OPERATIONS: '#3B82F6',
    FINANCE: '#EF4444',
    HR: '#8B5CF6',
    IT: '#06B6D4',
    CONSTRUCTION: '#F97316',
    CUSTOMER_SERVICE: '#14B8A6',
    LEGAL: '#64748B',
  };
  return colors[department] || '#6B7280';
};

const fmt = (status: string) => status?.replace(/_/g, ' ') ?? '—';

const fmtCurrency = (value: number | string | null | undefined) => {
  const amount = Number(value) || 0;
  return `₹${amount.toLocaleString('en-IN')}`;
};

const fmtDate = (value: string | Date | null | undefined) => {
  if (!value) return null;
  try { return new Date(value).toLocaleDateString('en-IN'); } catch { return null; }
};

// ─── Small reusable field row ──────────────────────────────────────────────────
function InfoRow({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-gray-400">{icon}</span>}
        <p className="font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

// ─── Section card ──────────────────────────────────────────────────────────────
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4" style={{ color: '#7B1E12' }}>{title}</h2>
      {children}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Feedback {
  id: string;
  feedbackType: string;
  feedbackTitle: string;
  feedbackDate: string;
  feedbackStatus: string;
  providerName?: string;
  overallRating?: number;
  positiveAspects?: string;
  areasForImprovement?: string;
  generalComments?: string;
  isAnonymous?: boolean;
}

interface Review {
  id: string;
  reviewType: string;
  reviewTitle: string;
  reviewDate: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  reviewStatus: string;
  reviewerName?: string;
  overallRating: number;
  achievements?: string;
  strengths?: string;
  areasOfImprovement?: string;
  goals?: string;
  recommendedForPromotion?: boolean;
  recommendedForIncrement?: boolean;
  recommendedIncrementPercentage?: number;
  reviewerComments?: string;
  employeeComments?: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleName, setRoleName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'profile' | 'feedback' | 'reviews'>('profile');

  // Inline-edit state for Notes
  const [editingNote, setEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Inline-edit state for Performance Rating
  const [hoverRating, setHoverRating] = useState(0);
  const [savingRating, setSavingRating] = useState(false);

  // Feedback & Review state
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [savingReview, setSavingReview] = useState(false);

  const [feedbackForm, setFeedbackForm] = useState({
    feedbackType: 'MANAGER_TO_EMPLOYEE',
    feedbackTitle: '',
    feedbackDate: new Date().toISOString().split('T')[0],
    providerName: '',
    overallRating: 3,
    positiveAspects: '',
    areasForImprovement: '',
    generalComments: '',
    isAnonymous: false,
  });

  const [reviewForm, setReviewForm] = useState({
    reviewType: 'MONTHLY',
    reviewTitle: '',
    reviewDate: new Date().toISOString().split('T')[0],
    reviewPeriodStart: '',
    reviewPeriodEnd: '',
    reviewerName: '',
    overallRating: 3,
    achievements: '',
    strengths: '',
    areasOfImprovement: '',
    goals: '',
    recommendedForPromotion: false,
    recommendedForIncrement: false,
    recommendedIncrementPercentage: 0,
    reviewerComments: '',
  });

  useEffect(() => {
    if (employeeId) fetchEmployee();
  }, [employeeId]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const data = await employeesService.getEmployee(employeeId);
      setEmployee(data);
      setNoteValue(data.notes || '');

      const resolvedRoleId = (data as any)?.roleId || (data as any)?.role?.id;
      if (resolvedRoleId) {
        try {
          const role = await rolesService.getRole(resolvedRoleId);
          setRoleName(role.name);
        } catch { /* role fetch non-critical */ }
      }
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch employee');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const data = await api.get(`/employees/${employeeId}/feedback`) as Feedback[];
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch { setFeedbacks([]); }
    finally { setFeedbackLoading(false); }
  };

  const fetchReviews = async () => {
    setReviewLoading(true);
    try {
      const data = await api.get(`/employees/${employeeId}/reviews`) as Review[];
      setReviews(Array.isArray(data) ? data : []);
    } catch { setReviews([]); }
    finally { setReviewLoading(false); }
  };

  // Load feedback/reviews when switching to those tabs
  const handleTabChange = (tab: 'profile' | 'feedback' | 'reviews') => {
    setActiveTab(tab);
    if (tab === 'feedback' && feedbacks.length === 0) fetchFeedback();
    if (tab === 'reviews' && reviews.length === 0) fetchReviews();
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackForm.feedbackTitle.trim()) return;
    setSavingFeedback(true);
    try {
      await api.post(`/employees/${employeeId}/feedback`, feedbackForm);
      setShowFeedbackForm(false);
      setFeedbackForm(f => ({ ...f, feedbackTitle: '', positiveAspects: '', areasForImprovement: '', generalComments: '' }));
      fetchFeedback();
    } catch { /* silent */ }
    finally { setSavingFeedback(false); }
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.reviewTitle.trim() || !reviewForm.reviewPeriodStart || !reviewForm.reviewPeriodEnd) return;
    setSavingReview(true);
    try {
      await api.post(`/employees/${employeeId}/reviews`, reviewForm);
      setShowReviewForm(false);
      setReviewForm(f => ({ ...f, reviewTitle: '', achievements: '', strengths: '', areasOfImprovement: '', goals: '', reviewerComments: '' }));
      fetchReviews();
    } catch { /* silent */ }
    finally { setSavingReview(false); }
  };

  const handleDeleteEmployee = async () => {
    if (!confirm(`Permanently delete ${employee?.fullName}? This cannot be undone.`)) return;
    try {
      await api.delete(`/employees/${employeeId}`);
      router.push('/employees');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    await api.delete(`/employees/${employeeId}/feedback/${feedbackId}`);
    setFeedbacks(feedbacks.filter(f => f.id !== feedbackId));
  };

  const handleDeleteReview = async (reviewId: string) => {
    await api.delete(`/employees/${employeeId}/reviews/${reviewId}`);
    setReviews(reviews.filter(r => r.id !== reviewId));
  };

  const handleSaveNote = async () => {
    if (!employee) return;
    setSavingNote(true);
    try {
      await api.patch(`/employees/${employeeId}`, { notes: noteValue });
      setEmployee({ ...employee, notes: noteValue });
      setEditingNote(false);
    } catch { /* silent — user can retry */ }
    finally { setSavingNote(false); }
  };

  const handleRatingClick = async (rating: number) => {
    if (!employee || savingRating) return;
    setSavingRating(true);
    try {
      await api.patch(`/employees/${employeeId}`, { performanceRating: rating });
      setEmployee({ ...employee, performanceRating: rating });
    } catch { /* silent */ }
    finally { setSavingRating(false); }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-36 mb-6" />
        <div className="flex items-start justify-between gap-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="h-24 w-24 rounded-full bg-gray-300 flex-shrink-0" />
            <div className="space-y-2 pt-2">
              <div className="h-7 bg-gray-300 rounded w-48" />
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="flex gap-2 mt-1">
                <div className="h-6 w-20 bg-gray-200 rounded-full" />
                <div className="h-6 w-24 bg-gray-200 rounded-full" />
              </div>
            </div>
          </div>
          <div className="h-10 w-36 bg-gray-200 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-lg shadow-md p-6 space-y-4">
                <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i}>
                      <div className="h-3 bg-gray-100 rounded w-1/2 mb-1" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white rounded-lg shadow-md p-6 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-lg" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error || 'Employee not found'}
        </div>
        <button
          onClick={() => router.push('/employees')}
          className="mt-4 px-4 py-2 border rounded-lg"
          style={{ borderColor: '#A8211B', color: '#A8211B' }}
        >
          Back to Employees
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* ── Header ── */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/employees')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Employees</span>
        </button>

        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-6">
            {employee.profilePicture ? (
              <img
                src={employee.profilePicture}
                alt={employee.fullName}
                className="h-24 w-24 rounded-full object-cover border-4 shadow-lg"
                style={{ borderColor: '#A8211B' }}
              />
            ) : (
              <div
                className="h-24 w-24 rounded-full flex items-center justify-center border-4 shadow-lg"
                style={{ backgroundColor: '#A8211B', borderColor: '#7B1E12' }}
              >
                <User className="h-12 w-12 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#7B1E12' }}>
                {employee.fullName}
              </h1>
              <p className="text-gray-600 mb-2">{employee.employeeCode}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${getStatusColor(employee.employmentStatus)}20`,
                    color: getStatusColor(employee.employmentStatus),
                  }}
                >
                  {fmt(employee.employmentStatus)}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${getDepartmentColor(employee.department)}20`,
                    color: getDepartmentColor(employee.department),
                  }}
                >
                  {fmt(employee.department)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => router.push(`/employees/${employeeId}/edit`)}
              className="px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              style={{ backgroundColor: '#A8211B', color: 'white' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7B1E12')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#A8211B')}
            >
              <Edit className="h-5 w-5" />
              <span>Edit Employee</span>
            </button>
            <button
              onClick={handleDeleteEmployee}
              className="px-4 py-2 rounded-lg font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              title="Delete employee"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-0">
          {([
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'feedback', label: 'Feedback', icon: MessageSquare },
            { id: 'reviews', label: 'Reviews', icon: TrendingUp },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-colors ${
                activeTab === id
                  ? 'border-[#A8211B] text-[#A8211B]'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {id === 'feedback' && feedbacks.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">{feedbacks.length}</span>
              )}
              {id === 'reviews' && reviews.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">{reviews.length}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Content Grid ── */}
      {activeTab === 'profile' && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Column ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Information */}
          <SectionCard title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Employee Code" value={employee.employeeCode} icon={<Hash className="h-4 w-4" />} />
              <InfoRow label="Full Name" value={employee.fullName} icon={<User className="h-4 w-4" />} />
              <InfoRow label="Email" value={employee.email || 'N/A'} icon={<Mail className="h-4 w-4" />} />
              <InfoRow label="Phone Number" value={employee.phoneNumber} icon={<Phone className="h-4 w-4" />} />
              {employee.alternatePhone && (
                <InfoRow label="Alternate Phone" value={employee.alternatePhone} icon={<Phone className="h-4 w-4" />} />
              )}
              {employee.dateOfBirth && (
                <InfoRow label="Date of Birth" value={fmtDate(employee.dateOfBirth)} icon={<Calendar className="h-4 w-4" />} />
              )}
              <InfoRow label="Gender" value={employee.gender} />
              {employee.bloodGroup && <InfoRow label="Blood Group" value={employee.bloodGroup} icon={<Heart className="h-4 w-4" />} />}
              {employee.maritalStatus && <InfoRow label="Marital Status" value={fmt(employee.maritalStatus)} />}
            </div>
          </SectionCard>

          {/* Address Details */}
          <SectionCard title="Address Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employee.currentAddress && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 mb-0.5">Current Address</p>
                  <div className="flex items-start gap-1.5">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="font-semibold text-gray-800">{employee.currentAddress}</p>
                  </div>
                </div>
              )}
              {employee.permanentAddress && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 mb-0.5">Permanent Address</p>
                  <div className="flex items-start gap-1.5">
                    <Home className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="font-semibold text-gray-800">{employee.permanentAddress}</p>
                  </div>
                </div>
              )}
              <InfoRow label="City" value={employee.city} />
              <InfoRow label="State" value={employee.state} />
              <InfoRow label="Pincode" value={employee.pincode} />
            </div>
          </SectionCard>

          {/* Employment Details */}
          <SectionCard title="Employment Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Department</p>
                <span
                  className="inline-block px-3 py-1 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: `${getDepartmentColor(employee.department)}20`,
                    color: getDepartmentColor(employee.department),
                  }}
                >
                  {fmt(employee.department)}
                </span>
              </div>
              <InfoRow label="Designation" value={employee.designation} icon={<Briefcase className="h-4 w-4" />} />
              <InfoRow label="Employment Type" value={fmt(employee.employmentType)} />
              <div>
                <p className="text-xs text-gray-500 mb-1">Employment Status</p>
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${getStatusColor(employee.employmentStatus)}20`,
                    color: getStatusColor(employee.employmentStatus),
                  }}
                >
                  {fmt(employee.employmentStatus)}
                </span>
              </div>
              <InfoRow label="Joining Date" value={fmtDate(employee.joiningDate)} icon={<Calendar className="h-4 w-4" />} />
              {employee.confirmationDate && (
                <InfoRow label="Confirmation Date" value={fmtDate(employee.confirmationDate)} icon={<Calendar className="h-4 w-4" />} />
              )}
              {employee.resignationDate && (
                <InfoRow label="Resignation Date" value={fmtDate(employee.resignationDate)} icon={<Calendar className="h-4 w-4" />} />
              )}
              {employee.lastWorkingDate && (
                <InfoRow label="Last Working Date" value={fmtDate(employee.lastWorkingDate)} icon={<Calendar className="h-4 w-4" />} />
              )}
              {employee.reportingManagerName && (
                <InfoRow label="Reporting Manager" value={employee.reportingManagerName} icon={<User className="h-4 w-4" />} />
              )}
              <div>
                <p className="text-xs text-gray-500 mb-1">Assigned Role</p>
                {roleName ? (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span
                      className="inline-block px-3 py-1 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: '#8B5CF620', color: '#8B5CF6' }}
                    >
                      {roleName}
                    </span>
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-sm">No role assigned</p>
                )}
              </div>
            </div>
          </SectionCard>

          {/* Salary Details */}
          <SectionCard title="Salary Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Earnings */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">Earnings</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Basic Salary', value: employee.basicSalary },
                    { label: 'HRA', value: employee.houseRentAllowance },
                    { label: 'Transport Allowance', value: employee.transportAllowance },
                    ...(Number(employee.medicalAllowance) > 0
                      ? [{ label: 'Medical Allowance', value: employee.medicalAllowance }] : []),
                    ...(Number(employee.otherAllowances) > 0
                      ? [{ label: 'Other Allowances', value: employee.otherAllowances }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-semibold">{fmtCurrency(Number(value))}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Gross Salary</span>
                    <span className="font-bold text-lg" style={{ color: '#3DA35D' }}>
                      {fmtCurrency(Number(employee.grossSalary))}
                    </span>
                  </div>
                </div>
              </div>
              {/* Deductions */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">Deductions</h3>
                <div className="space-y-2">
                  {[
                    { label: 'PF', value: employee.pfDeduction },
                    { label: 'ESI', value: employee.esiDeduction },
                    { label: 'Tax (TDS)', value: employee.taxDeduction },
                    ...(Number(employee.otherDeductions) > 0
                      ? [{ label: 'Other Deductions', value: employee.otherDeductions }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-semibold">{fmtCurrency(Number(value))}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Net Salary</span>
                    <span className="font-bold text-lg" style={{ color: '#3DA35D' }}>
                      {fmtCurrency(Number(employee.netSalary))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* IDs & Statutory Numbers */}
          {(employee.aadharNumber || employee.panNumber || employee.pfNumber || employee.esiNumber || employee.uanNumber) && (
            <SectionCard title="IDs & Statutory Numbers">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employee.aadharNumber && (
                  <InfoRow label="Aadhar Number" value={employee.aadharNumber} icon={<CreditCard className="h-4 w-4" />} />
                )}
                {employee.panNumber && (
                  <InfoRow label="PAN Number" value={employee.panNumber} icon={<CreditCard className="h-4 w-4" />} />
                )}
                {employee.pfNumber && (
                  <InfoRow label="PF Number" value={employee.pfNumber} icon={<Hash className="h-4 w-4" />} />
                )}
                {employee.esiNumber && (
                  <InfoRow label="ESI Number" value={employee.esiNumber} icon={<Hash className="h-4 w-4" />} />
                )}
                {employee.uanNumber && (
                  <InfoRow label="UAN Number" value={employee.uanNumber} icon={<Hash className="h-4 w-4" />} />
                )}
              </div>
            </SectionCard>
          )}

          {/* Emergency Contact */}
          {(employee.emergencyContactName || employee.emergencyContactPhone) && (
            <SectionCard title="Emergency Contact">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Contact Name" value={employee.emergencyContactName} icon={<User className="h-4 w-4" />} />
                <InfoRow label="Contact Phone" value={employee.emergencyContactPhone} icon={<Phone className="h-4 w-4" />} />
                {employee.emergencyContactRelation && (
                  <InfoRow label="Relation" value={fmt(employee.emergencyContactRelation)} icon={<Heart className="h-4 w-4" />} />
                )}
              </div>
            </SectionCard>
          )}

          {/* Performance & Skills */}
          {(employee.skills || employee.qualifications || employee.experience || employee.performanceRating !== undefined) && (
            <SectionCard title="Performance & Skills">
              <div className="space-y-5">
                {/* Interactive star rating */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Performance Rating
                    {savingRating && <span className="ml-2 text-[10px] text-gray-400 animate-pulse">Saving…</span>}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const filled = i < (hoverRating || Math.round(Number(employee.performanceRating)));
                      return (
                        <button
                          key={i}
                          onClick={() => handleRatingClick(i + 1)}
                          onMouseEnter={() => setHoverRating(i + 1)}
                          onMouseLeave={() => setHoverRating(0)}
                          disabled={savingRating}
                          className="transition-transform hover:scale-110 disabled:opacity-50"
                          title={`Rate ${i + 1}/5`}
                        >
                          <Star
                            className="h-6 w-6"
                            style={{
                              fill: filled ? '#F59E0B' : 'none',
                              color: filled ? '#F59E0B' : '#D1D5DB',
                              transition: 'fill 0.1s, color 0.1s',
                            }}
                          />
                        </button>
                      );
                    })}
                    <span className="text-sm font-semibold text-gray-700 ml-2">
                      {employee.performanceRating ? `${Number(employee.performanceRating).toFixed(1)} / 5` : 'Not rated — click to rate'}
                    </span>
                  </div>
                </div>

                {employee.skills && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Star className="h-3 w-3" /> Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {employee.skills.split(',').map((skill: string) => skill.trim()).filter(Boolean).map((skill: string) => (
                        <span key={skill} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {employee.qualifications && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <BookOpen className="h-3 w-3" /> Qualifications
                    </p>
                    <p className="text-sm text-gray-800 whitespace-pre-line">{employee.qualifications}</p>
                  </div>
                )}

                {employee.experience && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Briefcase className="h-3 w-3" /> Previous Experience
                    </p>
                    <p className="text-sm text-gray-800 whitespace-pre-line">{employee.experience}</p>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

        </div>

        {/* ── Right Column ── */}
        <div className="space-y-6">

          {/* ── Sticky Notes card ── */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-amber-900 flex items-center gap-2">
                <StickyNote className="h-4 w-4" /> Notes
              </h2>
              {!editingNote && (
                <button
                  onClick={() => { setNoteValue(employee.notes || ''); setEditingNote(true); }}
                  className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 px-2 py-1 rounded hover:bg-amber-100 transition"
                >
                  <Pencil className="h-3 w-3" />
                  {employee.notes ? 'Edit' : 'Add note'}
                </button>
              )}
            </div>

            {editingNote ? (
              <div className="space-y-2">
                <textarea
                  autoFocus
                  className="w-full text-sm border border-amber-300 rounded-lg p-3 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
                  rows={5}
                  placeholder="Add a note about this employee…"
                  value={noteValue}
                  onChange={e => setNoteValue(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setEditingNote(false)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <XIcon className="h-3 w-3" /> Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    disabled={savingNote}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
                  >
                    {savingNote ? <span className="animate-pulse">Saving…</span> : <><Check className="h-3 w-3" /> Save</>}
                  </button>
                </div>
              </div>
            ) : employee.notes ? (
              <p className="text-sm text-amber-900 whitespace-pre-line leading-relaxed">{employee.notes}</p>
            ) : (
              <p className="text-sm text-amber-400 italic">No notes yet. Click "Add note" to add one.</p>
            )}
          </div>

          {/* Leave Balances */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4" style={{ color: '#7B1E12' }}>Leave Balances</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600">Casual Leave</p>
                  <p className="text-2xl font-bold text-blue-700">{employee.casualLeaveBalance ?? 0}</p>
                  <p className="text-xs text-blue-500">days remaining</p>
                </div>
                <Award className="h-8 w-8 text-blue-700 opacity-70" />
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600">Sick Leave</p>
                  <p className="text-2xl font-bold text-green-700">{employee.sickLeaveBalance ?? 0}</p>
                  <p className="text-xs text-green-500">days remaining</p>
                </div>
                <FileText className="h-8 w-8 text-green-700 opacity-70" />
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600">Earned Leave</p>
                  <p className="text-2xl font-bold text-purple-700">{employee.earnedLeaveBalance ?? 0}</p>
                  <p className="text-xs text-purple-500">days remaining</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-700 opacity-70" />
              </div>
              {(employee.leaveTaken !== undefined && Number(employee.leaveTaken) > 0) && (
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600">Leave Taken (YTD)</p>
                    <p className="text-2xl font-bold text-orange-700">{employee.leaveTaken}</p>
                    <p className="text-xs text-orange-500">days used</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-700 opacity-70" />
                </div>
              )}
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4" style={{ color: '#7B1E12' }}>Attendance Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Present</span>
                <span className="font-semibold text-green-600">{employee.totalPresent || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Absent</span>
                <span className="font-semibold text-red-600">{employee.totalAbsent || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Late Arrivals</span>
                <span className="font-semibold text-orange-600">{employee.totalLateArrival || 0}</span>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          {employee.bankName && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold mb-4" style={{ color: '#7B1E12' }}>Bank Details</h2>
              <div className="space-y-3">
                <InfoRow label="Bank Name" value={employee.bankName} />
                <InfoRow label="Account Number" value={employee.bankAccountNumber} />
                <InfoRow label="IFSC Code" value={employee.ifscCode} />
                {employee.branchName && <InfoRow label="Branch" value={employee.branchName} />}
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <DocumentsPanel
              entityType={DocumentEntityType.EMPLOYEE}
              entityId={params.id as string}
              title="Employee Documents"
            />
          </div>

        </div>
      </div>}

      {/* ── Feedback Tab ── */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{feedbacks.length} feedback entr{feedbacks.length === 1 ? 'y' : 'ies'}</p>
            <button
              onClick={() => setShowFeedbackForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: '#A8211B' }}
            >
              <MessageSquare className="h-4 w-4" /> Add Feedback
            </button>
          </div>

          {/* Add Feedback Form */}
          {showFeedbackForm && (
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#A8211B]">
              <h3 className="font-bold text-gray-800 mb-4">New Feedback Entry</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Feedback Type</label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm" value={feedbackForm.feedbackType}
                    onChange={e => setFeedbackForm(f => ({ ...f, feedbackType: e.target.value }))}>
                    {[['MANAGER_TO_EMPLOYEE','Manager → Employee'],['PEER_TO_PEER','Peer to Peer'],['SELF_ASSESSMENT','Self Assessment'],['CLIENT_FEEDBACK','Client Feedback'],['EXIT_FEEDBACK','Exit Feedback']].map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Date</label>
                  <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={feedbackForm.feedbackDate}
                    onChange={e => setFeedbackForm(f => ({ ...f, feedbackDate: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 block mb-1">Title *</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. Q1 Performance Review Feedback"
                    value={feedbackForm.feedbackTitle} onChange={e => setFeedbackForm(f => ({ ...f, feedbackTitle: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Given By</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Name of reviewer"
                    value={feedbackForm.providerName} onChange={e => setFeedbackForm(f => ({ ...f, providerName: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Overall Rating (1–5)</label>
                  <div className="flex items-center gap-1 mt-1">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setFeedbackForm(f => ({ ...f, overallRating: n }))}>
                        <Star className="h-6 w-6" style={{ fill: n <= feedbackForm.overallRating ? '#F59E0B' : 'none', color: n <= feedbackForm.overallRating ? '#F59E0B' : '#D1D5DB' }} />
                      </button>
                    ))}
                    <span className="ml-2 text-sm font-semibold">{feedbackForm.overallRating}/5</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Positive Aspects</label>
                  <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} placeholder="What went well…"
                    value={feedbackForm.positiveAspects} onChange={e => setFeedbackForm(f => ({ ...f, positiveAspects: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Areas for Improvement</label>
                  <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} placeholder="What can be improved…"
                    value={feedbackForm.areasForImprovement} onChange={e => setFeedbackForm(f => ({ ...f, areasForImprovement: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 block mb-1">General Comments</label>
                  <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} placeholder="Additional comments…"
                    value={feedbackForm.generalComments} onChange={e => setFeedbackForm(f => ({ ...f, generalComments: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button onClick={() => setShowFeedbackForm(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600">Cancel</button>
                <button onClick={handleSubmitFeedback} disabled={savingFeedback || !feedbackForm.feedbackTitle.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: '#A8211B' }}>
                  {savingFeedback ? 'Saving…' : 'Save Feedback'}
                </button>
              </div>
            </div>
          )}

          {feedbackLoading ? (
            <div className="text-center py-8 text-gray-400">Loading…</div>
          ) : feedbacks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No feedback entries yet. Add the first one above.</p>
            </div>
          ) : (
            feedbacks.map(fb => (
              <div key={fb.id} className="bg-white rounded-lg shadow-md p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-900">{fb.feedbackTitle}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">{fb.feedbackType?.replace(/_/g, ' ')}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${fb.feedbackStatus === 'SUBMITTED' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{fb.feedbackStatus}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      {fmtDate(fb.feedbackDate)}{fb.providerName && ` · by ${fb.providerName}`}
                      {fb.overallRating !== undefined && (
                        <span className="ml-3 inline-flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5" style={{ fill: i < fb.overallRating! ? '#F59E0B' : 'none', color: i < fb.overallRating! ? '#F59E0B' : '#D1D5DB' }} />
                          ))}
                          <span className="ml-1 text-gray-700 font-semibold">{Number(fb.overallRating).toFixed(1)}</span>
                        </span>
                      )}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {fb.positiveAspects && (
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs text-green-600 font-semibold mb-1">Positive Aspects</p>
                          <p className="text-gray-700 whitespace-pre-line">{fb.positiveAspects}</p>
                        </div>
                      )}
                      {fb.areasForImprovement && (
                        <div className="bg-orange-50 rounded-lg p-3">
                          <p className="text-xs text-orange-600 font-semibold mb-1">Areas for Improvement</p>
                          <p className="text-gray-700 whitespace-pre-line">{fb.areasForImprovement}</p>
                        </div>
                      )}
                      {fb.generalComments && (
                        <div className="bg-gray-50 rounded-lg p-3 md:col-span-2">
                          <p className="text-xs text-gray-500 font-semibold mb-1">General Comments</p>
                          <p className="text-gray-700 whitespace-pre-line">{fb.generalComments}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteFeedback(fb.id)} className="text-gray-300 hover:text-red-500 transition flex-shrink-0 p-1" title="Remove">
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Reviews Tab ── */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{reviews.length} review{reviews.length === 1 ? '' : 's'}</p>
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: '#A8211B' }}
            >
              <TrendingUp className="h-4 w-4" /> Start Review
            </button>
          </div>

          {/* Add Review Form */}
          {showReviewForm && (
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#A8211B]">
              <h3 className="font-bold text-gray-800 mb-4">New Performance Review</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Review Type</label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm" value={reviewForm.reviewType}
                    onChange={e => setReviewForm(f => ({ ...f, reviewType: e.target.value }))}>
                    {[['MONTHLY','Monthly'],['QUARTERLY','Quarterly'],['HALF_YEARLY','Half Yearly'],['ANNUAL','Annual'],['PROBATION','Probation'],['PROJECT_BASED','Project Based']].map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Review Date</label>
                  <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={reviewForm.reviewDate}
                    onChange={e => setReviewForm(f => ({ ...f, reviewDate: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 block mb-1">Review Title *</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. March 2026 Monthly Review"
                    value={reviewForm.reviewTitle} onChange={e => setReviewForm(f => ({ ...f, reviewTitle: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Period Start *</label>
                  <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={reviewForm.reviewPeriodStart}
                    onChange={e => setReviewForm(f => ({ ...f, reviewPeriodStart: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Period End *</label>
                  <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={reviewForm.reviewPeriodEnd}
                    onChange={e => setReviewForm(f => ({ ...f, reviewPeriodEnd: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Reviewer Name</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Name of the reviewer"
                    value={reviewForm.reviewerName} onChange={e => setReviewForm(f => ({ ...f, reviewerName: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Overall Rating (1–5)</label>
                  <div className="flex items-center gap-1 mt-1">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setReviewForm(f => ({ ...f, overallRating: n }))}>
                        <Star className="h-6 w-6" style={{ fill: n <= reviewForm.overallRating ? '#F59E0B' : 'none', color: n <= reviewForm.overallRating ? '#F59E0B' : '#D1D5DB' }} />
                      </button>
                    ))}
                    <span className="ml-2 text-sm font-semibold">{reviewForm.overallRating}/5</span>
                  </div>
                </div>
                {[
                  ['achievements','Achievements & Key Results'],
                  ['strengths','Strengths'],
                  ['areasOfImprovement','Areas for Improvement'],
                  ['goals','Goals for Next Period'],
                  ['reviewerComments','Reviewer Comments'],
                ].map(([key, label]) => (
                  <div key={key} className="md:col-span-2">
                    <label className="text-xs text-gray-500 block mb-1">{label}</label>
                    <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} placeholder={`${label}…`}
                      value={(reviewForm as any)[key]}
                      onChange={e => setReviewForm(f => ({ ...f, [key]: e.target.value }))} />
                  </div>
                ))}
                <div className="md:col-span-2 flex flex-wrap gap-4 pt-1">
                  {[
                    ['recommendedForPromotion', 'Recommend for Promotion'],
                    ['recommendedForIncrement', 'Recommend for Increment'],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={(reviewForm as any)[key]}
                        onChange={e => setReviewForm(f => ({ ...f, [key]: e.target.checked }))}
                        className="h-4 w-4 rounded" />
                      {label}
                    </label>
                  ))}
                  {reviewForm.recommendedForIncrement && (
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Increment %</label>
                      <input type="number" min={0} max={100} className="w-20 border rounded-lg px-2 py-1 text-sm"
                        value={reviewForm.recommendedIncrementPercentage}
                        onChange={e => setReviewForm(f => ({ ...f, recommendedIncrementPercentage: Number(e.target.value) }))} />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button onClick={() => setShowReviewForm(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600">Cancel</button>
                <button onClick={handleSubmitReview} disabled={savingReview || !reviewForm.reviewTitle.trim() || !reviewForm.reviewPeriodStart || !reviewForm.reviewPeriodEnd}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: '#A8211B' }}>
                  {savingReview ? 'Saving…' : 'Save Review'}
                </button>
              </div>
            </div>
          )}

          {reviewLoading ? (
            <div className="text-center py-8 text-gray-400">Loading…</div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No reviews yet. Click "Start Review" to create one.</p>
            </div>
          ) : (
            reviews.map(rv => (
              <div key={rv.id} className="bg-white rounded-lg shadow-md p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-900">{rv.reviewTitle}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">{rv.reviewType?.replace(/_/g, ' ')}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        rv.reviewStatus === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                        rv.reviewStatus === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>{rv.reviewStatus?.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      {fmtDate(rv.reviewDate)}{rv.reviewerName && ` · by ${rv.reviewerName}`}
                      {' · '}Period: {fmtDate(rv.reviewPeriodStart)} – {fmtDate(rv.reviewPeriodEnd)}
                      <span className="ml-3 inline-flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5" style={{ fill: i < rv.overallRating ? '#F59E0B' : 'none', color: i < rv.overallRating ? '#F59E0B' : '#D1D5DB' }} />
                        ))}
                        <span className="ml-1 text-gray-700 font-semibold">{Number(rv.overallRating).toFixed(1)}</span>
                      </span>
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {rv.achievements && (
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs text-green-600 font-semibold mb-1">Achievements</p>
                          <p className="text-gray-700 whitespace-pre-line">{rv.achievements}</p>
                        </div>
                      )}
                      {rv.strengths && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs text-blue-600 font-semibold mb-1">Strengths</p>
                          <p className="text-gray-700 whitespace-pre-line">{rv.strengths}</p>
                        </div>
                      )}
                      {rv.areasOfImprovement && (
                        <div className="bg-orange-50 rounded-lg p-3">
                          <p className="text-xs text-orange-600 font-semibold mb-1">Areas for Improvement</p>
                          <p className="text-gray-700 whitespace-pre-line">{rv.areasOfImprovement}</p>
                        </div>
                      )}
                      {rv.goals && (
                        <div className="bg-purple-50 rounded-lg p-3">
                          <p className="text-xs text-purple-600 font-semibold mb-1">Goals</p>
                          <p className="text-gray-700 whitespace-pre-line">{rv.goals}</p>
                        </div>
                      )}
                    </div>
                    {(rv.recommendedForPromotion || rv.recommendedForIncrement) && (
                      <div className="flex gap-2 mt-3">
                        {rv.recommendedForPromotion && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium">
                            <Award className="h-3 w-3" /> Recommended for Promotion
                          </span>
                        )}
                        {rv.recommendedForIncrement && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
                            <TrendingUp className="h-3 w-3" /> Increment Recommended
                            {rv.recommendedIncrementPercentage ? ` (${rv.recommendedIncrementPercentage}%)` : ''}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleDeleteReview(rv.id)} className="text-gray-300 hover:text-red-500 transition flex-shrink-0 p-1" title="Remove">
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
