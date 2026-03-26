import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight, Loader2, Building2, Plus } from 'lucide-react';
import { useAuth, Company } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [tab, setTab] = useState<'login' | 'register' | 'company'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyTRN, setCompanyTRN] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register, registerCompany, companies, fetchCompanies } = useAuth();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setError('');
    setIsLoading(true);
    
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed.');
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !displayName || !selectedCompany) {
      setError('Please fill in all required fields and select a company.');
      return;
    }

    if (password.length < 5) {
      setError('Password should be at least 5 characters.');
      return;
    }

    setError('');
    setIsLoading(true);
    
    try {
      await register(username, password, displayName, selectedCompany.id);
      navigate('/');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed.');
      setIsLoading(false);
    }
  };

  const handleCompanyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !companyEmail) {
      setError('Please fill in company name and email.');
      return;
    }

    setError('');
    setIsLoading(true);
    
    try {
      const newCompany = await registerCompany(companyName, companyEmail, companyTRN || undefined);
      setSelectedCompany(newCompany);
      setCompanyName('');
      setCompanyEmail('');
      setCompanyTRN('');
      setTab('register');
    } catch (err: any) {
      console.error('Company registration error:', err);
      setError(err.message || 'Company registration failed.');
      setIsLoading(false);
    }
  };

  if (isLoading && tab === 'login') {
    return (
      <div className="min-h-screen bg-[#0A192F] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-[#B8860B] rounded-2xl flex items-center justify-center font-bold text-3xl text-white shadow-2xl animate-pulse">
            E
          </div>
          <div className="flex items-center gap-3 text-white">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-lg font-medium">Authenticating with EmaraTax...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A192F] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="mb-6 sm:mb-8 flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#B8860B] rounded-xl flex items-center justify-center font-bold text-xl sm:text-2xl text-white shadow-lg shadow-[#B8860B]/20">
          E
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">EmaraTax Authority</h1>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 py-4 px-4 font-medium text-center transition-colors ${
              tab === 'login'
                ? 'border-b-2 border-[#B8860B] text-[#B8860B] bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); }}
            className={`flex-1 py-4 px-4 font-medium text-center transition-colors ${
              tab === 'register'
                ? 'border-b-2 border-[#B8860B] text-[#B8860B] bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => { setTab('company'); setError(''); }}
            className={`flex-1 py-4 px-4 font-medium text-center transition-colors text-sm ${
              tab === 'company'
                ? 'border-b-2 border-[#B8860B] text-[#B8860B] bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            New Company
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* LOGIN TAB */}
          {tab === 'login' && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-sm text-gray-500">Sign in to access your company portal</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 outline-none focus:border-[#B8860B] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 outline-none focus:border-[#B8860B] focus:bg-white transition-all"
                    />
                  </div>
                </div>

            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-[#0A192F] text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg group mt-6"
            >
              {isLogin ? 'Sign In to Portal' : 'Register Account'}
              <ArrowRight size={18} className="ml-auto text-white/30 group-hover:text-[#B8860B] group-hover:translate-x-1 transition-all" />
            </button>

            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-sm text-gray-500 hover:text-[#B8860B] font-medium transition-colors"
              >
                {isLogin ? "Don't have an account? Register here" : "Already have an account? Sign in"}
              </button>
            </div>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Company</label>
                  <select
                    value={selectedCompany?.id || ''}
                    onChange={(e) => {
                      const company = companies.find(c => c.id === e.target.value) || null;
                      setSelectedCompany(company);
                    }}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 outline-none focus:border-[#B8860B] focus:bg-white transition-all"
                  >
                    <option value="">Select or register a company</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 outline-none focus:border-[#B8860B] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 outline-none focus:border-[#B8860B] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 outline-none focus:border-[#B8860B] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading || !selectedCompany}
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-[#0A192F] text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg group mt-6 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : <>
                    Create Account <ArrowRight size={18} className="ml-auto text-white/30 group-hover:text-[#B8860B] group-hover:translate-x-1 transition-all" />
                  </>}
                </button>
              </form>
            </>
          )}

          {/* COMPANY TAB */}
          {tab === 'company' && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Register Company</h2>
                <p className="text-sm text-gray-500">Add a new company to the system</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleCompanyRegister} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter company name"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 outline-none focus:border-[#B8860B] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Company Email</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="email"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      placeholder="company@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 outline-none focus:border-[#B8860B] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tax Registration Number (Optional)</label>
                  <input 
                    type="text"
                    value={companyTRN}
                    onChange={(e) => setCompanyTRN(e.target.value)}
                    placeholder="100234567890003"
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 outline-none focus:border-[#B8860B] focus:bg-white transition-all"
                  />
                </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
              <Shield className="text-blue-600 shrink-0" size={20} />
              <p className="text-[11px] text-blue-700 leading-relaxed">
                Use your official credentials. For first time setup, use <strong>admin</strong> / <strong>admin</strong> to access the dashboard.
              </p>
            </div>
          </form>
        </div>

        <div className="p-6 bg-gray-50 border-t text-center">
          <p className="text-xs text-gray-400">
            By signing in, you agree to our <a href="#" className="text-[#B8860B] hover:underline">Terms of Service</a>
          </p>
        </div>
      </div>

      <div className="mt-8 text-gray-500 text-sm flex gap-6">
        <a href="#" className="hover:text-white transition-colors">Help</a>
        <a href="#" className="hover:text-white transition-colors">Support</a>
        <a href="#" className="hover:text-white transition-colors">EN</a>
      </div>
    </div>
  );
};

export default Login;
