import React, { useState, useRef, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, LineChart, Download, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Student } from '../types';
import { cn } from '../lib/utils';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Students() {
  const { students, grades, addStudent, updateStudent, deleteStudent } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    parentPhone: '',
    className: '',
    enrollmentDate: new Date().toISOString().split('T')[0]
  });

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const studentChartData = useMemo(() => {
    if (!selectedStudent) return [];
    return grades
      .filter(g => g.studentId === selectedStudent.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(g => ({
        name: g.examName,
        date: g.date,
        score: g.score,
        percentage: (g.score / g.maxScore) * 10, // normalized to 10 scale if needed, or stick to %
        fullMark: g.maxScore
      }));
  }, [selectedStudent, grades]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      updateStudent({ ...formData, id: editingStudent.id });
    } else {
      addStudent(formData);
    }
    closeModal();
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      phone: student.phone,
      parentPhone: student.parentPhone,
      className: student.className,
      enrollmentDate: student.enrollmentDate
    });
    setIsModalOpen(true);
  };

  const openReportModal = (student: Student) => {
    setSelectedStudent(student);
    setIsReportModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setFormData({
      name: '',
      phone: '',
      parentPhone: '',
      className: '',
      enrollmentDate: new Date().toISOString().split('T')[0]
    });
  };

  const generateReportPDF = async () => {
    if (!reportRef.current || !selectedStudent) return;
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Progress_Report_${selectedStudent.name}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  const colors = [
    { bg: 'bg-primary-container', text: 'text-on-primary-container' },
    { bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
    { bg: 'bg-tertiary-container', text: 'text-on-tertiary-container' },
    { bg: 'bg-error-container', text: 'text-error' },
    { bg: 'bg-surface-bright', text: 'text-on-surface' },
  ];

  return (
    <div className="p-gutter pb-24 lg:pb-gutter flex-1 flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-4 lg:mt-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">Students Directory</h2>
          <p className="text-on-surface-variant text-sm mt-1">Manage enrollments, classes, and contact information.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-4 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary text-sm font-semibold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Student
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
              placeholder="Search by name or class..."
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
                <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Student Phone</th>
                <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Parent Phone</th>
                <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Enrollment</th>
                <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
              {filteredStudents.map((student, idx) => {
                const initials = student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                const colorSet = colors[idx % colors.length];

                return (
                  <tr key={student.id} className="hover:bg-surface-bright transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0", colorSet.bg, colorSet.text)}>
                          {initials}
                        </div>
                        <span className="text-sm font-bold text-on-surface">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">{student.className}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{student.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{student.parentPhone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{student.enrollmentDate}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openReportModal(student)}
                          className="p-1.5 text-on-surface-variant hover:text-primary rounded-md hover:bg-primary/10 transition-colors"
                          title="View Progress Report"
                        >
                          <LineChart className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-1.5 text-on-surface-variant hover:text-primary rounded-md hover:bg-primary/10 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this student?')) {
                              deleteStudent(student.id);
                            }
                          }}
                          className="p-1.5 text-on-surface-variant hover:text-error rounded-md hover:bg-error/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant text-sm">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Search className="h-8 w-8 opacity-20" />
                      <p className="font-medium">No students found.</p>
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
              {editingStudent ? 'Edit Student Details' : 'Add New Student'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-outline bg-surface rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-colors text-on-surface placeholder:text-outline-variant"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Class *</label>
                <input
                  type="text"
                  required
                  value={formData.className}
                  onChange={e => setFormData({ ...formData, className: e.target.value })}
                  className="w-full px-3 py-2 border border-outline bg-surface rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-colors text-on-surface placeholder:text-outline-variant"
                  placeholder="Math 101"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5">Student Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-outline bg-surface rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-colors text-on-surface placeholder:text-outline-variant"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5">Parent Phone</label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-outline bg-surface rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-colors text-on-surface placeholder:text-outline-variant"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Enrollment Date</label>
                <input
                  type="date"
                  required
                  value={formData.enrollmentDate}
                  onChange={e => setFormData({ ...formData, enrollmentDate: e.target.value })}
                  className="w-full px-3 py-2 border border-outline bg-surface rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-colors text-on-surface"
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
                  {editingStudent ? 'Save Changes' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Student Progress Report Modal */}
      {isReportModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-surface-container-highest/80 backdrop-blur-sm" onClick={() => setIsReportModalOpen(false)} />
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden border border-outline-variant animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest shrink-0">
              <h2 className="text-xl font-bold text-on-surface tracking-tight">Student Progress Report</h2>
              <button onClick={() => setIsReportModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-bright rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-surface-container-lowest">
              <div 
                ref={reportRef}
                className="bg-white text-black p-8 mx-auto shadow-sm border border-gray-200"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
              >
                {/* Header */}
                <div className="text-center mb-6 border-b-2 border-black pb-4">
                  <h1 className="text-2xl font-bold uppercase tracking-widest mb-1">DAA Management Hub</h1>
                  <p className="text-sm">English Tutoring Center</p>
                  <p className="text-sm italic">Address: 123 Education St, Knowledge City</p>
                </div>
                
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold uppercase underline">Academic Progress Report</h2>
                  <p className="text-sm italic mt-2">Date: {new Date().toLocaleDateString()}</p>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-8 text-lg">
                  <div className="flex">
                    <span className="font-bold w-40">Student Name:</span>
                    <span className="font-bold">{selectedStudent.name}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold w-40">Class:</span>
                    <span>{selectedStudent.className}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold w-40">Enrollment Date:</span>
                    <span>{selectedStudent.enrollmentDate}</span>
                  </div>
                </div>

                {/* Chart */}
                <div className="mb-10 w-full h-[400px]">
                  <h3 className="font-bold mb-4 text-center">Score Progression (Normalized to 10 Scale)</h3>
                  {studentChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={studentChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12, fill: 'black' }} />
                        <YAxis domain={[0, 10]} tick={{ fill: 'black' }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="percentage" stroke="#000000" strokeWidth={3} dot={{ r: 5, fill: '#000' }} activeDot={{ r: 8 }} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center border border-dashed border-gray-400">
                      <p className="text-gray-500 italic">No grade records found for this student.</p>
                    </div>
                  )}
                </div>

                {/* Data Table */}
                <div className="w-full mb-8">
                  <h3 className="font-bold mb-3">Grade Details</h3>
                  <table className="w-full text-left border-collapse border border-gray-500">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-500 p-2">Date</th>
                        <th className="border border-gray-500 p-2">Exam Name</th>
                        <th className="border border-gray-500 p-2">Score</th>
                        <th className="border border-gray-500 p-2">Max Score</th>
                        <th className="border border-gray-500 p-2">Percentage & Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentChartData.map((grade, idx) => {
                        const pct = (grade.score / grade.fullMark) * 100;
                        let letter = 'F';
                        if (pct >= 90) letter = 'A';
                        else if (pct >= 80) letter = 'B';
                        else if (pct >= 70) letter = 'C';
                        else if (pct >= 60) letter = 'D';

                        return (
                          <tr key={idx}>
                            <td className="border border-gray-500 p-2">{grade.date}</td>
                            <td className="border border-gray-500 p-2">{grade.name}</td>
                            <td className="border border-gray-500 p-2">{grade.score}</td>
                            <td className="border border-gray-500 p-2">{grade.fullMark}</td>
                            <td className="border border-gray-500 p-2 font-bold">
                              {pct.toFixed(1)}% - {letter}
                            </td>
                          </tr>
                        );
                      })}
                      {studentChartData.length === 0 && (
                        <tr>
                          <td colSpan={5} className="border border-gray-500 p-4 text-center italic">No grades recorded</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Comments */}
                <div className="mt-8 mb-12">
                  <h3 className="font-bold mb-2">Teacher's Comments:</h3>
                  <div className="border border-gray-400 p-4 min-h-[100px] italic">
                    {/* Placeholder for dynamic comments */}
                    Overall, the student has shown consistent effort in class. Continually encourage revision of the past materials and vocabulary.
                  </div>
                </div>

                {/* Signatures */}
                <div className="flex justify-between mt-16 pt-8">
                  <div className="text-center w-1/2">
                    <p className="font-bold mb-16">Teacher / Instructor</p>
                    <p className="border-t border-black pt-1 italic text-xs mx-4">(Sign & Full Name)</p>
                  </div>
                  <div className="text-center w-1/2">
                    <p className="font-bold mb-16">Head of DAA / Administrator</p>
                    <p className="border-t border-black pt-1 italic text-xs mx-4">(Sign & Full Name)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-lowest shrink-0 flex justify-end gap-3">
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2 text-on-surface-variant font-semibold hover:bg-surface-bright rounded-xl transition-colors text-sm"
              >
                Close
              </button>
              <button
                onClick={generateReportPDF}
                className="px-4 py-2 bg-primary text-on-primary font-semibold rounded-xl shadow-sm hover:bg-primary/90 transition-colors text-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Export Report (PDF)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
