import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { dataService } from '../services/dataService';
import { 
  ChevronRight, 
  Search, 
  LayoutGrid,
  Briefcase,
  User as UserIcon,
  MoreHorizontal,
  Star,
  FileText,
  ChevronDown,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [allFilings, setAllFilings] = useState<any[]>([]);
  const [allRegistrations, setAllRegistrations] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [allCorrespondence, setAllCorrespondence] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const [filings, regs, payments, correspondence] = await Promise.all([
          dataService.getVATReturns(),
          dataService.getRegistrations(),
          dataService.getPayments(),
          dataService.getCorrespondence()
        ]);

        setAllFilings(filings);
        setAllRegistrations(regs);
        setAllPayments(payments);
        setAllCorrespondence(correspondence);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const stats = useMemo(() => {
    const filteredFilings = selectedEntity 
      ? allFilings.filter(f => f.vatRef === selectedEntity.trn)
      : allFilings;
    
    const filteredPayments = selectedEntity
      ? allPayments.filter(p => p.userId === selectedEntity.userId)
      : allPayments;

    const filteredCorrespondence = selectedEntity
      ? allCorrespondence.filter(c => c.userId === selectedEntity.userId)
      : allCorrespondence;

    const pendingCount = filteredFilings.filter((f: any) => f.status === 'Overdue' || f.status === 'Draft').length;
    const totalPaid = filteredPayments
      .filter((p: any) => p.status === 'Paid')
      .reduce((acc: number, curr: any) => acc + curr.amount, 0);

    const activeRegs = selectedEntity 
      ? (selectedEntity.status === 'Active' ? 1 : 0)
      : allRegistrations.filter(r => r.status === 'Active').length;

    const refundRequests = filteredFilings.filter((f: any) => f.formData?.refundRequest === 'Yes').length;
    const auditCases = filteredCorrespondence.filter((c: any) => c.type === 'Audit').length;
    const totalRevenue = filteredFilings.reduce((acc: number, curr: any) => acc + (curr.totalSales || 0), 0);

    if (selectedEntity) {
      return [
        { 
          label: 'Pending Returns', 
          value: pendingCount.toString(), 
          icon: Clock, 
          color: 'text-amber-500', 
          bg: 'bg-amber-50' 
        },
        { 
          label: 'Total VAT Paid', 
          value: `AED ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
          icon: TrendingUp, 
          color: 'text-emerald-500', 
          bg: 'bg-emerald-50' 
        },
        { 
          label: 'Active TRNs', 
          value: activeRegs.toString(), 
          icon: ShieldCheck, 
          color: 'text-blue-500', 
          bg: 'bg-blue-50' 
        },
        { 
          label: 'Compliance Score', 
          value: '98%', 
          icon: Activity, 
          color: 'text-indigo-500', 
          bg: 'bg-indigo-50' 
        },
      ];
    }

    return [
      { 
        label: 'Total Tax Collected', 
        value: `AED ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 
        icon: TrendingUp, 
        color: 'text-emerald-500', 
        bg: 'bg-emerald-50' 
      },
      { 
        label: 'Active Registrations', 
        value: activeRegs.toString(), 
        icon: ShieldCheck, 
        color: 'text-blue-500', 
        bg: 'bg-blue-50' 
      },
      { 
        label: 'Refund Requests', 
        value: refundRequests.toString(), 
        icon: FileText, 
        color: 'text-amber-500', 
        bg: 'bg-amber-50' 
      },
      { 
        label: 'Open Audit Cases', 
        value: auditCases.toString(), 
        icon: AlertCircle, 
        color: 'text-red-500', 
        bg: 'bg-red-50' 
      },
      { 
        label: 'Total Revenue Base', 
        value: `AED ${(totalRevenue / 1000000).toFixed(1)}M`, 
        icon: Activity, 
        color: 'text-indigo-500', 
        bg: 'bg-indigo-50' 
      },
      { 
        label: 'Pending Filings', 
        value: pendingCount.toString(), 
        icon: Clock, 
        color: 'text-amber-500', 
        bg: 'bg-amber-50' 
      },
    ];
  }, [selectedEntity, allFilings, allPayments, allRegistrations, allCorrespondence]);

  const recentFilings = useMemo(() => {
    const filtered = selectedEntity 
      ? allFilings.filter(f => f.vatRef === selectedEntity.trn)
      : allFilings;
    
    return filtered.sort((a: any, b: any) => 
      new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    ).slice(0, 5);
  }, [selectedEntity, allFilings]);

  const chartData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
  ];

  if (selectedEntity) {
    return (
      <div className="flex flex-col min-h-full bg-brand-surface">
        {/* Advanced Header */}
        <div className="px-4 sm:px-8 py-4 flex items-center justify-between bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setSelectedEntity(null)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
            >
              <ChevronRight className="rotate-180" size={18} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xs sm:text-sm font-black text-brand-primary uppercase tracking-tight truncate max-w-[150px] sm:max-w-none">{selectedEntity.entityName}</h1>
              <div className="flex items-center gap-2 text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span className="hidden xs:inline">Dashboard</span>
                <ChevronRight size={8} className="hidden xs:inline" />
                <span className="text-brand-accent">Overview</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className={cn(
              "flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-wider",
              selectedEntity.status === 'Active' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            )}>
              <div className={cn(
                "w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full animate-pulse",
                selectedEntity.status === 'Active' ? "bg-emerald-500" : "bg-amber-500"
              )} />
              <span className="hidden xs:inline">{selectedEntity.status} Status</span>
              <span className="xs:hidden">{selectedEntity.status}</span>
            </div>
            <button className="p-1.5 sm:p-2 text-gray-400 hover:text-brand-accent transition-colors">
              <Star size={18} />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={cn("p-2 sm:p-3 rounded-xl transition-colors", stat.bg)}>
                    <stat.icon className={stat.color} size={20} />
                  </div>
                  <ArrowUpRight className="text-gray-300 group-hover:text-brand-accent transition-colors" size={18} />
                </div>
                <p className="text-xl sm:text-2xl font-black text-brand-primary mb-1">{stat.value}</p>
                <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Chart */}
            <div className="lg:col-span-2 bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-brand-primary uppercase tracking-tight">VAT Filing Trends</h3>
                  <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Monthly performance overview</p>
                </div>
                <select className="bg-gray-50 border-none text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-lg px-3 py-2 outline-none w-full sm:w-auto">
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                </select>
              </div>
              <div className="h-[200px] sm:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }} 
                    />
                    <Tooltip 
                      cursor={{ fill: '#F8FAFC' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" fill="#B8860B" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions & Notifications */}
            <div className="space-y-6 sm:space-y-8">
              <div className="bg-brand-primary p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-brand-accent/30 transition-all" />
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight mb-4 relative z-10">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 relative z-10">
                  <button 
                    onClick={() => navigate('/vat/new')}
                    className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white/5 hover:bg-white/10 rounded-xl sm:rounded-2xl transition-all border border-white/10"
                  >
                    <FileText className="text-brand-accent" size={20} />
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-center">New VAT Return</span>
                  </button>
                  <button 
                    onClick={() => navigate('/payments')}
                    className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white/5 hover:bg-white/10 rounded-xl sm:rounded-2xl transition-all border border-white/10"
                  >
                    <TrendingUp className="text-emerald-400" size={20} />
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-center">Make Payment</span>
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-xs sm:text-sm font-black text-brand-primary uppercase tracking-tight mb-4 sm:mb-6">Critical Alerts</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-red-50 rounded-xl sm:rounded-2xl border border-red-100">
                    <AlertCircle className="text-red-500 shrink-0" size={18} />
                    <div>
                      <p className="text-[10px] sm:text-[11px] font-bold text-red-900 leading-tight">Trade License Expiring</p>
                      <p className="text-[8px] sm:text-[9px] text-red-700 mt-1">Your license expires in 14 days. Renew now.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-amber-50 rounded-xl sm:rounded-2xl border border-amber-100">
                    <Clock className="text-amber-500 shrink-0" size={18} />
                    <div>
                      <p className="text-[10px] sm:text-[11px] font-bold text-amber-900 leading-tight">VAT Return Due</p>
                      <p className="text-[8px] sm:text-[9px] text-amber-700 mt-1">Period Q1 2026 is due in 8 days.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-black text-brand-primary uppercase tracking-tight">Recent Filings</h3>
                <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">History of your tax submissions</p>
              </div>
              <button 
                onClick={() => navigate('/vat/my-filings')}
                className="text-[9px] sm:text-[10px] font-bold text-brand-accent uppercase tracking-widest hover:underline"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-4 sm:px-8 py-3 sm:py-4 text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Period</th>
                    <th className="px-4 sm:px-8 py-3 sm:py-4 text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-4 sm:px-8 py-3 sm:py-4 text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Net VAT</th>
                    <th className="px-4 sm:px-8 py-3 sm:py-4 text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Updated</th>
                    <th className="px-4 sm:px-8 py-3 sm:py-4 text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 sm:px-8 py-8 sm:py-12 text-center text-gray-400 font-bold uppercase tracking-widest">Loading records...</td>
                    </tr>
                  ) : recentFilings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 sm:px-8 py-8 sm:py-12 text-center text-gray-400 font-bold uppercase tracking-widest">No recent filings found</td>
                    </tr>
                  ) : (
                    recentFilings.map((filing) => (
                      <tr key={filing.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-4 sm:px-8 py-4 sm:py-6">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-1.5 sm:p-2 bg-gray-100 rounded-lg text-gray-400 group-hover:bg-brand-accent/10 group-hover:text-brand-accent transition-colors">
                              <FileText size={14} className="sm:size-16" />
                            </div>
                            <span className="text-[11px] sm:text-xs font-bold text-brand-primary uppercase tracking-tight">{filing.period}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-8 py-4 sm:py-6">
                          <span className={cn(
                            "px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest",
                            filing.status === 'Submitted' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                          )}>
                            {filing.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-8 py-4 sm:py-6">
                          <span className="text-[11px] sm:text-xs font-bold text-brand-primary">AED {(filing.netVAT || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-4 sm:px-8 py-4 sm:py-6">
                          <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {filing.updatedAt ? new Date(filing.updatedAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-8 py-4 sm:py-6 text-right">
                          <button 
                            onClick={() => navigate(`/vat/${filing.id}`)}
                            className="p-1.5 sm:p-2 text-gray-300 hover:text-brand-accent transition-colors"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-brand-surface">
      <div className="p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto w-full space-y-8 lg:space-y-12">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-primary tracking-tight mb-2">
              Welcome back, <span className="text-brand-accent">{user?.displayName || 'User'}</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs">Authority Dashboard &bull; {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={async () => {
                try {
                  await dataService.seedData();
                  showToast('Demo data seeded successfully!', 'success');
                  window.location.reload();
                } catch (error) {
                  showToast('Failed to seed data.', 'error');
                }
              }}
              className="px-6 py-3 bg-brand-surface border border-brand-accent text-brand-accent rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-accent hover:text-white transition-all shadow-sm"
            >
              Seed Demo Data
            </button>
            <button className="btn-primary w-full sm:w-auto justify-center">
              <Briefcase size={20} />
              New Taxable Person
            </button>
          </div>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={cn("p-2 sm:p-3 rounded-xl transition-colors", stat.bg)}>
                  <stat.icon className={stat.color} size={20} />
                </div>
                <ArrowUpRight className="text-gray-300 group-hover:text-brand-accent transition-colors" size={18} />
              </div>
              <p className="text-xl sm:text-2xl font-black text-brand-primary mb-1">{stat.value}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="relative group">
          <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-accent transition-colors">
            <Search size={20} className="sm:size-24" />
          </div>
          <input 
            type="text" 
            placeholder="Search by TRN or Name..."
            className="w-full pl-12 sm:pl-16 pr-24 sm:pr-48 py-4 sm:py-6 bg-white border border-gray-100 rounded-2xl sm:rounded-3xl text-xs sm:text-sm font-bold text-brand-primary outline-none focus:ring-4 focus:ring-brand-accent/5 focus:border-brand-accent transition-all shadow-sm"
          />
          <button className="absolute right-2 top-2 bottom-2 px-4 sm:px-8 bg-brand-primary text-white text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl sm:rounded-2xl hover:bg-black transition-all shadow-lg">
            Search
          </button>
        </div>

        {/* Entity List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutGrid size={20} className="text-brand-accent sm:size-24" />
              <h3 className="text-xs sm:text-sm font-black text-brand-primary uppercase tracking-tight">Taxable Person List</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sort:</span>
              <button className="text-[9px] sm:text-[10px] font-bold text-brand-primary uppercase tracking-widest flex items-center gap-1">
                Recent <ChevronDown size={12} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {allRegistrations.map((reg) => (
              <motion.div 
                key={reg.id}
                whileHover={{ y: -8 }}
                onClick={() => setSelectedEntity(reg)}
                className="bg-white rounded-2xl sm:rounded-[32px] shadow-sm border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-brand-primary/5 transition-all"
              >
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <div className="w-12 h-12 sm:w-16 h-16 bg-brand-surface rounded-xl sm:rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-brand-accent/10 group-hover:text-brand-accent transition-colors">
                      <UserIcon size={24} className="sm:size-32" />
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest",
                      reg.status === 'Active' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {reg.status}
                    </div>
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-brand-primary leading-tight uppercase mb-2 group-hover:text-brand-accent transition-colors">
                    {reg.entityName}
                  </h4>
                  <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">TRN: {reg.trn}</p>
                  <p className="text-[8px] sm:text-[9px] font-bold text-brand-accent uppercase tracking-widest mt-2">{reg.taxType}</p>
                </div>
                <div className="px-6 sm:px-8 py-4 sm:py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between group-hover:bg-brand-primary transition-all">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-brand-primary group-hover:text-white transition-all">Access Dashboard</span>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-white group-hover:translate-x-1 transition-all sm:size-18" />
                </div>
              </motion.div>
            ))}

            {/* Empty State / Add New */}
            <div className="bg-brand-surface border-2 border-dashed border-gray-200 rounded-2xl sm:rounded-[32px] flex flex-col items-center justify-center p-6 sm:p-8 text-center group hover:border-brand-accent transition-all cursor-pointer min-h-[200px]">
              <div className="w-12 h-12 sm:w-16 h-16 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-brand-accent transition-colors shadow-sm mb-4">
                <span className="text-2xl sm:text-3xl font-light">+</span>
              </div>
              <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-brand-primary transition-colors">Add New Profile</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
