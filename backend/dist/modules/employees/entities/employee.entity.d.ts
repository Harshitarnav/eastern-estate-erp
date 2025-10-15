export declare enum EmploymentType {
    FULL_TIME = "FULL_TIME",
    PART_TIME = "PART_TIME",
    CONTRACT = "CONTRACT",
    INTERN = "INTERN",
    CONSULTANT = "CONSULTANT"
}
export declare enum EmploymentStatus {
    ACTIVE = "ACTIVE",
    ON_LEAVE = "ON_LEAVE",
    SUSPENDED = "SUSPENDED",
    TERMINATED = "TERMINATED",
    RESIGNED = "RESIGNED"
}
export declare enum Department {
    MANAGEMENT = "MANAGEMENT",
    SALES = "SALES",
    MARKETING = "MARKETING",
    OPERATIONS = "OPERATIONS",
    FINANCE = "FINANCE",
    HR = "HR",
    IT = "IT",
    CONSTRUCTION = "CONSTRUCTION",
    CUSTOMER_SERVICE = "CUSTOMER_SERVICE",
    LEGAL = "LEGAL"
}
export declare class Employee {
    id: string;
    employeeCode: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    alternatePhone: string;
    dateOfBirth: Date;
    gender: string;
    bloodGroup: string;
    maritalStatus: string;
    currentAddress: string;
    permanentAddress: string;
    city: string;
    state: string;
    pincode: string;
    department: Department;
    designation: string;
    employmentType: EmploymentType;
    employmentStatus: EmploymentStatus;
    joiningDate: Date;
    confirmationDate: Date;
    resignationDate: Date;
    lastWorkingDate: Date;
    reportingManagerId: string;
    reportingManagerName: string;
    basicSalary: number;
    houseRentAllowance: number;
    transportAllowance: number;
    medicalAllowance: number;
    otherAllowances: number;
    grossSalary: number;
    pfDeduction: number;
    esiDeduction: number;
    taxDeduction: number;
    otherDeductions: number;
    netSalary: number;
    bankName: string;
    bankAccountNumber: string;
    ifscCode: string;
    branchName: string;
    aadharNumber: string;
    panNumber: string;
    pfNumber: string;
    esiNumber: string;
    uanNumber: string;
    documents: string[];
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelation: string;
    casualLeaveBalance: number;
    sickLeaveBalance: number;
    earnedLeaveBalance: number;
    leaveTaken: number;
    totalPresent: number;
    totalAbsent: number;
    totalLateArrival: number;
    skills: string;
    qualifications: string;
    experience: string;
    performanceRating: number;
    lastReviewDate: Date;
    notes: string;
    tags: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
