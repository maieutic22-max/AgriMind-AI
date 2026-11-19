import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../ui/StatusBadge';
import { systemApi } from '../../services/api';
import { Bell, User, LogOut, Menu } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const probeHealth = async () => {
      try {
        const res = await systemApi.getHealth();
        if (isMounted) {
          if (res.status === 'healthy') {
            setApiStatus('connected');
          } else {
            setApiStatus('disconnected');
          }
        }
      } catch (err) {
        if (isMounted) {
          setApiStatus('disconnected');
        }
      }
    };

    probeHealth();
    const interval = setInterval(probeHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getBreadcrumb = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Executive Farm Dashboard';
      case '/farm-setup':
        return 'Farm & Field Configuration';
      case '/digital-twin':
        return '3D Agricultural Digital Twin';
      case '/crop-intelligence':
        return 'Crop, Soil & Agronomic Intelligence';
      case '/farm-management':
        return 'Farm Business & Operations';
      case '/marketplace':
        return 'Farm Equipment Sharing & Rental';
      case '/ai-assistant':
        return 'Agentic AI Farm Manager';
      case '/settings':
        return 'Settings & System Preferences';
      default:
        return 'Farm Workspace';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
            Green Valley Farm (Demo)
          </span>
          <h1 className="text-base font-bold text-slate-800 leading-tight">
            {getBreadcrumb()}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* Backend Live Health Pill */}
        <StatusBadge
          status={apiStatus}
          label={
            apiStatus === 'connected'
              ? 'Backend API Connected'
              : apiStatus === 'disconnected'
              ? 'Backend Offline'
              : 'Checking API...'
          }
        />

        {/* Notifications Icon (Placeholder) */}
        <button
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-forest-600"></span>
        </button>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-forest-800 text-white flex items-center justify-center font-bold text-xs">
              {user?.fullName?.charAt(0) || 'F'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-none">
                {user?.fullName || 'Farmer'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 capitalize">
                {user?.role?.toLowerCase() || 'Farmer'}
              </div>
            </div>
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setProfileOpen(false)}
            >
              <div className="px-4 py-2 border-b border-slate-100 text-xs">
                <p className="font-semibold text-slate-800">{user?.fullName}</p>
                <p className="text-slate-500 truncate">{user?.email}</p>
              </div>
              <Link
                to="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-forest-50 hover:text-forest-800"
              >
                <User className="w-3.5 h-3.5" />
                Account Settings
              </Link>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
