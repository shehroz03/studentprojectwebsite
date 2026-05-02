import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../utils/auth';

export const ProfileSettings = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulating API call
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 md:p-12"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Profile Settings</h2>
            <p className="text-gray-400">Manage your account details and security.</p>
          </div>

          {message.text && (
            <div className={`p-4 rounded-xl mb-8 text-sm ${
              message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}>
              {message.text}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-12">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-accent-blue" />
                Personal Information
              </h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="email"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-accent-blue hover:bg-blue-600 px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg shadow-blue-500/20 flex items-center space-x-2"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                <span>Save Changes</span>
              </button>
            </form>

            <form className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-accent-cyan" />
                Security
              </h3>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Current Password</label>
                <input
                  type="password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan transition-all"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">New Password</label>
                <input
                  type="password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan transition-all"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="bg-accent-cyan/10 hover:bg-accent-cyan/20 border border-accent-cyan/30 text-accent-cyan px-8 py-3 rounded-xl font-bold transition-all"
              >
                Update Password
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
