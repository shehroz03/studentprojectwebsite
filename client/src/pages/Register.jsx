import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import { getUser } from '../utils/auth';
import { useLang } from '../context/LanguageContext';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useLang();

  const user = getUser();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, []);

  if (user) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register.php', { name, email, password });
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || t('register','failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-40 pb-20 px-6 flex justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">{t('register','title')}</h2>
          <p className="text-gray-400">{t('register','subtitle')}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">{t('register','fullName')}</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text" required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">{t('register','email')}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="email" required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
                placeholder="email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">{t('register','password')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type={showPass ? 'text' : 'password'} required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-accent-blue hover:bg-blue-600 py-3 rounded-xl font-bold text-white transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2">
            {loading
              ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><UserPlus className="w-5 h-5" /><span>{t('register','btn')}</span></>}
          </button>
        </form>

        <div className="mt-8 text-center text-gray-400 text-sm">
          {t('register','hasAccount')} <Link to="/login" className="text-accent-blue font-semibold hover:underline">{t('register','login')}</Link>
        </div>
      </motion.div>
    </div>
  );
};
