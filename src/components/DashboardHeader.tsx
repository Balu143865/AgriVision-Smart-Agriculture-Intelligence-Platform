import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  ChevronDown,
  Sun,
  Moon,
  MapPin,
  Menu,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFarm } from '../context/FarmContext';
import { useTheme } from '../context/ThemeContext';
import { DashboardTab } from '../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onSearchQuery?: (query: string) => void;
  onSelectTab?: (tab: DashboardTab) => void;
}

export const DashboardHeader: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onSearchQuery,
  onSelectTab,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const {
    selectedFarm,
    setSelectedFarm,
    farms,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useFarm();

  const [farmDropdownOpen, setFarmDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const closeAllDropdowns = () => {
    setFarmDropdownOpen(false);
    setNotifDropdownOpen(false);
    setProfileDropdownOpen(false);
  };

  // Close dropdowns on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllDropdowns();
        setIsMobileSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    if (onSearchQuery) {
      onSearchQuery(e.target.value);
    }
  };

  const isAnyDropdownOpen = farmDropdownOpen || notifDropdownOpen || profileDropdownOpen;

  return (
    <header className={`sticky top-0 z-30 h-16 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 transition-colors duration-300 border-b ${
      isDark
        ? 'bg-[#08100c]/90 border-emerald-950/70 text-white'
        : 'bg-white/90 border-emerald-100 text-slate-900 shadow-xs'
    }`}>
      {/* Global backdrop to dismiss dropdowns on outside click */}
      {isAnyDropdownOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:bg-transparent"
          onClick={closeAllDropdowns}
          aria-hidden="true"
        />
      )}

      {/* Left side: Mobile trigger & Farm selector & Date */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
        <button
          onClick={onOpenMobileMenu}
          className={`p-2 rounded-lg transition-colors shrink-0 md:hidden active:scale-95 ${
            isDark
              ? 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          aria-label="Open Navigation Menu"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 text-emerald-400" />
        </button>

        {/* Farm Selector Dropdown */}
        <div className="relative min-w-0">
          <button
            id="farm-selector-btn"
            onClick={() => {
              setFarmDropdownOpen(!farmDropdownOpen);
              setNotifDropdownOpen(false);
              setProfileDropdownOpen(false);
            }}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs transition-colors border max-w-full active:scale-[0.98] ${
              isDark
                ? 'bg-emerald-950/40 hover:bg-emerald-900/40 border-emerald-800/40 text-zinc-200'
                : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900 font-medium'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="font-medium max-w-[110px] xs:max-w-[140px] sm:max-w-[200px] md:max-w-[260px] truncate">
              {selectedFarm}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-zinc-400' : 'text-slate-400'}`} />
          </button>

          {farmDropdownOpen && (
            <div className={`fixed left-3 right-3 sm:left-0 sm:right-auto sm:absolute top-16 sm:top-auto sm:mt-2 sm:w-72 max-w-sm rounded-xl border shadow-2xl p-2 z-50 text-xs ${
              isDark
                ? 'bg-[#0b1611] border-emerald-800/60'
                : 'bg-white border-emerald-200 shadow-slate-300/40'
            }`}>
              <div className={`px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider ${
                isDark ? 'text-zinc-400' : 'text-slate-500'
              }`}>
                Select Active Farm Plot
              </div>
              <div className="space-y-1 mt-1 max-h-60 overflow-y-auto">
                {farms.map(farm => (
                  <button
                    key={farm}
                    onClick={() => {
                      setSelectedFarm(farm);
                      setFarmDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                      selectedFarm === farm
                        ? isDark
                          ? 'bg-emerald-900/40 text-emerald-300 font-semibold border border-emerald-700/40'
                          : 'bg-emerald-100 text-emerald-900 font-semibold border border-emerald-300'
                        : isDark
                          ? 'text-zinc-300 hover:bg-emerald-950/40'
                          : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{farm}</span>
                    {selectedFarm === farm && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Current Date Badge (Desktop only) */}
        <div className={`hidden lg:flex items-center gap-1.5 text-xs font-mono pl-3 border-l shrink-0 ${
          isDark
            ? 'text-zinc-400 border-emerald-950/80'
            : 'text-slate-500 border-slate-200'
        }`}>
          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
          <span>{todayStr}</span>
        </div>
      </div>

      {/* Middle: Quick Search (Desktop) */}
      <div className="flex-1 max-w-md hidden sm:block mx-2">
        <div className="relative">
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search crops, soil sensors, pest risks, or mandi prices..."
            value={searchVal}
            onChange={handleSearchChange}
            className={`w-full pl-9 pr-4 py-1.5 rounded-lg text-xs transition-colors border focus:outline-none ${
              isDark
                ? 'bg-emerald-950/30 border-emerald-900/60 text-zinc-200 placeholder-zinc-500 focus:border-emerald-500/60'
                : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white'
            }`}
          />
        </div>
      </div>

      {/* Mobile Search Input Overlay */}
      {isMobileSearchOpen && (
        <div className={`sm:hidden absolute top-16 left-0 right-0 p-3 border-b shadow-lg z-40 backdrop-blur-md ${
          isDark ? 'bg-[#09140e]/95 border-emerald-900/60' : 'bg-white/95 border-slate-200'
        }`}>
          <div className="relative flex items-center gap-2">
            <Search className={`w-4 h-4 absolute left-3 ${isDark ? 'text-zinc-400' : 'text-slate-400'}`} />
            <input
              type="text"
              autoFocus
              placeholder="Search crops, soil sensors, mandi rates..."
              value={searchVal}
              onChange={handleSearchChange}
              className={`w-full pl-9 pr-8 py-2 rounded-lg text-xs border focus:outline-none ${
                isDark
                  ? 'bg-black/40 border-emerald-800 text-white placeholder-zinc-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
            <button
              onClick={() => {
                setIsMobileSearchOpen(false);
                setSearchVal('');
                if (onSearchQuery) onSearchQuery('');
              }}
              className="absolute right-2 p-1 text-zinc-400 hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Right side: Mobile Search Toggle, Theme Toggle, Notifications, & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Mobile Search Button */}
        <button
          onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          className={`sm:hidden p-2 rounded-lg transition-colors ${
            isDark
              ? 'text-zinc-400 hover:text-white hover:bg-emerald-950/40'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Search"
          aria-label="Open Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Light / Dark Mode Toggle Icon */}
        <button
          onClick={toggleTheme}
          id="dashboard-theme-toggle-btn"
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          className={`p-2 rounded-lg transition-all border shrink-0 active:scale-95 ${
            isDark
              ? 'text-amber-400 hover:text-amber-300 hover:bg-emerald-950/40 border-emerald-800/30'
              : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200 shadow-xs'
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative shrink-0">
          <button
            id="notifications-bell-btn"
            onClick={() => {
              setNotifDropdownOpen(!notifDropdownOpen);
              setFarmDropdownOpen(false);
              setProfileDropdownOpen(false);
            }}
            className={`relative p-2 rounded-lg transition-colors active:scale-95 ${
              isDark
                ? 'text-zinc-400 hover:text-white hover:bg-emerald-950/40'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className={`absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ${
                isDark ? 'ring-[#08100c]' : 'ring-white'
              }`} />
            )}
          </button>

          {notifDropdownOpen && (
            <div className={`fixed left-3 right-3 sm:left-auto sm:right-0 sm:absolute top-16 sm:top-auto sm:mt-2 sm:w-96 max-w-sm rounded-xl border shadow-2xl p-3 z-50 text-xs ${
              isDark
                ? 'bg-[#0b1611] border-emerald-800/60'
                : 'bg-white border-emerald-200 shadow-slate-300/40'
            }`}>
              <div className={`flex items-center justify-between pb-2 border-b ${
                isDark ? 'border-emerald-950/80' : 'border-slate-100'
              }`}>
                <div className="flex items-center gap-1.5">
                  <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>Farm Intelligence Alerts</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-500 font-mono text-[10px]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-emerald-600 hover:text-emerald-500 underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className={`divide-y max-h-72 overflow-y-auto mt-2 space-y-1 ${
                isDark ? 'divide-emerald-950/60' : 'divide-slate-100'
              }`}>
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                      n.read
                        ? isDark
                          ? 'opacity-60 hover:opacity-100 hover:bg-emerald-950/20'
                          : 'opacity-60 hover:opacity-100 hover:bg-slate-50'
                        : isDark
                          ? 'bg-emerald-950/40 hover:bg-emerald-950/60'
                          : 'bg-emerald-50/70 hover:bg-emerald-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {n.type === 'danger' && <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                        {n.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        {n.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                        {n.type === 'info' && <Info className="w-3.5 h-3.5 text-cyan-500 shrink-0" />}
                        <span className={`font-medium ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>{n.title}</span>
                      </div>
                      <span className={`text-[10px] font-mono shrink-0 ${isDark ? 'text-zinc-400' : 'text-slate-400'}`}>{n.time}</span>
                    </div>
                    <p className={`text-[11px] mt-1 pl-5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu (Always visible & shrink-safe) */}
        <div className="relative shrink-0">
          <button
            id="user-profile-btn"
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setFarmDropdownOpen(false);
              setNotifDropdownOpen(false);
            }}
            className={`flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-lg border transition-colors shrink-0 active:scale-95 ${
              isDark
                ? 'hover:bg-emerald-950/40 border-transparent hover:border-emerald-800/40'
                : 'hover:bg-slate-100 border-transparent hover:border-slate-200'
            }`}
            title="User Profile & Settings"
            aria-label="User Profile"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-lime-500 flex items-center justify-center text-white text-xs font-bold font-mono shadow-xs shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <span className={`text-xs font-medium hidden md:inline-block ${
              isDark ? 'text-zinc-300' : 'text-slate-700'
            }`}>
              {user?.name || 'Agronomist'}
            </span>
            <ChevronDown className={`w-3 h-3 hidden md:inline-block shrink-0 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
          </button>

          {profileDropdownOpen && (
            <div className={`fixed left-3 right-3 sm:left-auto sm:right-0 sm:absolute top-16 sm:top-auto sm:mt-2 sm:w-56 max-w-sm rounded-xl border shadow-2xl p-2 z-50 text-xs ${
              isDark
                ? 'bg-[#0b1611] border-emerald-800/60'
                : 'bg-white border-slate-200 shadow-slate-300/40'
            }`}>
              <div className={`p-2 border-b mb-1 ${isDark ? 'border-emerald-950/80' : 'border-slate-100'}`}>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name || 'Agronomist'}</p>
                <p className={`text-[11px] truncate ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{user?.email || 'ramesh@agrivision.com'}</p>
                <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                  isDark
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  {user?.role || 'Lead Agronomist'}
                </span>
              </div>
              {onSelectTab && (
                <button
                  onClick={() => {
                    onSelectTab('settings');
                    setProfileDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-colors mb-1 ${
                    isDark ? 'text-zinc-200 hover:bg-emerald-950/40' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 text-emerald-400" />
                  <span>IoT Devices & Settings</span>
                </button>
              )}
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
