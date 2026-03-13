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
} from 'lucide-react';
import { employeesService, Employee } from '@/services/employees.service';
import { rolesService } from '@/services/roles.service';
import DocumentsPanel from '@/components/documents/DocumentsPanel';
import { DocumentEntityType } from '@/services/documents.service';

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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleName, setRoleName] = useState<string>('');

  useEffect(() => {
    if (employeeId) fetchEmployee();
  }, [employeeId]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const data = await employeesService.getEmployee(employeeId);
      setEmployee(data);

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

          <button
            onClick={() => router.push(`/employees/${employeeId}/edit`)}
            className="px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 flex-shrink-0"
            style={{ backgroundColor: '#A8211B', color: 'white' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7B1E12')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#A8211B')}
          >
            <Edit className="h-5 w-5" />
            <span>Edit Employee</span>
          </button>
        </div>
      </div>

      {/* ── Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

          {/* Performance & Feedback */}
          {(employee.skills || employee.qualifications || employee.experience || employee.performanceRating || employee.notes) && (
            <SectionCard title="Performance & Feedback">
              <div className="space-y-5">
                {/* Rating */}
                {employee.performanceRating !== undefined && employee.performanceRating !== null && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Performance Rating</p>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5"
                          style={{
                            fill: i < Math.round(Number(employee.performanceRating)) ? '#F59E0B' : 'none',
                            color: i < Math.round(Number(employee.performanceRating)) ? '#F59E0B' : '#D1D5DB',
                          }}
                        />
                      ))}
                      <span className="text-sm font-semibold text-gray-700 ml-1">
                        {Number(employee.performanceRating).toFixed(1)} / 5
                      </span>
                    </div>
                  </div>
                )}

                {employee.skills && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Star className="h-3 w-3" /> Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {employee.skills.split(',').map((skill: string) => skill.trim()).filter(Boolean).map((skill: string) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                        >
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

                {employee.notes && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> Notes / Feedback
                    </p>
                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                      <p className="text-sm text-gray-800 whitespace-pre-line">{employee.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

        </div>

        {/* ── Right Column ── */}
        <div className="space-y-6">

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
      </div>
    </div>
  );
}
