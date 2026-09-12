import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, ArrowRight, Lock, Mail, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ParticleBackground } from '../components/ParticleBackground';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    try {
      await loginAsDemo();
      navigate('/dashboard');
    } catch (err) {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#08100c] text-white flex items-center justify-center p-4 selection:bg-emerald-500/30">
      <ParticleBackground density={30} />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold font-['Outfit'] text-white">
              Agri<span className="text-emerald-400">Vision</span>
            </span>
          </Link>
          <p className="text-xs text-zinc-400">
            Sign in to access your farm intelligence nodes & sensors
          </p>
        </div>

        {/* Auth Card */}
        <div className="p-8 rounded-2xl bg-[#0c1812]/90 border border-emerald-800/40 shadow-2xl backdrop-blur-xl space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* 1-Click Demo Login */}
          <div>
            <button
              id="demo-login-btn"
              type="button"
              onClick={handleDemoSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-500 hover:to-lime-500 text-white font-bold text-xs tracking-wide uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/50 border border-emerald-400/40 hover:scale-[1.01]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-lime-200" />
                  <span>Instant Demo Sign-In (Agronomist)</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-zinc-400 text-center mt-1.5 font-mono">
              Pre-loaded with Kaveri Basin IoT sample telemetry
            </p>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-emerald-950 w-full" />
            <span className="bg-[#0c1812] px-3 text-[11px] text-zinc-400 font-mono">
              OR EMAIL LOGIN
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="ramesh@agrivision.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#08100c] border border-emerald-900/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-zinc-300 font-medium">Password</label>
                <span className="text-[10px] text-emerald-400 hover:underline cursor-pointer">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#08100c] border border-emerald-900/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-emerald-800/60 hover:bg-emerald-700/60 text-emerald-200 border border-emerald-600/40 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Sign In with Credentials</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-4 border-t border-emerald-950 text-center text-xs text-zinc-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-400 font-medium hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
