export type UserRole = 'corporate' | 'person' | 'agent' | 'admin';

export interface Company {
  id: string;
  name: string;
  email: string;
  trn?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt: string;
  createdBy: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  role: UserRole;
  companyId: string;
  company?: Company;
  createdAt: string;
}

export interface Registration {
  id: string;
  userId: string;
  companyId: string;
  taxType: 'VAT' | 'Corporate Tax' | 'Excise Tax';
  trn: string;
  status: 'Active' | 'Pending' | 'Suspended';
  effectiveDate: string;
  entityName: string;
}

export interface VATReturn {
  id: string;
  userId: string;
  companyId: string;
  period: string;
  dueDate: string;
  status: 'Filed' | 'Draft' | 'Overdue' | 'Submitted';
  vatRef?: string;
  totalSales: number;
  totalVAT: number;
  totalExpenses: number;
  totalRecoverableVAT: number;
  netVAT: number;
  filedAt?: string;
  formData?: any;
}

export interface Document {
  id: string;
  userId: string;
  companyId: string;
  vatReturnId: string;
  fileName: string;
  fileType: string;
  fileData?: string;
  createdAt: string;
  vatRef?: string;
}

export interface CorporateTaxReturn {
  id: string;
  userId: string;
  companyId: string;
  accountingPeriod: string;
  taxableIncome: number;
  taxAmount: number;
  status: 'Filed' | 'Draft' | 'Overdue' | 'Submitted';
  filedAt?: string;
  dueDate: string;
  formData?: any;
}

export interface Correspondence {
  id: string;
  userId: string;
  companyId: string;
  subject: string;
  type: 'Message' | 'Certificate' | 'NOC' | 'Audit';
  status: 'Unread' | 'Read' | 'Resolved';
  content: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  companyId: string;
  amount: number;
  type: string;
  status: 'Paid' | 'Outstanding' | 'Processing';
  dueDate: string;
  paidAt?: string;
}
