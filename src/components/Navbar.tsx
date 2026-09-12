import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sprout, BarChart3, Activity, ArrowRight, ShieldCheck, Menu, X, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDashboard = location.pathname.startsWith('/dashboard');

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', `#${targetId}`);
      }
      setMobileMenuOpen(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <nav
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? isDark
            ? 'bg-[#08100c]/85 backdrop-blur-md border-b border-emerald-950/60 shadow-lg shadow-black/40'
            : 'bg-white/90 backdrop-blur-md border-b border-emerald-200/80 shadow-md shadow-emerald-950/5'
          : isDark
            ? 'bg-transparent border-b border-transparent'
            : 'bg-white/50 backdrop-blur-xs border-b border-emerald-100/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all duration-300 shadow-sm ${
              isDark
                ? 'bg-gradient-to-br from-emerald-500/20 to-lime-500/10 border border-emerald-500/30 group-hover:border-emerald-400/60 shadow-emerald-500/20'
                : 'bg-emerald-600 border border-emerald-500 shadow-emerald-600/20 text-white'
            }`}>
              <Sprout className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110 ${
                isDark ? 'text-emerald-400' : 'text-white'
              }`} />
              <div className="absolute -inset-0.5 rounded-xl bg-emerald-500/20 blur opacity-0 group-hover:opacity-100 transition duration-300" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className={`text-lg sm:text-xl font-bold tracking-tight font-['Outfit'] ${
                  isDark ? 'text-white' : 'text-zinc-900'
                }`}>
                  Agri<span className="text-emerald-500">Vision</span>
                </span>
                <span className={`hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md border ${
                  isDark
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                  Intelligence
                </span>
              </div>
              <span className={`text-[10px] sm:text-[11px] tracking-wide font-mono hidden md:inline-block ${
                isDark ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                Smart Agriculture Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {!isDashboard && (
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                onClick={e => handleSmoothScroll(e, 'features')}
                className={`text-sm font-medium transition-colors ${
                  isDark
                    ? 'text-zinc-300 hover:text-emerald-400'
                    : 'text-zinc-700 hover:text-emerald-600'
                }`}
              >
                Features
              </a>
              <a
                href="#architecture"
                onClick={e => handleSmoothScroll(e, 'architecture')}
                className={`text-sm font-medium transition-colors ${
                  isDark
                    ? 'text-zinc-300 hover:text-emerald-400'
                    : 'text-zinc-700 hover:text-emerald-600'
                }`}
              >
                Intelligence Flow
              </a>
              <a
                href="#statistics"
                onClick={e => handleSmoothScroll(e, 'statistics')}
                className={`text-sm font-medium transition-colors ${
                  isDark
                    ? 'text-zinc-300 hover:text-emerald-400'
                    : 'text-zinc-700 hover:text-emerald-600'
                }`}
              >
                Metrics
              </a>
              <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono border ${
                isDark
                  ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Telemetry: Kaveri Basin Live</span>
              </div>
            </div>
          )}

          {/* Action CTAs + Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button (Light/Dark Mode) */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 shadow-sm group ${
                isDark
                  ? 'bg-[#0d1f14]/90 hover:bg-[#132c1c] border-emerald-500/40 text-amber-300 hover:text-amber-200'
                  : 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200 text-emerald-800 hover:text-emerald-950'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme Mode"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-300 group-hover:rotate-45 transition-transform duration-300" />
                  <span className="text-xs font-mono font-medium pr-0.5">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-emerald-800 group-hover:-rotate-12 transition-transform duration-300" />
                  <span className="text-xs font-mono font-medium pr-0.5">Dark</span>
                </>
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  id="nav-dashboard-btn"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-lg shadow-sm shadow-emerald-900/40 border border-emerald-400/30 transition-all hover:scale-[1.02]"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <div className={`flex items-center gap-2 pl-3 border-l ${
                  isDark ? 'border-emerald-900/50' : 'border-zinc-200'
                }`}>
                  <span className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {user?.name?.split(' ')[0]}
                  </span>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className={`p-1.5 rounded-md transition-colors text-xs ${
                      isDark
                        ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                        : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'
                    }`}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  id="nav-login-btn"
                  className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all border ${
                    isDark
                      ? 'text-zinc-300 hover:text-white hover:bg-emerald-950/40 border-transparent hover:border-emerald-800/40'
                      : 'text-zinc-700 hover:text-emerald-900 hover:bg-emerald-50 border-transparent hover:border-emerald-200'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/dashboard"
                  id="nav-explore-btn"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-lg shadow-md shadow-emerald-950/50 border border-emerald-400/30 transition-all hover:scale-[1.02]"
                >
                  <span>Explore Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions: Theme Toggle + Menu */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-colors ${
                isDark
                  ? 'bg-[#0d1f14] border-emerald-600/40 text-amber-300'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme Mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              to="/dashboard"
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg active:scale-95 transition-transform border ${
                isDark
                  ? 'text-emerald-300 bg-emerald-950/70 border-emerald-700/50'
                  : 'text-white bg-emerald-600 border-emerald-500'
              }`}
            >
              Dashboard
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-zinc-400 hover:text-white active:bg-zinc-800/60'
                  : 'text-zinc-600 hover:text-zinc-900 active:bg-zinc-100'
              }`}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-500" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-b backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 ${
          isDark
            ? 'bg-[#08100c]/95 border-emerald-900/60'
            : 'bg-white/95 border-emerald-100 shadow-xl'
        }`}>
          <a
            href="#features"
            onClick={e => handleSmoothScroll(e, 'features')}
            className={`block px-3 py-2 text-base font-medium rounded-md ${
              isDark
                ? 'text-zinc-300 hover:text-emerald-400 hover:bg-emerald-950/30'
                : 'text-zinc-700 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            Features
          </a>
          <a
            href="#architecture"
            onClick={e => handleSmoothScroll(e, 'architecture')}
            className={`block px-3 py-2 text-base font-medium rounded-md ${
              isDark
                ? 'text-zinc-300 hover:text-emerald-400 hover:bg-emerald-950/30'
                : 'text-zinc-700 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            Intelligence Flow
          </a>
          <a
            href="#statistics"
            onClick={e => handleSmoothScroll(e, 'statistics')}
            className={`block px-3 py-2 text-base font-medium rounded-md ${
              isDark
                ? 'text-zinc-300 hover:text-emerald-400 hover:bg-emerald-950/30'
                : 'text-zinc-700 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            Metrics
          </a>
          <div className={`pt-3 border-t flex flex-col gap-2 ${
            isDark ? 'border-emerald-900/40' : 'border-zinc-200'
          }`}>
            <button
              onClick={() => {
                toggleTheme();
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-center gap-2 py-2 text-xs font-mono rounded-lg border ${
                isDark
                  ? 'bg-emerald-950/40 border-emerald-800 text-amber-300'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
            </button>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Explore Dashboard</span>
            </Link>
            {!isAuthenticated ? (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full text-center py-2 text-sm ${
                  isDark ? 'text-zinc-300 hover:text-white' : 'text-zinc-700 hover:text-emerald-900'
                }`}
              >
                Sign In
              </Link>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-center py-2 text-sm ${
                  isDark ? 'text-zinc-400 hover:text-rose-400' : 'text-zinc-600 hover:text-rose-600'
                }`}
              >
                Sign Out ({user?.name})
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

