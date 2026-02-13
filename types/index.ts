export interface User {
  _id: string
  email: string
  password: string
  name: string
  role: 
    | 'super_admin' 
    | 'hr' 
    | 'project_manager' 
    | 'graphic_designer' 
    | 'associate_software_developer' 
    | 'software_developer' 
    | 'senior_software_developer'
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Employee {
  _id: string
  userId: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  position: string
  salary: number
  joiningDate: Date
  status: 'active' | 'inactive' | 'on-leave'
  address?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  _id: string
  name: string
  description: string
  clientId: string | Client
  status: 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  startDate: Date
  endDate: Date
  budget: number
  projectManager: string | Employee
  assignedEmployees: (string | Employee)[]
  progress: number
  createdAt: Date
  updatedAt: Date
}

export interface Client {
  _id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  address?: string
  website?: string
  industry?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Timesheet {
  _id: string
  employeeId: string
  date: Date
  checkIn?: Date
  checkOut?: Date
  hoursWorked: number
  projectId?: string
  status: 'present' | 'absent' | 'leave' | 'half-day'
  leaveType?: 'sick' | 'casual' | 'vacation'
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Invoice {
  _id: string
  invoiceNumber: string
  clientId: string
  projectId?: string
  issueDate: Date
  dueDate: Date
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  items: {
    description: string
    quantity: number
    rate: number
    amount: number
  }[]
  subtotal: number
  tax: number
  total: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Expense {
  _id: string
  employeeId: string
  category: string
  amount: number
  date: Date
  description: string
  status: 'pending' | 'approved' | 'rejected'
  receipt?: string
  approvedBy?: string
  approvalDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Salary {
  _id: string
  employeeId: string
  baseSalary: number
  currency: string
  paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly'
  bonuses: {
    amount: number
    reason: string
    date: Date
  }[]
  deductions: {
    amount: number
    reason: string
    date: Date
  }[]
  status: 'active' | 'inactive'
  lastIncrementDate?: Date
  bankDetails?: {
    accountNumber: string
    bankName: string
    ifscCode: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface Payroll {
  _id: string
  employeeId: string | Employee
  month: number
  year: number
  baseSalary: number
  bonuses: number
  deductions: number
  netPayable: number
  status: 'pending' | 'paid' | 'failed'
  paymentDate?: Date
  transactionId?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Leave {
  _id: string
  employeeId: string | Employee
  type: 'sick_full' | 'casual_full' | 'sick_half' | 'casual_half' | 'short' | 'unpaid' | 'other'
  startDate: Date
  endDate: Date
  reason: string
  status: 'pending_hr' | 'pending_admin' | 'approved' | 'rejected_hr' | 'rejected_admin' | 'cancelled'
  approvedBy?: string
  approvalDate?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface WFH {
  _id: string
  employeeId: string | Employee
  startDate: Date
  endDate: Date
  reason: string
  status: 'pending_hr' | 'pending_admin' | 'approved' | 'rejected_hr' | 'rejected_admin' | 'cancelled'
  approvedBy?: string
  approvalDate?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface DashboardStats {
  totalEmployees: number
  activeProjects: number
  totalRevenue: number
  pendingInvoices: number
  employeesByDepartment: { department: string; count: number }[]
  projectsByStatus: { status: string; count: number }[]
  revenueByMonth: { month: string; revenue: number }[]
}
