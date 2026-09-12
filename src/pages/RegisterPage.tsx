import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, ArrowRight, Lock, Mail, User, Building, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ParticleBackground } from '../components/ParticleBackground';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [farmName, setFarmName] = useState('');
  const [role, setRole] = useState('Farm Owner');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ name, email, password, farmName, role });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to register account.');
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
            Register your farm unit to synchronize IoT sensors
          </p>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-2xl bg-[#0c1812]/90 border border-emerald-800/40 shadow-2xl backdrop-blur-xl space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Vikram Patel"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#08100c] border border-emerald-900/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="vikram@patelfarms.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#08100c] border border-emerald-900/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Farm / Enterprise Name</label>
              <div className="relative">
                <Building className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Patel Agro Precisions"
                  value={farmName}
                  onChange={e => setFarmName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#08100c] border border-emerald-900/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#08100c] border border-emerald-900/80 text-zinc-100 focus:outline-none focus:border-emerald-400"
              >
                <option>Farm Owner</option>
                <option>Agronomist</option>
                <option>Agriculture Researcher</option>
                <option>Enterprise Manager</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#08100c] border border-emerald-900/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-500 hover:to-lime-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg border border-emerald-400/30"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Farm Account</span>}
            </button>
          </form>

          <div className="pt-4 border-t border-emerald-950 text-center text-xs text-zinc-400">
            Already registered?{' '}
            <Link to="/login" className="text-emerald-400 font-medium hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
