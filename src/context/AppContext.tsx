import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, Grade, FeeReceipt } from '../types';
import { loadData, saveData } from '../lib/mockData';
import { v4 as uuidv4 } from 'uuid';

interface AppContextType {
  students: Student[];
  grades: Grade[];
  fees: FeeReceipt[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  addGrade: (grade: Omit<Grade, 'id'>) => void;
  updateGrade: (grade: Grade) => void;
  deleteGrade: (id: string) => void;
  addFee: (fee: Omit<FeeReceipt, 'id'>) => void;
  updateFee: (fee: FeeReceipt) => void;
  deleteFee: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [fees, setFees] = useState<FeeReceipt[]>([]);

  useEffect(() => {
    const data = loadData();
    setStudents(data.students);
    setGrades(data.grades);
    setFees(data.fees);
  }, []);

  useEffect(() => {
    saveData({ students, grades, fees });
  }, [students, grades, fees]);

  const addStudent = (student: Omit<Student, 'id'>) => {
    setStudents([...students, { ...student, id: uuidv4() }]);
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const deleteStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
    // Also delete cascade or warn in real app. We'll just delete here for simplicity.
  };

  const addGrade = (grade: Omit<Grade, 'id'>) => {
    setGrades([...grades, { ...grade, id: uuidv4() }]);
  };

  const updateGrade = (updatedGrade: Grade) => {
    setGrades(grades.map(g => g.id === updatedGrade.id ? updatedGrade : g));
  };

  const deleteGrade = (id: string) => {
    setGrades(grades.filter(g => g.id !== id));
  };

  const addFee = (fee: Omit<FeeReceipt, 'id'>) => {
    setFees([...fees, { ...fee, id: uuidv4() }]);
  };

  const updateFee = (updatedFee: FeeReceipt) => {
    setFees(fees.map(f => f.id === updatedFee.id ? updatedFee : f));
  };

  const deleteFee = (id: string) => {
    setFees(fees.filter(f => f.id !== id));
  };

  return (
    <AppContext.Provider value={{
      students, grades, fees,
      addStudent, updateStudent, deleteStudent,
      addGrade, updateGrade, deleteGrade,
      addFee, updateFee, deleteFee
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
