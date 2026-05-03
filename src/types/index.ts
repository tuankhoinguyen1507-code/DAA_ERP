export interface Student {
  id: string;
  name: string;
  phone: string;
  parentPhone: string;
  className: string;
  enrollmentDate: string;
}

export interface Grade {
  id: string;
  studentId: string;
  date: string;
  examName: string;
  score: number;
  maxScore: number;
  notes: string;
}

export interface FeeReceipt {
  id: string;
  studentId: string;
  month: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  issuedDate: string;
  paidDate?: string;
  notes?: string;
}
