import React, { useState } from 'react';
import {
  Search,
  Bell,
  Calendar,
  ChevronDown,
  User,
  LogOut,
  MapPin,
  Menu,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFarm } from '../context/FarmContext';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onSearchQuery?: (q: string) => void;
}

export const DashboardHeader: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onSearchQuery,
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
  const [searchVal, setSearchVal] = useState('');

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

  return (
    <header className={`sticky top-0 z-20 h-16 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors duration-300 border-b ${
      isDark
        ? 'bg-[#08100c]/90 border-emerald-950/70 text-white'
        : 'bg-white/90 border-emerald-100 text-slate-900 shadow-xs'
    }`}>
      {/* Left side: Mobile trigger & Farm selector & Date */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className={`md:hidden p-2 rounded-lg transition-colors ${
            isDark
              ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          aria-label="Open Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Farm Selector Dropdown */}
        <div className="relative">
          <button
            id="farm-selector-btn"
            onClick={() => {
              setFarmDropdownOpen(!farmDropdownOpen);
              setNotifDropdownOpen(false);
              setProfileDropdownOpen(false);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors border ${
              isDark
                ? 'bg-emerald-950/40 hover:bg-emerald-900/40 border-emerald-800/40 text-zinc-200'
                : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900 font-medium'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-medium max-w-[150px] sm:max-w-[220px] truncate">{selectedFarm}</span>
            <ChevronDown className={`w-3.5 h-3.5 ${isDark ? 'text-zinc-400' : 'text-slate-400'}`} />
          </button>

          {farmDropdownOpen && (
            <div className={`absolute left-0 mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-72 rounded-xl border shadow-2xl p-2 z-50 text-xs ${
              isDark
                ? 'bg-[#0b1611] border-emerald-800/60'
                : 'bg-white border-emerald-200 shadow-slate-300/40'
            }`}>
              <div className={`px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider ${
                isDark ? 'text-zinc-400' : 'text-slate-500'
              }`}>
                Select Active Farm Plot
              </div>
              <div className="space-y-1 mt-1">
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
                    {selectedFarm === farm && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Current Date Badge */}
        <div className={`hidden lg:flex items-center gap-1.5 text-xs font-mono pl-3 border-l ${
          isDark
            ? 'text-zinc-400 border-emerald-950/80'
            : 'text-slate-500 border-slate-200'
        }`}>
          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
          <span>{todayStr}</span>
        </div>
      </div>

      {/* Middle: Quick Search */}
      <div className="flex-1 max-w-md hidden sm:block">
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

      {/* Right side: Theme Toggle, Notifications, Telemetry indicator & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Light / Dark Mode Toggle Icon */}
        <button
          onClick={toggleTheme}
          id="dashboard-theme-toggle-btn"
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          className={`p-2 rounded-lg transition-all border ${
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
        <div className="relative">
          <button
            id="notifications-bell-btn"
            onClick={() => {
              setNotifDropdownOpen(!notifDropdownOpen);
              setFarmDropdownOpen(false);
              setProfileDropdownOpen(false);
            }}
            className={`relative p-2 rounded-lg transition-colors ${
              isDark
                ? 'text-zinc-400 hover:text-white hover:bg-emerald-950/40'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className={`absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ${
                isDark ? 'ring-[#08100c]' : 'ring-white'
              }`} />
            )}
          </button>

          {notifDropdownOpen && (
            <div className={`fixed sm:absolute right-3 sm:right-0 top-16 sm:top-auto sm:mt-2 w-[calc(100vw-1.5rem)] max-w-sm sm:w-96 rounded-xl border shadow-2xl p-3 z-50 text-xs ${
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
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-500 font-mono text-[10px]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-emerald-600 hover:text-emerald-500 underline"
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

        {/* Profile Menu */}
        <div className="relative">
          <button
            id="user-profile-btn"
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setFarmDropdownOpen(false);
              setNotifDropdownOpen(false);
            }}
            className={`flex items-center gap-2 p-1.5 rounded-lg border transition-colors ${
              isDark
                ? 'hover:bg-emerald-950/40 border-transparent hover:border-emerald-800/40'
                : 'hover:bg-slate-100 border-transparent hover:border-slate-200'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-lime-500 flex items-center justify-center text-white text-xs font-bold font-mono">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <span className={`text-xs font-medium hidden md:inline-block ${
              isDark ? 'text-zinc-300' : 'text-slate-700'
            }`}>
              {user?.name || 'Agronomist'}
            </span>
            <ChevronDown className={`w-3 h-3 hidden md:inline-block ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
          </button>

          {profileDropdownOpen && (
            <div className={`absolute right-0 mt-2 w-56 rounded-xl border shadow-2xl p-2 z-50 text-xs ${
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
