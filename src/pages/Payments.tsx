import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { dataService } from '../services/dataService';
import { Payment } from '../types';
import { 
  CreditCard, 
  ArrowUpRight, 
  Download, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Plus,
  Mail,
  X,
  ShieldCheck,
  Calendar,
  Hash,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const data = await dataService.getPayments();
        // Only show non-outstanding payments
        setPayments(data.filter(p => p.status !== 'Outstanding'));
      } catch (err) {
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [user]);

  const handleSendReceipt = async (payment: Payment) => {
    try {
      await dataService.sendReceipt({
        amount: payment.amount,
        reference: `PAY-${payment.id.toUpperCase()}`,
        email: 'fta@payaetax.online'
      });
      showToast('Receipt sent to portal and email.', 'success');
    } catch (err) {
      console.error('Error sending receipt:', err);
      showToast('Failed to send receipt.', 'error');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Payments</h1>
          <p className="text-sm sm:text-base text-gray-500">View your payment history and available funds.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#B8860B] text-white rounded-lg text-sm font-semibold hover:bg-[#9A6F09] transition-all w-full sm:w-auto">
          <Plus size={18} />
          Make Advance Payment
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <CheckCircle2 size={24} />
            </div>
          </div>
          <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Funds Available</p>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">AED 0.00</h3>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Clock size={24} />
            </div>
          </div>
          <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Installment Plans</p>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">0 Active</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-50">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Payment History</h2>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 text-left text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-4 sm:px-6 py-4">Description</th>
                <th className="px-4 sm:px-6 py-4">Amount</th>
                <th className="px-4 sm:px-6 py-4">Status</th>
                <th className="px-4 sm:px-6 py-4">Due Date</th>
                <th className="px-4 sm:px-6 py-4">Paid Date</th>
                <th className="px-4 sm:px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center text-gray-500">Loading...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-gray-500">No payment records found.</td></tr>
              ) : (
                payments.map((pay) => (
                  <tr 
                    key={pay.id} 
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedPayment(pay)}
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                          <CreditCard size={18} />
                        </div>
                        <span className="font-bold text-gray-900 text-sm sm:text-base">{pay.type}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 font-bold text-gray-900 text-sm sm:text-base">AED {(pay.amount || 0).toLocaleString()}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase flex items-center gap-1 w-fit ${
                        pay.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                        pay.status === 'Outstanding' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {pay.status === 'Paid' ? <CheckCircle2 size={10} /> : 
                         pay.status === 'Outstanding' ? <AlertCircle size={10} /> : <Clock size={10} />}
                        {pay.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-500">{pay.dueDate}</td>
                    <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-500">
                      {pay.paidAt ? format(new Date(pay.paidAt), 'dd MMM yyyy') : '-'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        {pay.status === 'Paid' && (
                          <button 
                            onClick={() => handleSendReceipt(pay)}
                            className="p-2 text-gray-400 hover:text-brand-accent transition-colors"
                            title="Send Receipt to Portal & Email"
                          >
                            <Mail size={18} />
                          </button>
                        )}
                        <button className="p-2 text-gray-400 hover:text-[#B8860B] transition-colors">
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Details Modal */}
      <AnimatePresence>
        {selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPayment(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-[#0A192F] p-6 sm:p-8 text-white relative">
                <button 
                  onClick={() => setSelectedPayment(null)}
                  className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="p-3 sm:p-4 bg-[#B8860B] rounded-xl sm:rounded-2xl shadow-lg">
                    <CreditCard size={24} className="sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight uppercase">{selectedPayment.type}</h3>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Transaction Details</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black">AED {selectedPayment.amount.toLocaleString()}</span>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest",
                    selectedPayment.status === 'Paid' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                  )}>
                    {selectedPayment.status}
                  </span>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Hash size={14} />
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Reference Number</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-brand-primary uppercase">PAY-{selectedPayment.id.toUpperCase()}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar size={14} />
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Due Date</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-brand-primary uppercase">{selectedPayment.dueDate}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-400">
                      <CheckCircle2 size={14} />
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Payment Status</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-brand-primary uppercase">{selectedPayment.status}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock size={14} />
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Paid Date</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-brand-primary uppercase">
                      {selectedPayment.paidAt ? format(new Date(selectedPayment.paidAt), 'dd MMM yyyy') : 'Pending'}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <ShieldCheck className="text-emerald-500" size={20} />
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-black text-brand-primary uppercase tracking-tight">Verified Transaction</p>
                      <p className="text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase tracking-widest">Secured by Federal Tax Authority</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <button 
                    onClick={() => handleSendReceipt(selectedPayment)}
                    className="flex items-center justify-center gap-2 py-3 sm:py-4 bg-gray-100 text-brand-primary rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                  >
                    <Mail size={16} />
                    Send Receipt
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 sm:py-4 bg-brand-primary text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-brand-primary/20">
                    <Download size={16} />
                    Download PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper for conditional classes
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default PaymentsPage;
