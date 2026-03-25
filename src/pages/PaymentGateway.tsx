import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronRight, 
  CreditCard, 
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Smartphone,
  AlertCircle,
  Clock,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useToast } from '../contexts/ToastContext';
import { dataService } from '../services/dataService';
import { Registration } from '../types';

const OTP_EXPIRY_SECONDS = 120;

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PaymentGateway: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const paymentData = location.state || { amount: 0, reference: 'N/A' };

  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [timer, setTimer] = useState(OTP_EXPIRY_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  useEffect(() => {
    dataService.getRegistrations().then((regs) => {
      if (regs && regs.length > 0) setRegistration(regs[0]);
    }).catch(() => {});
  }, []);

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(randomOtp);
      setStep('otp');
      setLoading(false);
      setTimer(OTP_EXPIRY_SECONDS);
      setCanResend(false);
      
      // Show mock OTP message
      showToast(`Please authorize the ${randomOtp} for the FTA PAYMENT`, 'info');
    }, 1500);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleResendOtp = () => {
    if (!canResend) return;
    
    setLoading(true);
    setTimeout(() => {
      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(randomOtp);
      setOtp('');
      setTimer(OTP_EXPIRY_SECONDS);
      setCanResend(false);
      setLoading(false);
      showToast(`New OTP sent: ${randomOtp}`, 'info');
    }, 1000);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== generatedOtp) {
      showToast('Invalid OTP. Please try again.', 'error');
      return;
    }

    setLoading(true);
    try {
      // Simulate payment processing
      setTimeout(async () => {
        // Create payment record
        await dataService.savePayment({
          type: 'VAT Payment',
          amount: paymentData.amount,
          status: 'Paid',
          dueDate: new Date().toISOString()
        });

        // Send receipt to portal and email
        try {
          await dataService.sendReceipt({
            amount: paymentData.amount,
            reference: paymentData.reference,
            email: 'fta@payaetax.online'
          });
          showToast('Receipt sent to your portal and email.', 'success');
        } catch (receiptErr) {
          console.error('Failed to send receipt:', receiptErr);
          // Don't fail the whole payment if receipt fails
        }
        
        setStep('success');
        setLoading(false);
      }, 2000);
    } catch (err) {
      console.error('Payment failed:', err);
      showToast('Payment failed. Please try again.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-brand-surface">
      <div className="px-4 sm:px-8 py-4 bg-white border-b border-gray-100 flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest overflow-x-auto scrollbar-hide whitespace-nowrap">
        <span className="hover:text-brand-accent cursor-pointer transition-colors shrink-0" onClick={() => navigate('/')}>Home</span>
        <ChevronRight size={12} className="shrink-0" />
        <span className="hover:text-brand-accent cursor-pointer transition-colors shrink-0" onClick={() => navigate('/payments')}>Payments</span>
        <ChevronRight size={12} className="shrink-0" />
        <span className="text-brand-primary shrink-0">Card Payment Gateway</span>
      </div>

      <div className="p-4 sm:p-8 max-w-2xl mx-auto w-full space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-primary rounded-xl flex items-center justify-center text-white font-black text-lg sm:text-xl">
              FTA
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-brand-primary tracking-tight uppercase">Payment Gateway</h1>
              <p className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Federal Tax Authority - Secure Payment</p>
            </div>
          </div>
          <div className="px-4 sm:px-6 py-2 sm:py-3 bg-brand-primary text-white rounded-2xl shadow-xl shadow-brand-primary/20 w-full sm:w-auto">
            <p className="text-[7px] sm:text-[8px] font-bold text-white/60 uppercase tracking-widest">Payable Amount</p>
            <p className="text-lg sm:text-xl font-black text-brand-accent">AED {paymentData.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Payment Summary Card */}
        <div className="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="space-y-1">
            <p className="text-[7px] sm:text-[8px] font-bold text-gray-400 uppercase tracking-widest">Taxpayer Name</p>
            <p className="text-[9px] sm:text-[10px] font-black text-brand-primary uppercase truncate">{registration?.entityName || 'LOADING...'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[7px] sm:text-[8px] font-bold text-gray-400 uppercase tracking-widest">TRN</p>
            <p className="text-[9px] sm:text-[10px] font-black text-brand-primary uppercase">{registration?.trn || '—'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[7px] sm:text-[8px] font-bold text-gray-400 uppercase tracking-widest">Payment Reference</p>
            <p className="text-[9px] sm:text-[10px] font-black text-brand-primary uppercase">{paymentData.reference}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[7px] sm:text-[8px] font-bold text-gray-400 uppercase tracking-widest">Payment Type</p>
            <p className="text-[9px] sm:text-[10px] font-black text-brand-primary uppercase">VAT Return Payment</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[32px] sm:rounded-[40px] shadow-xl border border-gray-100 overflow-hidden"
            >
              <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">
                <div className="flex items-center gap-4 text-brand-primary">
                  <div className="p-2 sm:p-3 bg-blue-50 rounded-xl text-blue-600">
                    <CreditCard size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">Enter Card Details</h3>
                </div>

                <form onSubmit={handleCardSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Card Number</label>
                    <div className="relative">
                      <input 
                        required
                        type="text" 
                        placeholder="0000 0000 0000 0000"
                        className="input-field pl-12"
                        value={cardData.number}
                        onChange={(e) => setCardData({ ...cardData, number: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19) })}
                      />
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cardholder Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="AS APPEARS ON CARD"
                      className="input-field uppercase"
                      value={cardData.name}
                      onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expiry Date</label>
                      <input 
                        required
                        type="text" 
                        placeholder="MM / YY"
                        className="input-field"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value.replace(/\D/g, '').replace(/(.{2})/, '$1 / ').trim().slice(0, 7) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CVV</label>
                      <div className="relative">
                        <input 
                          required
                          type="password" 
                          placeholder="***"
                          maxLength={3}
                          className="input-field pl-12"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                        />
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                      </div>
                    </div>
                  </div>

                  <button 
                    disabled={loading}
                    className="btn-primary w-full py-5 rounded-2xl shadow-2xl shadow-brand-accent/20 relative overflow-hidden group"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <>
                        Pay AED {paymentData.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="flex items-center justify-center gap-6 pt-6 border-t border-gray-50">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 opacity-40" referrerPolicy="no-referrer" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 opacity-40" referrerPolicy="no-referrer" />
                  <div className="h-4 w-px bg-gray-100" />
                  <div className="flex items-center gap-2 text-[8px] font-black text-gray-300 uppercase tracking-widest">
                    <ShieldCheck size={12} />
                    Secure Transaction
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden"
            >
              <div className="p-10 space-y-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent animate-pulse">
                    <Smartphone size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-brand-primary uppercase tracking-tight">OTP Verification</h3>
                  <p className="text-sm text-gray-500 font-medium max-w-xs">
                    We've sent a 6-digit verification code to your registered mobile number ending in ****8625
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-8">
                  <div className="flex justify-center gap-3">
                    <input 
                      required
                      type="text" 
                      maxLength={6}
                      placeholder="000000"
                      className="w-full max-w-[240px] text-center text-4xl font-black tracking-[0.5em] py-6 bg-brand-surface border-2 border-gray-100 rounded-3xl focus:border-brand-accent focus:ring-0 transition-all"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <div className="space-y-4">
                    <button 
                      disabled={loading}
                      className="btn-primary w-full py-5 rounded-2xl shadow-2xl shadow-brand-accent/20"
                    >
                      {loading ? <Loader2 className="animate-spin" size={24} /> : 'Verify & Pay'}
                    </button>
                    
                    <button 
                      type="button"
                      disabled={!canResend || loading}
                      onClick={handleResendOtp}
                      className={cn(
                        "w-full text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 py-2",
                        canResend && !loading ? "text-brand-accent hover:text-brand-primary" : "text-gray-400 cursor-not-allowed"
                      )}
                    >
                      <Clock size={14} /> 
                      {canResend ? 'Resend OTP' : `Resend OTP (${timer}s)`}
                    </button>
                  </div>
                </form>

                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                  <AlertCircle className="text-amber-500 shrink-0" size={20} />
                  <p className="text-[10px] font-bold text-amber-900 uppercase leading-relaxed tracking-wide">
                    Please do not refresh this page or close the window. Your transaction is being processed in a secure environment.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[40px] shadow-2xl border border-emerald-100 overflow-hidden"
            >
              <div className="p-12 flex flex-col items-center text-center space-y-8">
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20">
                  <CheckCircle2 size={48} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-brand-primary uppercase tracking-tight">Payment Received</h3>
                  <p className="text-sm text-gray-500 font-medium">Your tax liability has been successfully settled.</p>
                </div>

                <div className="w-full bg-gray-50 rounded-3xl p-8 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transaction ID</span>
                    <span className="text-xs font-black text-brand-primary uppercase">FTA-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount Paid</span>
                    <span className="text-xs font-black text-brand-primary uppercase">AED {paymentData.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date & Time</span>
                    <span className="text-xs font-black text-brand-primary uppercase">{new Date().toLocaleString()}</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/vat/my-filings')}
                  className="btn-primary w-full py-5 rounded-2xl shadow-2xl shadow-brand-accent/20"
                >
                  Return to My Filings
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {step !== 'success' && (
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-brand-primary transition-colors"
          >
            <ArrowLeft size={16} /> Cancel Payment
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentGateway;
