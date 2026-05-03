import React, { useState, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle, Clock, FileText, Download, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { FeeReceipt } from '../types';
import { cn } from '../lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Fees() {
  const { students, fees, addFee, updateFee, deleteFee } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeReceipt | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<FeeReceipt | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    studentId: '',
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
    amount: 0,
    status: 'PENDING' as 'PENDING' | 'PAID' | 'OVERDUE',
    issuedDate: new Date().toISOString().split('T')[0],
    paidDate: '',
    notes: ''
  });

  const filteredFees = fees.filter(f => {
    const student = students.find(s => s.id === f.studentId);
    if (!student) return false;
    return student.name.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFee) {
      updateFee({ ...formData, id: editingFee.id });
    } else {
      addFee(formData);
    }
    closeModal();
  };

  const openEditModal = (fee: FeeReceipt) => {
    setEditingFee(fee);
    setFormData({
      studentId: fee.studentId,
      month: fee.month,
      amount: fee.amount,
      status: fee.status,
      issuedDate: fee.issuedDate,
      paidDate: fee.paidDate || '',
      notes: fee.notes || ''
    });
    setIsModalOpen(true);
  };

  const openReceiptModal = (fee: FeeReceipt) => {
    setSelectedReceipt(fee);
    setIsReceiptModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFee(null);
    setFormData({
      studentId: '',
      month: new Date().toISOString().slice(0, 7),
      amount: 0,
      status: 'PENDING',
      issuedDate: new Date().toISOString().split('T')[0],
      paidDate: '',
      notes: ''
    });
  };
  
  const generatePDF = async () => {
    if (!receiptRef.current) return;
    
    try {
      const canvas = await html2canvas(receiptRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Receipt_${selectedReceipt?.id || 'Fee'}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  return (
    <div className="p-gutter pb-24 lg:pb-gutter flex-1 flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-4 lg:mt-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">Fees & Receipts</h2>
          <p className="text-on-surface-variant text-sm mt-1">Manage invoices and track payment statuses.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary text-sm font-semibold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Create Invoice
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant overflow-hidden flex flex-col flex-1">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-on-surface-variant" />
            </div>
            <input
              type="text"
              placeholder="Search by student name..."
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
                <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Billing Period</th>
                <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Issued Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
              {filteredFees.map((fee) => {
                const student = students.find(s => s.id === fee.studentId);
                if (!student) return null;

                const statusColor = fee.status === 'PAID' 
                  ? 'bg-primary/10 text-primary border-primary/20' 
                  : fee.status === 'OVERDUE'
                    ? 'bg-error/10 text-error border-error/20'
                    : 'bg-secondary/10 text-secondary border-secondary/20';

                const statusText = fee.status === 'PAID' ? 'PAID' : fee.status === 'OVERDUE' ? 'OVERDUE' : 'PENDING';

                return (
                  <tr key={fee.id} className="hover:bg-surface-bright transition-colors">
                    <td className="px-6 py-4 font-bold text-on-surface tracking-tight">
                      {student.name}
                      <div className="text-xs text-on-surface-variant font-medium mt-0.5">{student.className}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-on-surface">{fee.month}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{fee.issuedDate}</td>
                    <td className="px-6 py-4 font-bold text-on-surface">
                      {fee.amount.toLocaleString()} đ
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border`, statusColor)}>
                        {statusText}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 text-sm">
                        {fee.status !== 'PAID' && (
                          <button
                            onClick={() => {
                              updateFee({ 
                                ...fee, 
                                status: 'PAID', 
                                paidDate: new Date().toISOString().split('T')[0] 
                              });
                            }}
                            className="px-3 py-1.5 font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => openReceiptModal(fee)}
                          className="p-1.5 text-on-surface-variant hover:text-primary rounded-md hover:bg-primary/10 transition-colors"
                          title="View Receipt"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(fee)}
                          className="p-1.5 text-on-surface-variant hover:text-primary rounded-md hover:bg-primary/10 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this invoice?')) {
                              deleteFee(fee.id);
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
              {filteredFees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant text-sm">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Search className="h-8 w-8 opacity-20" />
                      <p className="font-medium">No fee records found.</p>
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
              {editingFee ? 'Edit Invoice' : 'Create New Invoice'}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5">Billing Period *</label>
                  <input
                    type="month"
                    required
                    value={formData.month}
                    onChange={e => setFormData({ ...formData, month: e.target.value })}
                    className="w-full px-3 py-2 border border-outline bg-surface rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-colors text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5">Amount (VND) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-outline bg-surface rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-colors text-on-surface"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5">Issued Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.issuedDate}
                    onChange={e => setFormData({ ...formData, issuedDate: e.target.value })}
                    className="w-full px-3 py-2 border border-outline bg-surface rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-colors text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5">Status *</label>
                  <select
                    required
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-outline bg-surface rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-colors text-on-surface"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="OVERDUE">OVERDUE</option>
                  </select>
                </div>
              </div>
              {formData.status === 'PAID' && (
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5">Paid Date</label>
                  <input
                    type="date"
                    value={formData.paidDate}
                    onChange={e => setFormData({ ...formData, paidDate: e.target.value })}
                    className="w-full px-3 py-2 border border-outline bg-surface rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-colors text-on-surface"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-outline bg-surface rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-colors text-on-surface placeholder:text-outline-variant"
                  placeholder="Additional notes..."
                />
              </div>
              <div className="pt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-on-surface-variant font-semibold hover:bg-surface-bright rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-on-primary font-semibold rounded-xl shadow-sm hover:bg-primary/90 text-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-primary outline-none"
                >
                  {editingFee ? 'Save Changes' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Receipt Modal */}
      {isReceiptModalOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-surface-container-highest/80 backdrop-blur-sm" onClick={() => setIsReceiptModalOpen(false)} />
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-outline-variant animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest shrink-0">
              <h2 className="text-xl font-bold text-on-surface tracking-tight">Fee Receipt Preview</h2>
              <button onClick={() => setIsReceiptModalOpen(false)} className="p-2 text-on-surface-variant hover:bg-surface-bright rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-surface-container-lowest">
              <div 
                ref={receiptRef}
                className="bg-white text-black p-8 mx-auto max-w-lg shadow-sm border border-gray-200"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
              >
                {/* Header */}
                <div className="text-center mb-6 border-b-2 border-black pb-4">
                  <h1 className="text-2xl font-bold uppercase tracking-widest mb-1">DAA Management Hub</h1>
                  <p className="text-sm">English Tutoring Center</p>
                  <p className="text-sm">Address: 123 Education St, Knowledge City</p>
                  <p className="text-sm">Phone: 0123.456.789</p>
                </div>
                
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold uppercase">Tuition Fee Receipt</h2>
                  <p className="text-sm italic">Date: {new Date().toLocaleDateString()}</p>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-8 w-full border border-gray-300 p-4">
                  <div className="flex justify-between">
                    <span className="font-bold">Student Name:</span>
                    <span>{students.find(s => s.id === selectedReceipt.studentId)?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Class/Subject:</span>
                    <span>{students.find(s => s.id === selectedReceipt.studentId)?.className || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Billing Period:</span>
                    <span>{selectedReceipt.month}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Status:</span>
                    <span className="uppercase font-bold">{selectedReceipt.status}</span>
                  </div>
                </div>

                <div className="w-full mb-8">
                  <table className="w-full text-left border-collapse border border-gray-400">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-400 p-2">Description</th>
                        <th className="border border-gray-400 p-2 text-right">Amount (VND)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-400 p-2">Tuition Fee for {selectedReceipt.month}</td>
                        <td className="border border-gray-400 p-2 text-right font-bold text-lg">
                          {selectedReceipt.amount.toLocaleString()} đ
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Payment QR */}
                <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 mb-8">
                  <p className="font-bold mb-3 text-sm uppercase tracking-wide">Scan to Pay via VietQR</p>
                  <div className="bg-white p-2 rounded-xl shadow-sm">
                    {/* Placeholder static payload for demo, normally dynamic based on bank details */}
                    <QRCodeSVG 
                      value={`https://qr.sepay.vn/img?acc=123456789&bank=MBBank&amount=${selectedReceipt.amount}&des=Hoc phi ${students.find(s => s.id === selectedReceipt.studentId)?.name || ''}`} 
                      size={160} 
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-xs text-center mt-3 text-gray-600">Bank: MBBank<br/>Account: 123456789<br/>Name: DAA ACADEMY</p>
                </div>

                {/* Signatures */}
                <div className="flex justify-between mt-12 pt-8">
                  <div className="text-center w-1/2">
                    <p className="font-bold mb-16">Payer</p>
                    <p className="border-t border-black pt-1 italic text-xs mx-4">(Sign & Full Name)</p>
                  </div>
                  <div className="text-center w-1/2">
                    <p className="font-bold mb-16">Receiver / Cashier</p>
                    <p className="border-t border-black pt-1 italic text-xs mx-4">(Sign & Full Name)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-lowest shrink-0 flex justify-end gap-3">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-4 py-2 text-on-surface-variant font-semibold hover:bg-surface-bright rounded-xl transition-colors text-sm"
              >
                Close
              </button>
              <button
                onClick={generatePDF}
                className="px-4 py-2 bg-primary text-on-primary font-semibold rounded-xl shadow-sm hover:bg-primary/90 transition-colors text-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
