import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Sprout,
  Droplets,
  CloudSun,
  Bug,
  TrendingUp,
  IndianRupee,
  ClipboardList,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export type DashboardTab =
  | 'overview'
  | 'crops'
  | 'soil'
  | 'weather'
  | 'pest'
  | 'yield'
  | 'market'
  | 'activity'
  | 'settings';

interface SidebarProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const DashboardSidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Prevent background scrolling when mobile sidebar is open & allow Escape to close
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCloseMobile();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileOpen, onCloseMobile]);

  const menuItems = [
    { id: 'overview' as DashboardTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'crops' as DashboardTab, label: 'Crop Health', icon: Sprout, badge: '7 Crops' },
    { id: 'soil' as DashboardTab, label: 'Soil & Irrigation', icon: Droplets },
    { id: 'weather' as DashboardTab, label: 'Weather', icon: CloudSun },
    {
      id: 'pest' as DashboardTab,
      label: 'Pest & Disease',
      icon: Bug,
      badge: '1 Alert',
      badgeColor: isDark
        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
        : 'bg-rose-100 text-rose-700 border-rose-200',
    },
    { id: 'yield' as DashboardTab, label: 'Yield Analytics', icon: TrendingUp },
    { id: 'market' as DashboardTab, label: 'Market Prices', icon: IndianRupee },
    { id: 'activity' as DashboardTab, label: 'Farm Activity', icon: ClipboardList },
    { id: 'settings' as DashboardTab, label: 'IoT & Settings', icon: Settings },
  ];

  const renderSidebarContent = (isMobileView: boolean = false) => {
    const collapsed = isMobileView ? false : isCollapsed;

    return (
      <div
        className={`flex flex-col h-full select-none transition-colors duration-300 border-r ${
          isDark
            ? 'bg-[#08100c] border-emerald-950/70 text-white'
            : 'bg-white border-emerald-100 text-slate-900 shadow-xs'
        }`}
      >
        {/* Sidebar Header Brand */}
        <div
          className={`flex items-center justify-between px-4 border-b h-16 shrink-0 ${
            isDark ? 'border-emerald-950/70' : 'border-emerald-100'
          }`}
        >
          <Link
            to="/"
            onClick={isMobileView ? onCloseMobile : undefined}
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 shrink-0">
              <Sprout className="w-4 h-4" />
            </div>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span
                  className={`text-base font-bold font-['Outfit'] tracking-tight truncate ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Agri<span className="text-emerald-500">Vision</span>
                </span>
                <span
                  className={`text-[10px] font-mono truncate ${
                    isDark ? 'text-zinc-400' : 'text-slate-400'
                  }`}
                >
                  Precision Agro v2.4
                </span>
              </div>
            )}
          </Link>

          {/* Mobile close button with 44px touch target */}
          {isMobileView && (
            <button
              onClick={onCloseMobile}
              aria-label="Close navigation sidebar"
              className={`p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors active:scale-95 ${
                isDark
                  ? 'text-zinc-400 hover:text-white hover:bg-emerald-950/50'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Desktop collapse toggle */}
          {!isMobileView && (
            <button
              onClick={onToggleCollapse}
              className={`p-1.5 rounded-md transition-colors ${
                isDark
                  ? 'text-zinc-400 hover:text-emerald-400 hover:bg-emerald-950/40'
                  : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-${item.id}-btn`}
                title={collapsed ? item.label : undefined}
                onClick={() => {
                  onSelectTab(item.id);
                  if (isMobileView) {
                    onCloseMobile();
                  }
                }}
                className={`w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative active:scale-[0.98] ${
                  isActive
                    ? isDark
                      ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-700/40 shadow-sm shadow-emerald-950/30'
                      : 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-semibold shadow-xs'
                    : isDark
                    ? 'text-zinc-400 hover:text-zinc-100 hover:bg-emerald-950/20 border border-transparent'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive
                      ? 'text-emerald-500'
                      : isDark
                      ? 'text-zinc-400'
                      : 'text-slate-400'
                  }`}
                />
                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between overflow-hidden text-left">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full border font-mono shrink-0 ml-1.5 ${
                          item.badgeColor ||
                          (isDark
                            ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/40'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200 font-medium')
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer quick telemetry widget in sidebar */}
        {!collapsed && (
          <div
            className={`p-3 m-2.5 rounded-xl border shrink-0 ${
              isDark
                ? 'bg-emerald-950/20 border-emerald-800/30 text-zinc-400'
                : 'bg-emerald-50/70 border-emerald-200 text-slate-600'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Sensor Mesh Health
              </span>
              <span className="font-mono text-emerald-600 font-bold">98.4%</span>
            </div>
            <div
              className={`w-full h-1.5 rounded-full overflow-hidden ${
                isDark ? 'bg-emerald-950/60' : 'bg-slate-200'
              }`}
            >
              <div className="bg-emerald-500 h-full rounded-full w-[98%]" />
            </div>
            <p
              className={`text-[10px] mt-2 font-mono truncate ${
                isDark ? 'text-zinc-500' : 'text-slate-400'
              }`}
            >
              Gateway: IN-SOUTH-LORA-4
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop Persistent Sidebar with smooth width transition */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 ease-in-out z-30 sticky top-0 h-screen ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Animated Slide-in Drawer with smooth backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop with smooth fade */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={onCloseMobile}
              aria-hidden="true"
            />

            {/* Slide-in Drawer Panel with spring physics */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 27, stiffness: 280 }}
              className="relative w-72 max-w-[85vw] h-full z-10 shadow-2xl overflow-hidden"
            >
              {renderSidebarContent(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
