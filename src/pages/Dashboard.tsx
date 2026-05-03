import React from 'react';
import { useAppContext } from '../context/AppContext';
import { format } from 'date-fns';
import { Users, CreditCard, GraduationCap, Clock, Plus, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const { students, fees, grades } = useAppContext();

  const totalStudents = students.length;
  const newStudentsThisMonth = students.filter(s => s.enrollmentDate.startsWith(format(new Date(), 'yyyy-MM'))).length;
  
  const pendingFeesItems = fees.filter(f => f.status !== 'PAID');
  const pendingFeesAmount = pendingFeesItems.reduce((sum, f) => sum + f.amount, 0);
  const pendingFeesCount = pendingFeesItems.length;
  
  const averageGrade = grades.length > 0 
    ? (grades.reduce((sum, g) => sum + (g.score / g.maxScore * 10), 0) / grades.length).toFixed(1)
    : '0.0';

  const collectedAmount = fees
    .filter(f => f.status === 'PAID' && f.month === format(new Date(), 'yyyy-MM'))
    .reduce((sum, f) => sum + f.amount, 0);
    
  const totalExpectedAmount = fees
    .filter(f => f.month === format(new Date(), 'yyyy-MM'))
    .reduce((sum, f) => sum + f.amount, 0);
    
  const progressPercent = totalExpectedAmount > 0 ? Math.round((collectedAmount / totalExpectedAmount) * 100) : 0;
  
  const colors = [
    { bg: 'bg-primary-container', text: 'text-on-primary-container' },
    { bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
    { bg: 'bg-tertiary-container', text: 'text-on-tertiary-container' },
    { bg: 'bg-error-container', text: 'text-error' },
    { bg: 'bg-surface-bright', text: 'text-on-surface' },
  ];

  return (
    <div className="p-gutter pb-24 lg:pb-gutter flex-1">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-4 lg:mt-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">Overview</h2>
          <p className="text-on-surface-variant text-sm mt-1">Welcome back, Admin</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary text-sm font-semibold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            New Student
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-min gap-4 mb-8">
        {/* Top Stats Section */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm card-hover flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-on-surface tracking-tight">{totalStudents}</p>
            <p className="text-sm font-medium text-on-surface-variant mt-1">Total Students</p>
            <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-primary">
              <span className="bg-primary/10 px-1.5 py-0.5 rounded">+{newStudentsThisMonth}</span>
              <span className="text-on-surface-variant font-medium">this month</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm card-hover flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-error-container text-error flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-on-surface tracking-tight">{pendingFeesAmount.toLocaleString()}</p>
            <p className="text-sm font-medium text-on-surface-variant mt-1">Pending Fees (VND)</p>
            <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-error">
              <span>{pendingFeesCount} students</span>
              <span className="text-on-surface-variant font-medium">unpaid</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm card-hover flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-on-surface tracking-tight">{averageGrade}</p>
            <p className="text-sm font-medium text-on-surface-variant mt-1">Average Grade</p>
            <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-secondary">
              <span>Class average</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm card-hover flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-on-surface tracking-tight">3</p>
            <p className="text-sm font-medium text-on-surface-variant mt-1">Classes Today</p>
            <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-tertiary">
              <span className="text-on-surface-variant font-medium">Next: 17:30</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Student Table */}
        <div className="col-span-1 lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
            <div>
              <h3 className="font-bold text-on-surface text-lg">Recent Students</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Latest enrollments and performance</p>
            </div>
            <button className="text-sm text-primary font-semibold hover:bg-primary/5 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left min-w-max">
              <thead>
                <tr className="bg-surface border-b border-outline-variant">
                  <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Fee Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
                {students.slice(0, 5).map((student, idx) => {
                  const initials = student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                  const colorSet = colors[idx % colors.length];
                  
                  // Get latest grade
                  const studentGrades = grades.filter(g => g.studentId === student.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                  const latestGrade = studentGrades.length > 0 ? (studentGrades[0].score / studentGrades[0].maxScore * 10).toFixed(1) : '-';
                  
                  // Get latest fee status
                  const studentFees = fees.filter(f => f.studentId === student.id).sort((a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime());
                  const isPaid = studentFees.length === 0 || studentFees[0].status === 'PAID';
                  
                  return (
                    <tr key={student.id} className="hover:bg-surface-bright transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0", colorSet.bg, colorSet.text)}>
                            {initials}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-on-surface block leading-none">{student.name}</span>
                            <span className="text-xs text-on-surface-variant mt-1.5 block">{student.phoneParent || 'No contact'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">{student.className}</td>
                      <td className="px-6 py-4 text-sm font-bold text-on-surface">{latestGrade}</td>
                      <td className="px-6 py-4">
                        {isPaid ? (
                          <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Paid</span>
                        ) : (
                          <span className="bg-error/10 text-error border border-error/20 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Unpaid</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-on-surface-variant">
                        <Users className="w-8 h-8 mb-3 opacity-20" />
                        <p className="text-sm font-medium">No students yet</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Quick Actions & Tuition Summary */}
        <div className="col-span-1 space-y-6">
          <div className="bg-primary text-on-primary p-6 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-lg font-bold mb-2 tracking-tight">Quick Invoice</h4>
              <p className="text-on-primary/80 text-xs mb-5 font-medium leading-relaxed">Send fee notifications to parents via Zalo/Email with one click.</p>
              <button className="w-full bg-surface-container-lowest text-primary font-bold py-2.5 rounded-xl text-sm shadow-sm hover:bg-surface-bright transition-all group-hover:scale-[1.02]">
                Generate Invoice
              </button>
            </div>
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl transition-transform group-hover:scale-110"></div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
            <h4 className="font-bold text-on-surface text-base mb-1">Fee Collection</h4>
            <p className="text-xs text-on-surface-variant mb-5">Current month ({format(new Date(), 'MMM yyyy')})</p>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-on-surface-variant font-medium">Progress</span>
                  <span className="font-bold text-on-surface">{progressPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-surface-bright rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-in-out" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>
              <div className="pt-5 border-t border-outline-variant space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-on-surface-variant font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block"></span> Collected
                  </span>
                  <span className="text-sm font-bold text-on-surface">{collectedAmount.toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-on-surface-variant font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-error inline-block"></span> Remaining
                  </span>
                  <span className="text-sm font-bold text-on-surface">{(totalExpectedAmount - collectedAmount).toLocaleString()} đ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
