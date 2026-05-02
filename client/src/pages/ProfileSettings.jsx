import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Save, ArrowLeft, CheckCircle, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const ProfileSettings = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  if (!user) { navigate('/login'); return null; }

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/auth/update-profile.php', {
        id: user.id,
        name,
        email
      });
      const updated = { ...user, name, email };
      localStorage.setItem('user', JSON.stringify(updated));
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await api.post('/auth/change-password.php', {
        id: user.id,
        current_password: currentPassword,
        new_password: newPassword
      });
      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Password change failed');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="pt-24 pb-10 px-4 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <button onClick={() => navigate('/dashboard')}
            className="p-2 glass rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
            <p className="text-gray-400 text-sm">Manage your account information</p>
          </div>
        </div>

        {/* Feedback */}
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/20 text-green-400 px-5 py-3 rounded-xl mb-5 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">{success}</span>
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-3 rounded-xl mb-5 text-sm">
            {error}
          </motion.div>
        )}

        {/* Avatar */}
        <div className="glass-card p-8 mb-6">
          <div className="flex items-center space-x-5 mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-blue to-accent-cyan flex items-center justify-center text-3xl font-bold text-white select-none">
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-accent-blue p-1.5 rounded-full border-2 border-primary">
                <Camera className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <div className="text-white text-xl font-bold">{name}</div>
              <div className="text-gray-400 text-sm">{email}</div>
              <div className="mt-1">
                <span className="text-xs bg-accent-blue/20 text-accent-blue px-2 py-0.5 rounded-full capitalize">{user.role}</span>
              </div>
            </div>
          </div>

          {/* Update Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <h3 className="text-base font-semibold text-white border-b border-white/10 pb-3">Personal Information</h3>

            <div>
              <label className="text-sm text-gray-400 block mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-blue text-sm" />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-blue text-sm" />
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="w-full bg-accent-blue hover:bg-blue-600 py-3 rounded-xl text-white font-bold transition-all flex items-center justify-center space-x-2">
              {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Save className="w-4 h-4" /><span>Save Changes</span></>}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="glass-card p-8 mb-6">
          <form onSubmit={handleChangePassword} className="space-y-5">
            <h3 className="text-base font-semibold text-white border-b border-white/10 pb-3">Change Password</h3>

            {[
              { label: 'Current Password', value: currentPassword, setter: setCurrentPassword },
              { label: 'New Password', value: newPassword, setter: setNewPassword },
              { label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword },
            ].map(({ label, value, setter }) => (
              <div key={label}>
                <label className="text-sm text-gray-400 block mb-1.5">{label}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input type="password" value={value} onChange={e => setter(e.target.value)} required
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-blue text-sm placeholder-gray-600" />
                </div>
              </div>
            ))}

            <button type="submit" disabled={saving}
              className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl text-white font-bold transition-all">
              Update Password
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="glass-card p-6 border border-red-500/20">
          <h3 className="text-base font-semibold text-red-400 mb-4">Danger Zone</h3>
          <button onClick={handleLogout}
            className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 py-3 rounded-xl font-semibold transition-all text-sm">
            Logout from Account
          </button>
        </div>
      </div>
    </div>
  );
};
