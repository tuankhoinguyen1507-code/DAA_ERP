import { Student, Grade, FeeReceipt } from '../types';

export const mockStudents: Student[] = [
  { id: '1', name: 'Nguyễn Văn A', phone: '0901234567', parentPhone: '0912345678', className: 'IELTS K20', enrollmentDate: '2023-09-01' },
  { id: '2', name: 'Trần Thị B', phone: '0902345678', parentPhone: '0913456789', className: 'Giao tiếp Cơ bản', enrollmentDate: '2023-10-15' },
];

export const mockGrades: Grade[] = [
  { id: '1', studentId: '1', date: '2023-11-20', examName: 'Reading Mock Test 1', score: 7.0, maxScore: 9.0, notes: 'Cần cải thiện True/False/Not Given' },
];

export const mockFees: FeeReceipt[] = [
  { id: '1', studentId: '1', month: '2023-11', amount: 2500000, status: 'PAID', issuedDate: '2023-11-01', paidDate: '2023-11-05' },
  { id: '2', studentId: '2', month: '2023-11', amount: 1500000, status: 'PENDING', issuedDate: '2023-11-01' },
];

const STORAGE_KEY = 'tutor_platform_data';

interface AppData {
  students: Student[];
  grades: Grade[];
  fees: FeeReceipt[];
}

export const loadData = (): AppData => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return { students: mockStudents, grades: mockGrades, fees: mockFees };
};

export const saveData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
