import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Download } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Grade } from '../types';
import { cn } from '../lib/utils';
import * as XLSX from 'xlsx';

export default function Grades() {
  const { students, grades, addGrade, updateGrade, deleteGrade } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);

  const [formData, setFormData] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    examName: '',
    score: 0,
    maxScore: 10,
    notes: ''
  });

  const filteredGrades = grades.filter(g => {
    const student = students.find(s => s.id === g.studentId);
    if (!student) return false;
    return (
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      g.examName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGrade) {
      updateGrade({ ...formData, id: editingGrade.id });
    } else {
      addGrade(formData);
    }
    closeModal();
  };

  const openEditModal = (grade: Grade) => {
    setEditingGrade(grade);
    setFormData({
      studentId: grade.studentId,
      date: grade.date,
      examName: grade.examName,
      score: grade.score,
      maxScore: grade.maxScore,
      notes: grade.notes || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGrade(null);
    setFormData({
      studentId: '',
      date: new Date().toISOString().split('T')[0],
      examName: '',
      score: 0,
      maxScore: 10,
      notes: ''
    });
  };

  const exportToExcel = () => {
    const data = filteredGrades.map(grade => {
      const student = students.find(s => s.id === grade.studentId);
      return {
        'Student Name': student?.name || 'Unknown',
        'Class': student?.className || 'Unknown',
        'Exam/Header': grade.examName,
        'Date': grade.date,
        'Score': grade.score,
        'Max Score': grade.maxScore,
        'Percentage': ((grade.score / grade.maxScore) * 100).toFixed(1) + '%',
        'Notes': grade.notes || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Grades");
    XLSX.writeFile(workbook, "Grades_Report.xlsx");
  };

  return (
    <div className="p-gutter pb-24 lg:pb-gutter flex-1 flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-4 lg:mt-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">Attendance & Grades</h2>
          <p className="text-on-surface-variant text-sm mt-1">Manage and track student performance.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={exportToExcel}
            className="flex-1 sm:flex-none h-10 px-4 inline-flex items-center justify-center gap-2 bg-surface hover:bg-surface-bright text-on-surface border border-outline text-sm font-semibold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none h-10 px-4 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary text-sm font-semibold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            Enter Grades
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant overflow-hidden flex flex-col flex-1">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-on-surface-variant" />
            </div>
            <input
              type="text"
              placeholder="Search by student name or exam..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 bg-surface border border-outline hover:border-primary/50 focus:border-primary rounded-xl focus:ring-1 focus:ring-primary text-sm text-on-surface transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left min-w-max">
            <thead>
              <tr className="bg-surface border-b border-outline-variant">
                <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Exam Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
              {filteredGrades.map((grade) => {
                const student = students.find(s => s.id === grade.studentId);
                if (!student) return null;
                
                const percentage = (grade.score / grade.maxScore) * 100;
                const scoreColor = percentage >= 80 ? 'text-primary' : percentage >= 50 ? 'text-secondary' : 'text-error';

                return (
                  <tr key={grade.id} className="hover:bg-surface-bright transition-colors">
                    <td className="px-6 py-4 font-bold text-on-surface tracking-tight">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">{student.className}</td>
                    <td className="px-6 py-4 text-sm font-medium text-on-surface">{grade.examName}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{grade.date}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={cn("font-bold", scoreColor)}>
                        {grade.score}
                      </span>
                      <span className="text-on-surface-variant text-xs">/{grade.maxScore}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(grade)}
                          className="p-1.5 text-on-surface-variant hover:text-primary rounded-md hover:bg-primary/10 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this grade record?')) {
                              deleteGrade(grade.id);
                            }
                          }}
                          className="p-1.5 text-on-surface-variant hover:text-error rounded-md hover:bg-error/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredGrades.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant text-sm">
                     <div className="flex flex-col items-center justify-center gap-3">
                      <Search className="h-8 w-8 opacity-20" />
                      <p className="font-medium">No grade records found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-surface-container-highest/80 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden border border-outline-variant animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-on-surface mb-6 tracking-tight">
              {editingGrade ? 'Edit Grade Record' : 'Enter New Grade'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Student *</label>
                <select
                  required
                  value={formData.studentId}
                  onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-outline bg-surface rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-colors text-on-surface"
                >
                  <option value="">-- Select Student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - {s.className}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Exam Name *</label>
                <input
                  type="text"
                  required
                  value={formData.examName}
                  onChange={e => setFormData({ ...formData, examName: e.target.value })}
                  className="w-full px-3 py-2 border border-outline bg-surface rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-colors text-on-surface placeholder:text-outline-variant"
                  placeholder="e.g. Midterm Test 1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5">Score Achieved *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.score}
                    onChange={e => setFormData({ ...formData, score: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-outline bg-surface rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-colors text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5">Maximum Score *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.maxScore}
                    onChange={e => setFormData({ ...formData, maxScore: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-outline bg-surface rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-colors text-on-surface"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-outline bg-surface rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-colors text-on-surface"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-outline bg-surface rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-colors text-on-surface placeholder:text-outline-variant"
                  placeholder="Add optional notes..."
                />
              </div>
              <div className="pt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-on-surface-variant font-semibold hover:bg-surface-bright rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-on-primary font-semibold rounded-xl shadow-sm hover:bg-primary/90 transition-colors text-sm focus:ring-2 focus:ring-offset-2 focus:ring-primary outline-none"
                >
                  {editingGrade ? 'Save Changes' : 'Save Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
