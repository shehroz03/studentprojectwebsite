import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { getUser } from '../utils/auth';

// ─── HARDCODED ADMIN CREDENTIALS ──────────────────────────────
const ADMIN_ID   = 'admin';
const ADMIN_PASS = '112233445566';
// ─────────────────────────────────────────────────────────────

export const AdminLogin = () => {
  const [adminId, setAdminId]     = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const navigate = useNavigate();

  // Already logged in as admin → redirect
  useEffect(() => {
    const u = getUser();
    if (u?.role === 'admin') navigate('/admin');
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (adminId.trim() !== ADMIN_ID || password !== ADMIN_PASS) {
      setError('Invalid Admin ID or Password.');
      setLoading(false);
      return;
    }

    try {
      // Sign into Supabase so RLS policies work
      let authData = null;
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@bsthub.com',
        password: ADMIN_PASS,
      });

      if (signInError) {
        // First time — create the account
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'admin@bsthub.com',
          password: ADMIN_PASS,
          options: { data: { name: 'Admin' } },
        });
        if (signUpError) throw signUpError;
        authData = signUpData;
      } else {
        authData = signInData;
      }

      // Ensure profile row exists with role = 'admin'
      if (authData?.user) {
        await supabase.from('profiles').upsert(
          { id: authData.user.id, name: 'Admin', email: 'admin@bsthub.com', role: 'admin' },
          { onConflict: 'id' }
        );
      }

      const adminUser = {
        id: authData?.user?.id || 'admin-master',
        email: 'admin@bsthub.com',
        name: 'Admin',
        role: 'admin',
      };
      localStorage.setItem('user', JSON.stringify(adminUser));
      navigate('/admin');
    } catch (err) {
      setError('Admin login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6"
         style={{ background: 'radial-gradient(ellipse at top, #0f172a 0%, #020617 100%)' }}>

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1,   y: 0  }}
        transition={{ duration: 0.4 }}
        className="relative glass-card p-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Admin Access</h1>
          <p className="text-gray-400 text-sm">Restricted — Authorized Personnel Only</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Admin ID */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Admin ID</label>
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                required
                autoComplete="off"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                placeholder="Enter Admin ID"
                value={adminId}
                onChange={e => setAdminId(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type={showPass ? 'text' : 'password'}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl font-bold text-white transition-all shadow-lg shadow-red-600/20 flex items-center justify-center space-x-2 mt-2"
          >
            {loading
              ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><LogIn className="w-5 h-5" /><span>Access Admin Panel</span></>
            }
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/login" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
            ← Back to Student Login
          </a>
        </div>
      </motion.div>
    </div>
  );
};
