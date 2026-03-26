import React from 'react';
import { Search, Volume2, Settings, ChevronDown, User as UserIcon, Monitor, Minus, Plus, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  return (
    <header className="bg-white border-b h-14 lg:h-10 flex flex-col shrink-0 z-30">
      <div className="flex items-center justify-between px-4 h-full">
        <div className="flex items-center gap-2 lg:gap-4 flex-1">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={20} className="text-gray-600" />
          </button>

          <div className="flex items-center gap-2">
            <img src="https://eservices.tax.gov.ae/assets/images/logo.png" alt="EmaraTax" className="h-5 lg:h-6" referrerPolicy="no-referrer" />
          </div>
          
          <div className="hidden sm:flex items-center gap-2 text-gray-700 hover:text-black cursor-pointer group px-2 py-1 bg-gray-50 rounded">
            <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
              <UserIcon size={12} />
            </div>
            <span className="text-[10px] font-bold truncate max-w-[100px] lg:max-w-[150px]">
              {user?.displayName || user?.email}
            </span>
            <ChevronDown size={10} className="text-gray-400 group-hover:text-black" />
          </div>

          <div className="relative flex-1 max-w-md ml-2 lg:ml-4 hidden md:block">
            <div className="absolute left-0 top-0 bottom-0 px-3 bg-[#F2F2F2] flex items-center border-r border-gray-200 rounded-l">
              <Search className="text-gray-400" size={14} />
            </div>
            <input 
              type="text" 
              placeholder="What are you looking for?"
              onKeyDown={(e) => e.key === 'Enter' && showToast('Searching for: ' + (e.target as HTMLInputElement).value, 'info')}
              className="w-full pl-12 pr-4 py-1.5 bg-white border border-gray-200 focus:border-[#B8860B] rounded text-[11px] outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <div className="hidden lg:flex items-center gap-2 text-gray-500 hover:text-black cursor-pointer">
            <Settings size={14} />
            <span className="text-[10px] font-bold uppercase">User Type</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Volume2 size={14} className="text-gray-500 cursor-pointer hover:text-black hidden sm:block" />
            <span className="text-[11px] font-bold text-gray-700 cursor-pointer hover:text-black">عربي</span>
          </div>

          <div className="hidden lg:flex items-center bg-[#0A192F] rounded overflow-hidden">
            <button className="p-1.5 text-white hover:bg-white/10 transition-colors border-r border-white/10">
              <Monitor size={12} />
            </button>
            <button className="p-1.5 text-white hover:bg-white/10 transition-colors text-[10px] font-bold border-r border-white/10">
              -A
            </button>
            <button className="p-1.5 text-white bg-[#B8860B] transition-colors text-[10px] font-bold border-r border-white/10">
              A
            </button>
            <button className="p-1.5 text-white hover:bg-white/10 transition-colors text-[10px] font-bold">
              +A
            </button>
          </div>
          
          <img src="https://tax.gov.ae/assets/images/logo-en.png" alt="FTA" className="h-6 lg:h-8 ml-1 lg:ml-2" referrerPolicy="no-referrer" />
        </div>
      </div>
    </header>
  );
};

export default Header;
